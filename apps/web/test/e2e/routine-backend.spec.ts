import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { type APIRequestContext, expect, test } from "@playwright/test";

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
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36",
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

test("authenticated graph persists through Core and executes once in DurableJob with owner billing", async ({
  page,
}) => {
  test.skip(!enabled, "requires explicitly isolated live backend and database");
  test.setTimeout(300_000);

  const suffix = randomUUID().replaceAll("-", "").slice(0, 12);
  const name = `Routine${suffix}`;
  const password = "RoutineAcceptance123!";
  const registration = await callAPI(
    page.request,
    "POST",
    "auth/register",
    "",
    { name, email: `${name}@example.invalid`, password }
  );
  const csrfToken = registration.csrfToken;

  await page.goto("/login");
  await page.locator("html[data-density]").waitFor();
  await page.getByLabel("Account").fill(name);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await expect(page).toHaveURL(/\/app\/dashboard\/?$/, { timeout: 30_000 });

  const station = await callAPI(page.request, "POST", "stations/", csrfToken, {
    name: `Acceptance ${suffix}`,
    description: "Retained isolated runtime E2E fixture",
  });
  const startAt = new Date(Date.now() + 3_600_000);
  startAt.setSeconds(0, 0);
  const routine = await callAPI(
    page.request,
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
    page.request,
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

  await page.goto(`/app/routines/${routine.id}/dependency-graph-editor`);
  const actionNode = page.locator(`.react-flow__node[data-id="${action.id}"]`);
  await expect(actionNode).toBeVisible({ timeout: 30_000 });
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await page
    .getByRole("menuitem", { name: "Starting node", exact: true })
    .click();
  const startNode = page
    .locator(".react-flow__node")
    .filter({ has: page.locator('[data-node-kind="Start"]') });
  await expect(startNode).toHaveCount(1);
  await expect(startNode.locator(".react-flow__handle.target")).toHaveCount(0);
  await expect(startNode.locator(".react-flow__handle.source")).toHaveCount(1);
  await startNode.click({ button: "right", position: { x: 20, y: 40 } });
  await page.getByRole("menuitem", { name: "Edit", exact: true }).click();
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
