import { execFileSync } from "node:child_process";
import { createHmac, randomUUID } from "node:crypto";
import {
  type APIRequestContext,
  expect as playwrightExpect,
  test,
} from "@playwright/test";

const expect = playwrightExpect.configure({ timeout: 30_000 });

const userAgent =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36";
test.use({ userAgent });

const apiURL = process.env.E2E_ROUTINE_API_URL;
const database = process.env.E2E_ROUTINE_DATABASE;
const enabled = Boolean(
  apiURL &&
    database?.startsWith("notegic_routine_acceptance_") &&
    process.env.E2E_RUN_ROUTINE_BACKEND === "true"
);

const queryDatabase = (query: string) => {
  if (!database?.match(/^notegic_routine_acceptance_[a-z0-9_]+$/))
    throw new Error("Routine E2E requires a dedicated acceptance database");
  return execFileSync(
    "docker",
    [
      "exec",
      "notegic-db",
      "psql",
      "-U",
      "notegic_admin",
      "-d",
      database,
      "-v",
      "ON_ERROR_STOP=1",
      "-Atc",
      query,
    ],
    { encoding: "utf8" }
  ).trim();
};

const callAPI = async (
  request: APIRequestContext,
  method: "GET" | "POST" | "PUT",
  path: string,
  csrfToken: string,
  data?: unknown
) => {
  const response = await request.fetch(`${apiURL}/api/development/v1/${path}`, {
    method,
    data,
    headers: {
      "User-Agent": userAgent,
      Origin: "http://127.0.0.1:4173",
      "X-CSRF-Token": csrfToken,
    },
  });
  if (!response.ok())
    throw new Error(
      `${method} ${path}: ${response.status()} ${await response.text()}`
    );
  const result = await response.json();
  expect(result.success).toBe(true);
  return result.data;
};

test("expired access and a missing session cache renew before updating a graph task", async ({
  page,
  request,
}) => {
  test.skip(!enabled, "requires explicitly isolated live backend and database");
  const accessSecret = process.env.E2E_ROUTINE_ACCESS_TOKEN_SECRET;
  test.skip(
    !accessSecret?.startsWith("routine-refresh-fixture-"),
    "requires an isolated Core and Gateway using the same fixture access secret"
  );
  test.setTimeout(180_000);
  page.setDefaultNavigationTimeout(60_000);

  const name = `Refresh${randomUUID().replaceAll("-", "").slice(0, 12)}`;
  const password = "RoutineAcceptance123!";
  const registration = await callAPI(request, "POST", "auth/register", "", {
    name,
    email: `${name}@example.invalid`,
    password,
  });
  const station = await callAPI(
    request,
    "POST",
    "stations/",
    registration.csrfToken,
    { name, description: "Retained isolated refresh regression" }
  );
  const startAt = new Date(Date.now() + 3_600_000);
  startAt.setSeconds(0, 0);
  const routine = await callAPI(
    request,
    "POST",
    `routines/station/${station.id}`,
    registration.csrfToken,
    {
      title: name,
      description: "",
      isActive: false,
      scheduledStartAt: startAt.toISOString(),
      scheduledEndAt: new Date(startAt.getTime() + 3_600_000).toISOString(),
      timezone: "UTC",
      timeoutSeconds: 60,
    }
  );
  const action = await callAPI(
    request,
    "POST",
    `routine-tasks/routine/${routine.id}`,
    registration.csrfToken,
    {
      title: "Before idle",
      kind: "Action",
      payload: {
        schemaVersion: 1,
        purpose: "GetRoutine",
        routineId: routine.id,
      },
      expectedDefinitionVersion: 1,
    }
  );
  await page.goto("/login");
  await page.locator("html[data-density]").waitFor({ timeout: 60_000 });
  await page.getByLabel("Account").fill(name);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await expect(page).toHaveURL(/\/app\/dashboard\/?$/);
  await expect(
    page.getByRole("menuitem").filter({ hasText: name })
  ).toBeVisible();
  await page.goto(`/app/routines/${routine.id}/dependency-graph-editor`);
  await expect(
    page.locator(`.react-flow__node[data-id="${action.id}"]`)
  ).toBeVisible();

  const cookies = await page.context().cookies();
  const accessCookie = cookies.find(cookie => cookie.name === "accessToken");
  expect(accessCookie).toBeDefined();
  const [header, payload, signature] = accessCookie!.value.split(".");
  expect(
    createHmac("sha256", accessSecret!)
      .update(`${header}.${payload}`)
      .digest("base64url") === signature
  ).toBe(true);
  const claims = JSON.parse(Buffer.from(payload, "base64url").toString());
  const expiredPayload = Buffer.from(
    JSON.stringify({
      ...claims,
      iat: Math.floor(Date.now() / 1000) - 3600,
      exp: Math.floor(Date.now() / 1000) - 60,
    })
  ).toString("base64url");
  const expiredSignature = createHmac("sha256", accessSecret!)
    .update(`${header}.${expiredPayload}`)
    .digest("base64url");
  const expiredAccess = `${header}.${expiredPayload}.${expiredSignature}`;

  // Expire only this new fixture's session; never flush the shared Redis database.
  const cacheExists = execFileSync(
    "docker",
    [
      "exec",
      "notegic-redis",
      "sh",
      "-c",
      'REDISCLI_AUTH="$REDIS_PASSWORD" redis-cli -n 14 EXISTS "$1" && REDISCLI_AUTH="$REDIS_PASSWORD" redis-cli -n 14 EXPIRE "$1" 0 && REDISCLI_AUTH="$REDIS_PASSWORD" redis-cli -n 14 EXISTS "$1"',
      "routine-refresh",
      `UserData:${name}`,
    ],
    { encoding: "utf8" }
  ).trim();
  expect(cacheExists.split(/\s+/)).toEqual(["1", "1", "0"]);
  await page.context().addCookies([{ ...accessCookie!, value: expiredAccess }]);

  for (const title of ["Updated after idle", "Updated using renewed session"]) {
    const result = await page.evaluate(
      async ({ routineTaskId, title, version }) => {
        const load = (path: string) => import(/* @vite-ignore */ path);
        const { mutationFnUpdateMyRoutineTaskById } = await load(
          "/src/api/invokers/routineTask.invoker.ts"
        );
        const { getClientMutationHeaders } = await load(
          "/src/api/clientHeaders.ts"
        );
        const response = await mutationFnUpdateMyRoutineTaskById({
          header: getClientMutationHeaders(),
          body: {
            routineTaskId,
            expectedDefinitionVersion: version,
            values: { title },
          },
        });
        return {
          success: response.success,
          version: response.data.definitionVersion,
        };
      },
      { routineTaskId: action.id, title, version: 2 }
    );
    expect(result).toEqual({ success: true, version: 2 });
    expect(
      queryDatabase(
        `SELECT title FROM "RoutineTaskTable" WHERE id='${action.id}'`
      )
    ).toBe(title);
    const renewed = (await page.context().cookies()).find(
      cookie => cookie.name === "accessToken"
    );
    expect(renewed?.httpOnly).toBe(true);
    expect(renewed?.value === expiredAccess).toBe(false);
    const renewedClaims = JSON.parse(
      Buffer.from(renewed!.value.split(".")[1], "base64url").toString()
    );
    expect(renewedClaims.sub === claims.sub).toBe(true);
    expect(renewedClaims.exp).toBeGreaterThan(Date.now() / 1000);
    await expect(page).toHaveURL(/\/dependency-graph-editor\/?$/);
  }
  const restored = execFileSync(
    "docker",
    [
      "exec",
      "notegic-redis",
      "sh",
      "-c",
      'REDISCLI_AUTH="$REDIS_PASSWORD" redis-cli -n 14 EXISTS "$1"',
      "routine-refresh",
      `UserData:${name}`,
    ],
    { encoding: "utf8" }
  ).trim();
  expect(restored).toBe("1");
});

test("editing a new Routine refreshes Start and Action versions and preserves real conflicts", async ({
  page,
  request,
}) => {
  test.skip(!enabled, "requires explicitly isolated live backend and database");
  test.setTimeout(180_000);
  page.setDefaultTimeout(20_000);
  page.setDefaultNavigationTimeout(60_000);

  const suffix = randomUUID().replaceAll("-", "").slice(0, 12);
  const name = `Version${suffix}`;
  const password = "RoutineAcceptance123!";
  const registration = await callAPI(request, "POST", "auth/register", "", {
    name,
    email: `${name}@example.invalid`,
    password,
  });
  const stationName = `Versions ${suffix}`;
  const station = await callAPI(
    request,
    "POST",
    "stations/",
    registration.csrfToken,
    {
      name: stationName,
      description: "Retained isolated graph version regression",
    }
  );
  const title = `Edited ${suffix}`;

  await page.goto("/login");
  await page.locator("html[data-density]").waitFor({ timeout: 60_000 });
  await page.getByLabel("Account").fill(name);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await expect(page).toHaveURL(/\/app\/dashboard\/?$/, { timeout: 30_000 });
  await expect(
    page.getByRole("menuitem").filter({ hasText: name })
  ).toBeVisible();
  const csrfToken = await page.evaluate(async () => {
    const load = (path: string) => import(/* @vite-ignore */ path);
    const { getClientCSRFToken } = await load("/src/api/clientHeaders.ts");
    return getClientCSRFToken();
  });
  expect(typeof csrfToken).toBe("string");
  await page.goto(`/app/routines/${station.id}`);
  await page
    .locator('[data-sidebar="menu-button"]')
    .filter({ hasText: stationName })
    .first()
    .click({ button: "right" });
  await page.getByRole("menuitem", { name: "Routine", exact: true }).click();
  const createRoutine = page.getByRole("dialog", {
    name: "Create routine",
    exact: true,
  });
  await createRoutine.getByLabel("Title", { exact: true }).fill(title);
  await createRoutine
    .getByRole("button", { name: "Create", exact: true })
    .click();
  await expect(createRoutine).toHaveCount(0);
  const routineId = queryDatabase(
    `SELECT id FROM "RoutineTable" WHERE station_id='${station.id}'`
  );
  expect(routineId).toMatch(/^[a-f0-9-]{36}$/);
  expect(
    queryDatabase(
      `SELECT definition_version || ':' || is_active FROM "RoutineTable" WHERE id='${routineId}'`
    )
  ).toBe("1:false");

  await page.goto(`/app/routines/${routineId}/dependency-graph-editor`);
  await expect(
    page.getByRole("button", { name: "Create", exact: true })
  ).toBeEnabled({ timeout: 30_000 });
  await page
    .locator('[data-sidebar="menu-button"]')
    .filter({ hasText: stationName })
    .click();
  const canvas = page.locator(".react-flow__viewport");
  await canvas.evaluate(node => node.setAttribute("data-retained", "true"));

  for (const [kind, minutes, version] of [
    ["Start", "2", 2],
    ["Action", "3", 4],
  ] as const) {
    await page
      .locator('[data-sidebar="menu-sub-button"]')
      .filter({ hasText: title })
      .first()
      .click({ button: "right" });
    await page
      .getByRole("menuitem", { name: "Open in inspector", exact: true })
      .click();
    await page.locator("#routine-inspector-timeout-minutes").fill(minutes);
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await expect(
      page.locator("#routine-inspector-timeout-minutes")
    ).toHaveCount(0);
    expect(
      queryDatabase(
        `SELECT definition_version FROM "RoutineTable" WHERE id='${routineId}'`
      )
    ).toBe(String(version));
    await page.getByRole("button", { name: "Create", exact: true }).click();
    if (kind === "Start") {
      await page.getByRole("menuitem", { name: "Start", exact: true }).click();
    } else {
      await page.getByRole("menuitem", { name: "Action", exact: true }).click();
      const createAction = page.getByRole("dialog", {
        name: "Create routine task",
        exact: true,
      });
      await createAction
        .getByLabel("Title", { exact: true })
        .fill("Read edited routine");
      await createAction.getByRole("combobox").click();
      await page
        .getByRole("option", { name: "Get · Routine", exact: true })
        .click();
      await createAction.locator("pre").evaluate(
        (node, payload) => {
          const clipboardData = new DataTransfer();
          clipboardData.setData("text", JSON.stringify(payload));
          node.parentElement!.dispatchEvent(
            new ClipboardEvent("paste", { bubbles: true, clipboardData })
          );
        },
        { routineId }
      );
      await createAction
        .getByRole("button", { name: "Create", exact: true })
        .click();
      await expect(createAction).toHaveCount(0);
    }
    await expect
      .poll(() =>
        queryDatabase(
          `SELECT count(*) FROM "RoutineTaskTable" WHERE routine_id='${routineId}' AND kind='${kind}'`
        )
      )
      .toBe("1");
    expect(
      queryDatabase(
        `SELECT definition_version FROM "RoutineTable" WHERE id='${routineId}'`
      )
    ).toBe(String(version + 1));
    await expect(page.locator(".react-flow__node")).toHaveCount(
      kind === "Start" ? 1 : 2
    );
    await expect(canvas).toHaveAttribute("data-retained", "true");
  }

  // An external change must not silently rebase an already opened Action draft.
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await page.getByRole("menuitem", { name: "Action", exact: true }).click();
  const staleAction = page.getByRole("dialog", {
    name: "Create routine task",
    exact: true,
  });
  await staleAction
    .getByLabel("Title", { exact: true })
    .fill("Conflicting action");
  await staleAction.getByRole("combobox").click();
  await page
    .getByRole("option", { name: "Get · Routine", exact: true })
    .click();
  await staleAction.locator("pre").evaluate(
    (node, payload) => {
      const clipboardData = new DataTransfer();
      clipboardData.setData("text", JSON.stringify(payload));
      node.parentElement!.dispatchEvent(
        new ClipboardEvent("paste", { bubbles: true, clipboardData })
      );
    },
    { routineId }
  );
  const externalEdit = await page.request.put(
    `${apiURL}/api/development/v1/routines/${routineId}`,
    {
      data: { values: { timeoutSeconds: 240 } },
      headers: {
        "User-Agent": await page.evaluate(() => navigator.userAgent),
        Origin: "http://127.0.0.1:4173",
        "X-CSRF-Token": csrfToken,
      },
    }
  );
  expect(externalEdit.ok()).toBe(true);
  let conflictingWrites = 0;
  page.on("request", request => {
    if (
      request.method() === "POST" &&
      request.url().includes("/_serverFn/") &&
      request.postData()?.includes("Conflicting action")
    )
      conflictingWrites++;
  });
  await staleAction
    .getByRole("button", { name: "Create", exact: true })
    .click();
  await expect(
    page.getByText("This routine changed. Refresh before applying your edit.", {
      exact: true,
    })
  ).toBeVisible();
  expect(conflictingWrites).toBe(1);
  await expect(staleAction.getByLabel("Title", { exact: true })).toHaveValue(
    "Conflicting action"
  );
  expect(
    queryDatabase(
      `SELECT count(*) FROM "RoutineTaskTable" WHERE routine_id='${routineId}'`
    )
  ).toBe("2");
  expect(
    queryDatabase(
      `SELECT definition_version FROM "RoutineTable" WHERE id='${routineId}'`
    )
  ).toBe("6");
  await staleAction
    .getByRole("button", { name: "Cancel", exact: true })
    .click();
  await page.reload();
  await expect(page.locator(".react-flow__node")).toHaveCount(2, {
    timeout: 30_000,
  });
  await expect(
    page.getByText("Read edited routine", { exact: true }).last()
  ).toBeVisible();
});

test("real scheduler gates Routine activation and selects only active Start branches", async ({
  page,
}) => {
  test.skip(
    !enabled,
    "requires explicitly isolated backend, worker and database"
  );
  test.setTimeout(420_000);
  const suffix = randomUUID().replaceAll("-", "").slice(0, 12);
  const registration = await callAPI(
    page.request,
    "POST",
    "auth/register",
    "",
    {
      name: `Activation${suffix}`,
      email: `Activation${suffix}@example.invalid`,
      password: "RoutineAcceptance123!",
    }
  );
  const token = registration.csrfToken;
  const station = await callAPI(page.request, "POST", "stations/", token, {
    name: `Activation ${suffix}`,
    description: "Retained scheduler activation fixture",
  });
  const startAt = new Date(Date.now() + 3_600_000);
  startAt.setSeconds(0, 0);
  const definition = {
    title: `Activation ${suffix}`,
    timeoutSeconds: 60,
    timezone: "UTC",
    period: "Daily",
    scheduledStartAt: startAt.toISOString(),
    scheduledEndAt: new Date(startAt.getTime() + 3_600_000).toISOString(),
  };
  const routine = await callAPI(
    page.request,
    "POST",
    `routines/station/${station.id}`,
    token,
    definition
  );
  expect(
    (await callAPI(page.request, "GET", `routines/${routine.id}`, token))
      .isActive
  ).toBe(false);
  const roots: string[] = [];
  const actions: string[] = [];
  let version = 1;
  for (const branch of [0, 1]) {
    const root = await callAPI(
      page.request,
      "POST",
      `routine-tasks/routine/${routine.id}`,
      token,
      {
        title: `Entry ${branch}`,
        kind: "Start",
        x: 0,
        y: 0,
        expectedDefinitionVersion: version,
        payload: { schemaVersion: 1, isActive: branch === 0 },
      }
    );
    roots.push(root.id);
    version = root.definitionVersion;
    const action = await callAPI(
      page.request,
      "POST",
      `routine-tasks/routine/${routine.id}`,
      token,
      {
        title: `Action ${branch}`,
        kind: "Action",
        x: 0,
        y: 0,
        maxAttempts: 1,
        expectedDefinitionVersion: version,
        payload: {
          schemaVersion: 1,
          purpose: "GetRoutine",
          routineId: routine.id,
        },
      }
    );
    actions.push(action.id);
    version = action.definitionVersion;
    await callAPI(
      page.request,
      "POST",
      `routine-task-dependencies/routine/${routine.id}`,
      token,
      {
        routineTaskId: action.id,
        previousRoutineTaskId: root.id,
        expectedDefinitionVersion: version,
        description: "",
        progress: 0,
      }
    );
    version++;
  }
  const capturedVersion = (
    await callAPI(page.request, "GET", `routines/${routine.id}`, token)
  ).definitionVersion;
  for (const stage of [0, 1, 2, 3]) {
    await test.step(
      [
        "paused Routine",
        "all Starts inactive",
        "first Start active",
        "second Start active",
      ][stage],
      async () => {
        await callAPI(page.request, "PUT", `routines/${routine.id}`, token, {
          values: { isActive: stage !== 0 },
        });
        for (const branch of [0, 1]) {
          const updated = await callAPI(
            page.request,
            "PUT",
            `routine-tasks/${roots[branch]}`,
            token,
            {
              expectedDefinitionVersion: capturedVersion,
              values: {
                payload: {
                  schemaVersion: 1,
                  isActive:
                    branch === 0 ? stage === 0 || stage === 2 : stage === 3,
                },
              },
            }
          );
          expect(updated.definitionVersion).toBe(capturedVersion);
        }
        expect(
          (await callAPI(page.request, "GET", `routines/${routine.id}`, token))
            .definitionVersion
        ).toBe(capturedVersion);
        queryDatabase(
          `UPDATE "RoutineTable" SET scheduled_start_at=date_trunc('minute',NOW())-interval '${stage === 3 ? 1 : 2} minutes', scheduled_end_at=date_trunc('minute',NOW())+interval '1 hour' WHERE id='${routine.id}'`
        );
        if (stage < 2) {
          const sentinel = await callAPI(
            page.request,
            "POST",
            `routines/station/${station.id}`,
            token,
            { ...definition, title: `Scheduler barrier ${stage} ${suffix}` }
          );
          const root = await callAPI(
            page.request,
            "POST",
            `routine-tasks/routine/${sentinel.id}`,
            token,
            {
              title: "Barrier entry",
              kind: "Start",
              expectedDefinitionVersion: 1,
              payload: { schemaVersion: 1, isActive: true },
            }
          );
          const action = await callAPI(
            page.request,
            "POST",
            `routine-tasks/routine/${sentinel.id}`,
            token,
            {
              title: "Barrier action",
              kind: "Action",
              expectedDefinitionVersion: root.definitionVersion,
              payload: {
                schemaVersion: 1,
                purpose: "GetRoutine",
                routineId: sentinel.id,
              },
              maxAttempts: 1,
            }
          );
          await callAPI(
            page.request,
            "POST",
            `routine-task-dependencies/routine/${sentinel.id}`,
            token,
            {
              routineTaskId: action.id,
              previousRoutineTaskId: root.id,
              expectedDefinitionVersion: action.definitionVersion,
            }
          );
          await callAPI(page.request, "PUT", `routines/${sentinel.id}`, token, {
            values: { isActive: true },
          });
          queryDatabase(
            `UPDATE "RoutineTable" SET scheduled_start_at=date_trunc('minute',NOW())-interval '1 minute',scheduled_end_at=date_trunc('minute',NOW())+interval '1 hour' WHERE id='${sentinel.id}'`
          );
          await expect
            .poll(
              () =>
                queryDatabase(
                  `SELECT status FROM "RoutineRecordTable" WHERE routine_id='${sentinel.id}'`
                ),
              { timeout: 90_000 }
            )
            .toBe("Success");
          await callAPI(page.request, "PUT", `routines/${sentinel.id}`, token, {
            values: { isActive: false },
          });
          expect(
            queryDatabase(
              `SELECT count(*) FROM "RoutineRecordTable" WHERE routine_id='${routine.id}'`
            )
          ).toBe("0");
          expect(
            queryDatabase(
              `SELECT count(*) FROM "RoutineTaskRecordTable" WHERE routine_task_id IN ('${actions[0]}','${actions[1]}','${roots[0]}','${roots[1]}')`
            )
          ).toBe("0");
        } else {
          await expect
            .poll(
              () =>
                queryDatabase(
                  `SELECT count(*) FROM "RoutineRecordTable" WHERE routine_id='${routine.id}' AND status='Success'`
                ),
              { timeout: 90_000 }
            )
            .toBe(String(stage - 1));
          for (const branch of [0, 1]) {
            expect(
              queryDatabase(
                `SELECT count(*) FROM "RoutineTaskRecordTable" WHERE routine_task_id='${actions[branch]}' AND status='Success'`
              )
            ).toBe(stage === 3 || branch === 0 ? "1" : "0");
          }
          expect(
            queryDatabase(
              `SELECT count(*) FROM "RoutineTaskRecordTable" WHERE routine_task_id IN ('${roots[0]}','${roots[1]}')`
            )
          ).toBe("0");
          const snapshot = JSON.parse(
            queryDatabase(
              `SELECT snapshot FROM "RoutineRecordTable" WHERE routine_id='${routine.id}' ORDER BY created_at DESC LIMIT 1`
            )
          );
          expect(snapshot.startingNodeIds).toEqual([roots[stage - 2]]);
          expect(
            queryDatabase(
              `SELECT bool_and(reserved_execution_micros=0 AND billed_execution_micros>0) FROM "RoutineTaskRecordTable" WHERE routine_task_id IN ('${actions[0]}','${actions[1]}')`
            )
          ).toBe("t");
        }
      }
    );
  }
  await callAPI(page.request, "PUT", `routines/${routine.id}`, token, {
    values: { isActive: false },
  });
});

test("Routine and node fields reject invalid API writes without changing stored definitions", async ({
  page,
}) => {
  test.skip(!enabled, "requires explicitly isolated backend and database");
  test.setTimeout(180_000);
  const suffix = randomUUID().replaceAll("-", "").slice(0, 12);
  const registration = await callAPI(
    page.request,
    "POST",
    "auth/register",
    "",
    {
      name: `Fields${suffix}`,
      email: `Fields${suffix}@example.invalid`,
      password: "RoutineAcceptance123!",
    }
  );
  const token = registration.csrfToken;
  const station = await callAPI(page.request, "POST", "stations/", token, {
    name: `Fields ${suffix}`,
    description: "Retained validation fixture",
  });
  const future = new Date(Date.now() + 3_600_000);
  future.setSeconds(0, 0);
  const routine = await callAPI(
    page.request,
    "POST",
    `routines/station/${station.id}`,
    token,
    {
      title: `Fields ${suffix}`,
      timeoutSeconds: 60,
      scheduledStartAt: future.toISOString(),
      scheduledEndAt: new Date(future.getTime() + 3_600_000).toISOString(),
      timezone: "UTC",
    }
  );
  const root = await callAPI(
    page.request,
    "POST",
    `routine-tasks/routine/${routine.id}`,
    token,
    {
      title: "Entry",
      kind: "Start",
      expectedDefinitionVersion: 1,
      payload: { schemaVersion: 1 },
    }
  );
  const nodes = await callAPI(
    page.request,
    "GET",
    `routine-tasks/routine/${routine.id}`,
    token
  );
  expect(nodes[0].payload.isActive).toBe(true);
  expect(nodes[0]).not.toHaveProperty("purpose");
  const boundary = await callAPI(
    page.request,
    "POST",
    `routine-tasks/routine/${routine.id}`,
    token,
    {
      title: "X".repeat(128),
      kind: "Action",
      x: -1_000_000,
      y: 1_000_000,
      maxAttempts: 20,
      expectedDefinitionVersion: root.definitionVersion,
      payload: {
        schemaVersion: 1,
        purpose: "GetRoutine",
        routineId: routine.id,
      },
    }
  );
  const version = boundary.definitionVersion;
  const base = {
    title: "Rejected",
    kind: "Action",
    x: 0,
    y: 0,
    maxAttempts: 1,
    expectedDefinitionVersion: version,
    payload: { schemaVersion: 1, purpose: "GetRoutine", routineId: routine.id },
  };
  for (const [label, values] of [
    ["empty title", { title: "" }],
    ["long title", { title: "X".repeat(129) }],
    ["unknown kind", { kind: "Unknown" }],
    ["x too low", { x: -1_000_001 }],
    ["y too high", { y: 1_000_001 }],
    ["negative attempts", { maxAttempts: -1 }],
    ["too many attempts", { maxAttempts: 21 }],
    [
      "unknown payload version",
      {
        payload: {
          schemaVersion: 2,
          purpose: "GetRoutine",
          routineId: routine.id,
        },
      },
    ],
    ["unknown purpose", { payload: { schemaVersion: 1, purpose: "Unknown" } }],
    ["missing Action purpose", { payload: { schemaVersion: 1 } }],
    [
      "Start with Action purpose",
      {
        kind: "Start",
        payload: { schemaVersion: 1, purpose: "GetRoutine", isActive: true },
      },
    ],
    [
      "non-boolean Start activation",
      { kind: "Start", payload: { schemaVersion: 1, isActive: "false" } },
    ],
    [
      "long Start description",
      {
        kind: "Start",
        payload: {
          schemaVersion: 1,
          isActive: true,
          description: "X".repeat(1025),
        },
      },
    ],
  ] as const) {
    await test.step(label, async () => {
      const response = await page.request.post(
        `${apiURL}/api/development/v1/routine-tasks/routine/${routine.id}`,
        {
          headers: {
            Origin: "http://127.0.0.1:4173",
            "User-Agent": userAgent,
            "X-CSRF-Token": token,
          },
          data: { ...base, ...values },
        }
      );
      expect.soft(response.status(), label).toBe(400);
      expect((await response.json()).success).toBe(false);
      expect(
        queryDatabase(
          `SELECT definition_version FROM "RoutineTable" WHERE id='${routine.id}'`
        )
      ).toBe(String(version));
      expect(
        queryDatabase(
          `SELECT count(*) FROM "RoutineTaskTable" WHERE routine_id='${routine.id}'`
        )
      ).toBe("2");
    });
  }
  for (const values of [
    { timeoutSeconds: 59 },
    { timeoutSeconds: 3601 },
    { timezone: "Invalid/Timezone" },
    { isActive: "false" },
  ]) {
    const response = await page.request.put(
      `${apiURL}/api/development/v1/routines/${routine.id}`,
      {
        headers: {
          Origin: "http://127.0.0.1:4173",
          "User-Agent": userAgent,
          "X-CSRF-Token": token,
        },
        data: { values },
      }
    );
    expect.soft(response.status(), JSON.stringify(values)).toBe(400);
    expect((await response.json()).success).toBe(false);
    expect(
      queryDatabase(
        `SELECT definition_version||':'||is_active FROM "RoutineTable" WHERE id='${routine.id}'`
      )
    ).toBe(`${version}:false`);
  }
  for (const [label, target, source] of [
    ["incoming Start", root.id, boundary.id],
    ["self dependency", boundary.id, boundary.id],
    ["unknown predecessor", boundary.id, randomUUID()],
  ]) {
    await test.step(label, async () => {
      const response = await page.request.post(
        `${apiURL}/api/development/v1/routine-task-dependencies/routine/${routine.id}`,
        {
          headers: {
            Origin: "http://127.0.0.1:4173",
            "User-Agent": userAgent,
            "X-CSRF-Token": token,
          },
          data: {
            routineTaskId: target,
            previousRoutineTaskId: source,
            expectedDefinitionVersion: version,
            description: "",
            progress: 0,
          },
        }
      );
      expect.soft(response.status(), label).toBeGreaterThanOrEqual(400);
      expect.soft(response.status(), label).toBeLessThan(500);
      expect((await response.json()).success).toBe(false);
      expect(
        queryDatabase(
          `SELECT definition_version FROM "RoutineTable" WHERE id='${routine.id}'`
        )
      ).toBe(String(version));
      expect(
        queryDatabase(
          `SELECT count(*) FROM "RoutineDependencyTable" WHERE routine_task_id IN ('${root.id}','${boundary.id}')`
        )
      ).toBe("0");
    });
  }
  let currentVersion = version;
  for (let index = 0; index < 14; index++) {
    const created = await callAPI(
      page.request,
      "POST",
      `routine-tasks/routine/${routine.id}`,
      token,
      {
        title: `Entry ${index + 2}`,
        kind: "Start",
        x: 0,
        y: 0,
        payload: { schemaVersion: 1, isActive: false },
        expectedDefinitionVersion: currentVersion,
      }
    );
    currentVersion = created.definitionVersion;
  }
  const candidates = [0, 1].map(index => ({
    id: randomUUID(),
    title: `Concurrent entry ${index}`,
    kind: "Start",
    x: 0,
    y: 0,
    payload: { schemaVersion: 1, isActive: false },
    expectedDefinitionVersion: currentVersion,
  }));
  const concurrentResponses = await Promise.all(
    candidates.map(data =>
      page.request.post(
        `${apiURL}/api/development/v1/routine-tasks/routine/${routine.id}`,
        {
          headers: {
            Origin: "http://127.0.0.1:4173",
            "User-Agent": userAgent,
            "X-CSRF-Token": token,
          },
          data,
        }
      )
    )
  );
  expect(concurrentResponses.filter(response => response.ok())).toHaveLength(1);
  const winner = concurrentResponses.findIndex(response => response.ok());
  const rejected = concurrentResponses[1 - winner];
  expect(rejected.status()).toBe(400);
  expect((await rejected.json()).exception.reason).toBe("InvalidInput");
  const created = (await concurrentResponses[winner].json()).data;
  expect(created.id).toBe(candidates[winner].id);
  expect(created.definitionVersion).toBe(currentVersion + 1);
  currentVersion = created.definitionVersion;
  for (const replayed of await Promise.all(
    [0, 1].map(() =>
      callAPI(
        page.request,
        "POST",
        `routine-tasks/routine/${routine.id}`,
        token,
        candidates[winner]
      )
    )
  )) {
    expect(replayed.id).toBe(created.id);
    expect(replayed.definitionVersion).toBe(currentVersion);
  }
  expect(
    queryDatabase(
      `SELECT count(*) FROM "RoutineTaskTable" WHERE routine_id='${routine.id}' AND kind='Start'`
    )
  ).toBe("16");
  const seventeenth = await page.request.post(
    `${apiURL}/api/development/v1/routine-tasks/routine/${routine.id}`,
    {
      headers: {
        Origin: "http://127.0.0.1:4173",
        "User-Agent": userAgent,
        "X-CSRF-Token": token,
      },
      data: {
        title: "Rejected seventeenth",
        kind: "Start",
        payload: { schemaVersion: 1, isActive: true },
        expectedDefinitionVersion: currentVersion,
      },
    }
  );
  expect
    .soft(
      seventeenth.status(),
      "seventeenth Start is a client validation error"
    )
    .toBe(400);
  const rejectedStart = await seventeenth.json();
  expect(rejectedStart.success).toBe(false);
  expect(rejectedStart.exception).toMatchObject({
    reason: "InvalidInput",
    domain: "RoutineTask",
    operation: "Validate",
    message: "A routine can contain at most 16 starting nodes",
  });
  expect(rejectedStart.exception).not.toHaveProperty("origin");
  expect(rejectedStart.exception).not.toHaveProperty("details");
  expect(
    queryDatabase(
      `SELECT count(*) FROM "RoutineTaskTable" WHERE routine_id='${routine.id}' AND kind='Start'`
    )
  ).toBe("16");
  expect(
    queryDatabase(
      `SELECT definition_version FROM "RoutineTable" WHERE id='${routine.id}'`
    )
  ).toBe(String(currentVersion));
  const additionalAction = await callAPI(
    page.request,
    "POST",
    `routine-tasks/routine/${routine.id}`,
    token,
    {
      title: "Action at the Start limit",
      kind: "Action",
      payload: {
        schemaVersion: 1,
        purpose: "GetRoutine",
        routineId: routine.id,
      },
      expectedDefinitionVersion: currentVersion,
    }
  );
  expect(additionalAction.definitionVersion).toBe(currentVersion + 1);
  expect(
    queryDatabase(
      `SELECT count(*) FROM "RoutineTaskTable" WHERE routine_id='${routine.id}' AND kind='Start'`
    )
  ).toBe("16");
});

test("authenticated graph persists through Core and executes once in DurableJob with owner billing", async ({
  page,
  request,
}) => {
  test.skip(!enabled, "requires explicitly isolated live backend and database");
  test.setTimeout(300_000);
  page.setDefaultTimeout(30_000);
  page.setDefaultNavigationTimeout(60_000);

  const suffix = randomUUID().replaceAll("-", "").slice(0, 12);
  const name = `Routine${suffix}`;
  const password = "RoutineAcceptance123!";
  const registration = await callAPI(request, "POST", "auth/register", "", {
    name,
    email: `${name}@example.invalid`,
    password,
  });
  let csrfToken = registration.csrfToken;

  const station = await callAPI(request, "POST", "stations/", csrfToken, {
    name: `Acceptance ${suffix}`,
    description: "Retained isolated runtime E2E fixture",
  });
  const startAt = new Date(Date.now() + 3_600_000);
  startAt.setSeconds(0, 0);
  const routine = await callAPI(
    request,
    "POST",
    `routines/station/${station.id}`,
    csrfToken,
    {
      title: `Acceptance ${suffix}`,
      description: "",
      isActive: false,
      scheduledStartAt: startAt.toISOString(),
      scheduledEndAt: new Date(startAt.getTime() + 3_600_000).toISOString(),
      timezone: "UTC",
      timeoutSeconds: 60,
    }
  );
  const action = await callAPI(
    request,
    "POST",
    `routine-tasks/routine/${routine.id}`,
    csrfToken,
    {
      title: "Read routine",
      kind: "Action",
      x: 420,
      y: 180,
      payload: {
        schemaVersion: 1,
        purpose: "GetRoutine",
        routineId: routine.id,
      },
      maxAttempts: 1,
      expectedDefinitionVersion: 1,
    }
  );

  const definitions = await callAPI(
    request,
    "GET",
    `routine-tasks/routine/${routine.id}`,
    csrfToken
  );
  expect(definitions).toHaveLength(1);
  expect(definitions[0]).not.toHaveProperty("purpose");
  expect(definitions[0].payload).toMatchObject({
    schemaVersion: 1,
    purpose: "GetRoutine",
  });
  expect(
    queryDatabase(
      `SELECT count(*) FROM information_schema.columns WHERE table_name='RoutineTaskTable' AND column_name='purpose'`
    )
  ).toBe("0");

  await page.goto("/login");
  await page.locator("html[data-density]").waitFor();
  await page.getByLabel("Account").fill(name);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await expect(page).toHaveURL(/\/app\/dashboard\/?$/, { timeout: 30_000 });
  await expect(
    page.getByRole("menuitem").filter({ hasText: name })
  ).toBeVisible();
  csrfToken = await page.evaluate(async () => {
    const load = (path: string) => import(/* @vite-ignore */ path);
    const { getClientCSRFToken } = await load("/src/api/clientHeaders.ts");
    return getClientCSRFToken();
  });
  expect(typeof csrfToken).toBe("string");

  await page.goto(`/app/routines/${routine.id}/dependency-graph-editor`);
  const actionNode = page.locator(`.react-flow__node[data-id="${action.id}"]`);
  await expect(actionNode).toBeVisible({ timeout: 30_000 });
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await page.getByRole("menuitem", { name: "Start", exact: true }).click();
  const startNode = page
    .locator(".react-flow__node")
    .filter({ has: page.locator('[data-node-kind="Start"]') });
  await expect(startNode).toHaveCount(1);
  await expect(startNode.locator(".react-flow__handle.target")).toHaveCount(0);
  await expect(startNode.locator(".react-flow__handle.source")).toHaveCount(1);
  await page.getByRole("button", { name: "Fit View", exact: true }).click();
  await startNode
    .locator('[data-node-kind="Start"]')
    .click({ button: "right" });
  await page.getByRole("menuitem", { name: "Edit", exact: true }).click();
  await expect(page.getByLabel("Description", { exact: true })).toBeVisible();
  await page.getByLabel("Title", { exact: true }).fill("Live entry");
  await page.getByRole("button", { name: "Save", exact: true }).click();

  await expect
    .poll(() =>
      queryDatabase(
        `SELECT count(*) FROM "RoutineTaskTable" WHERE routine_id='${routine.id}' AND kind='Start' AND title='Live entry'`
      )
    )
    .toBe("1");
  const startId = queryDatabase(
    `SELECT id FROM "RoutineTaskTable" WHERE routine_id='${routine.id}' AND kind='Start'`
  );
  const version = Number(
    queryDatabase(
      `SELECT definition_version FROM "RoutineTable" WHERE id='${routine.id}'`
    )
  );
  await callAPI(
    page.request,
    "POST",
    `routine-task-dependencies/routine/${routine.id}`,
    csrfToken,
    {
      routineTaskId: action.id,
      previousRoutineTaskId: startId,
      description: "",
      progress: 0,
      expectedDefinitionVersion: version,
    }
  );

  await page.reload();
  await expect(
    page
      .locator(`.react-flow__node[data-id="${startId}"]`)
      .getByText("Live entry", { exact: true })
  ).toBeVisible();
  await expect(page.locator(".react-flow__edge")).toHaveCount(1);
  await page.goto(`/app/routines/${station.id}`);
  const active = page.getByRole("switch", {
    name: `Acceptance ${suffix}: Active`,
  });
  await expect(active).toHaveAttribute("aria-checked", "false");
  await active.click();
  await expect
    .poll(() =>
      queryDatabase(
        `SELECT is_active FROM "RoutineTable" WHERE id='${routine.id}'`
      )
    )
    .toBe("t");

  await expect(active).toHaveAttribute("aria-checked", "true");

  queryDatabase(
    `UPDATE "RoutineTable" SET scheduled_start_at=date_trunc('minute',NOW())-interval '1 minute', scheduled_end_at=date_trunc('minute',NOW())+interval '1 hour' WHERE id='${routine.id}'`
  );
  await expect
    .poll(
      () =>
        queryDatabase(
          `SELECT status FROM "RoutineRecordTable" WHERE routine_id='${routine.id}'`
        ),
      { timeout: 90_000 }
    )
    .toBe("Success");

  expect(
    queryDatabase(
      `SELECT count(*) FROM "RoutineTaskRecordTable" t JOIN "RoutineRecordTable" r ON r.id=t.routine_record_id WHERE r.routine_id='${routine.id}' AND t.status='Success'`
    )
  ).toBe("1");
  expect(
    queryDatabase(
      `SELECT count(*) FROM "RoutineTaskRecordTable" WHERE routine_task_id='${startId}'`
    )
  ).toBe("0");
  expect(
    queryDatabase(
      `SELECT bool_and((t.definition_snapshot->>'ownerUserId')::uuid=s.owner_id AND t.reserved_execution_micros=0 AND t.billed_execution_micros>0) FROM "RoutineTaskRecordTable" t JOIN "RoutineRecordTable" r ON r.id=t.routine_record_id JOIN "StationTable" s ON s.id=(r.snapshot->>'stationId')::uuid WHERE r.routine_id='${routine.id}'`
    )
  ).toBe("t");
  expect(
    queryDatabase(
      `SELECT bool_and(NOT (t.definition_snapshot ? 'purpose') AND t.payload_snapshot->>'purpose'=t.purpose::text) FROM "RoutineTaskRecordTable" t JOIN "RoutineRecordTable" r ON r.id=t.routine_record_id WHERE r.routine_id='${routine.id}'`
    )
  ).toBe("t");
  await active.click();
  await expect
    .poll(() =>
      queryDatabase(
        `SELECT is_active FROM "RoutineTable" WHERE id='${routine.id}'`
      )
    )
    .toBe("f");
  await page.reload();
  await expect(
    page.getByRole("switch", { name: `Acceptance ${suffix}: Active` })
  ).toHaveAttribute("aria-checked", "false");
  expect(
    queryDatabase(
      `SELECT count(*) FROM "RoutineRecordTable" WHERE routine_id='${routine.id}'`
    )
  ).toBe("1");
  const blocked = await callAPI(
    page.request,
    "POST",
    `routines/station/${station.id}`,
    csrfToken,
    {
      title: `Blocked ${suffix}`,
      isActive: false,
      timeoutSeconds: 60,
      scheduledStartAt: startAt.toISOString(),
      scheduledEndAt: new Date(startAt.getTime() + 3_600_000).toISOString(),
      timezone: "UTC",
    }
  );
  const nodes: Record<string, string> = {};
  let expectedDefinitionVersion = 1;
  for (const label of ["Start", "A", "B", "C", "D", "Independent"]) {
    const node = await callAPI(
      page.request,
      "POST",
      `routine-tasks/routine/${blocked.id}`,
      csrfToken,
      {
        title: label,
        kind: label === "Start" ? "Start" : "Action",
        x: 0,
        y: 0,
        expectedDefinitionVersion,
        payload:
          label === "Start"
            ? { schemaVersion: 1, isActive: true }
            : label === "C"
              ? {
                  schemaVersion: 1,
                  purpose: "CreateRoutine",
                  stationId: station.id,
                  title: `Must not exist ${suffix}`,
                }
              : {
                  schemaVersion: 1,
                  purpose: "GetRoutine",
                  routineId: blocked.id,
                },
        maxAttempts: 1,
      }
    );
    nodes[label] = node.id;
    expectedDefinitionVersion = node.definitionVersion;
  }
  for (const [source, target] of [
    ["Start", "A"],
    ["Start", "Independent"],
    ["A", "C"],
    ["B", "C"],
    ["C", "D"],
  ]) {
    await callAPI(
      page.request,
      "POST",
      `routine-task-dependencies/routine/${blocked.id}`,
      csrfToken,
      {
        routineTaskId: nodes[target],
        previousRoutineTaskId: nodes[source],
        expectedDefinitionVersion,
        description: "",
        progress: 0,
      }
    );
    expectedDefinitionVersion++;
  }
  await callAPI(page.request, "PUT", `routines/${blocked.id}`, csrfToken, {
    values: { isActive: true },
  });
  queryDatabase(
    `UPDATE "RoutineTable" SET scheduled_start_at=date_trunc('minute',NOW())-interval '1 minute',scheduled_end_at=date_trunc('minute',NOW())+interval '1 hour' WHERE id='${blocked.id}'`
  );
  await expect
    .poll(
      () =>
        queryDatabase(
          `SELECT status FROM "RoutineRecordTable" WHERE routine_id='${blocked.id}'`
        ),
      { timeout: 90_000 }
    )
    .toBe("Failed");
  expect(
    queryDatabase(
      `SELECT success_task_count||':'||blocked_task_count||':'||waiting_task_count||':'||running_task_count FROM "RoutineRecordTable" WHERE routine_id='${blocked.id}'`
    )
  ).toBe("2:2:0:0");
  expect(
    queryDatabase(
      `SELECT count(*) FROM "RoutineTaskRecordTable" WHERE routine_task_id IN ('${nodes.Start}','${nodes.B}')`
    )
  ).toBe("0");
  expect(
    queryDatabase(
      `SELECT count(*) FROM "RoutineTaskRecordTable" WHERE routine_task_id IN ('${nodes.C}','${nodes.D}') AND status='Blocked' AND error_code='DependencyUnavailable' AND billed_execution_micros=0 AND reserved_execution_micros=0`
    )
  ).toBe("2");
  expect(
    queryDatabase(
      `SELECT count(*) FROM "RoutineTable" WHERE station_id='${station.id}' AND title='Must not exist ${suffix}'`
    )
  ).toBe("0");
  expect(
    queryDatabase(
      `SELECT count(*) FROM "RoutineRecordTable" WHERE routine_id='${routine.id}'`
    )
  ).toBe("1");
  await callAPI(page.request, "PUT", `routines/${blocked.id}`, csrfToken, {
    values: { isActive: false },
  });
});
