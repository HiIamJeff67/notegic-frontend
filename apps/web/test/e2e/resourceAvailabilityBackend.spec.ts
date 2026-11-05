import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";

const apiURL = process.env.E2E_ROUTINE_API_URL;
const database = process.env.E2E_ROUTINE_DATABASE;
const userAgent = "ResourceAvailabilityAcceptance/1.0";
test.use({ userAgent });
test.skip(
  process.env.E2E_RUN_ROUTINE_BACKEND !== "true" ||
    !apiURL ||
    new URL(apiURL).hostname !== "127.0.0.1" ||
    !database?.match(/^notegic_routine_acceptance_[a-z0-9_]+$/) ||
    process.env.E2E_PRODUCTION === "true",
  "Requires isolated live Core/Gateway and Vite source imports"
);

test("real deletion responses stop open viewers and inspectors without discarding the graph draft", async ({
  page,
  request,
}) => {
  test.setTimeout(180_000);
  const name = `Deletion${randomUUID().replaceAll("-", "").slice(0, 12)}`;
  const password = "DeletionAcceptance123!";
  const registration = await request.post(
    `${apiURL}/api/development/v1/auth/register`,
    {
      headers: { Origin: "http://127.0.0.1:4173", "User-Agent": userAgent },
      data: { name, email: `${name}@example.invalid`, password },
    }
  );
  expect(registration.status()).toBe(200);
  expect((await registration.json()).success).toBe(true);
  await page.goto("/login");
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Account").fill(name);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await expect(page).toHaveURL(/\/app\/dashboard\/?$/, { timeout: 60_000 });
  await expect(
    page.getByRole("menuitem").filter({ hasText: name })
  ).toBeVisible({ timeout: 30_000 });
  const csrfToken = await page.evaluate(async () => {
    const path = "/src/api/clientHeaders.ts";
    return (await import(/* @vite-ignore */ path)).getClientCSRFToken();
  });
  expect(typeof csrfToken).toBe("string");
  const callAPI = async (
    method: "GET" | "POST" | "DELETE",
    path: string,
    data?: unknown
  ) => {
    const response = await page.request.fetch(
      `${apiURL}/api/development/v1/${path}`,
      {
        method,
        data,
        headers: {
          Origin: "http://127.0.0.1:4173",
          "User-Agent": userAgent,
          "X-CSRF-Token": csrfToken!,
        },
      }
    );
    expect(response.ok(), `${method} ${path}`).toBe(true);
    const result = await response.json();
    expect(result.success).toBe(true);
    return result.data;
  };
  const refetchDetail = (domain: string, id: string) =>
    page.evaluate(
      async ({ domain, id, modulePath }) => {
        const { getQueryClient } = (await import(
          /* @vite-ignore */ modulePath
        )) as typeof import("@shared/api/queryClient");
        await getQueryClient().refetchQueries({
          predicate: query =>
            query.queryKey[0] === domain &&
            query.queryKey[1] === "oneById" &&
            query.queryKey[2] === id,
          type: "active",
        });
      },
      {
        domain,
        id,
        modulePath: `/@fs${process.cwd()}/shared/api/queryClient.ts`,
      }
    );
  const root = await callAPI("POST", "root-shelves/", { name });
  const sub = await callAPI("POST", `sub-shelves/root-shelf/${root.id}`, {
    name,
    prevSubShelfId: null,
  });

  for (const [domain, endpoint, route, label] of [
    ["material", "materials", "material-viewer", "Material not found."],
    ["blockPack", "block-packs", "block-pack-editor", "Block pack not found."],
  ] as const) {
    await test.step(`${domain}: remote deletion and explicit detail refetch`, async () => {
      const resource = await callAPI(
        "POST",
        `${endpoint}/sub-shelf/${sub.id}`,
        {
          name: `${domain} ${name}`,
          ...(domain === "blockPack"
            ? { icon: null, headerBackgroundURL: null }
            : {}),
        }
      );
      await page.goto(
        `/app/${route}/${resource.id}${domain === "material" ? `?parentSubShelfId=${sub.id}&rootShelfId=${root.id}` : ""}`
      );
      await page.waitForLoadState("networkidle");
      await expect(page.getByText(label, { exact: true })).toHaveCount(0);
      if (domain === "material") {
        await expect(
          page.getByText("No file uploaded. Upload a file to view it.", {
            exact: true,
          })
        ).toBeVisible();
      } else {
        await expect(page.locator(".bn-editor")).toBeVisible({
          timeout: 30_000,
        });
      }
      await callAPI("DELETE", `${endpoint}/${resource.id}`);
      // Exercise the mounted detail hook against the real backend, without
      // replacing query data or fabricating an invalidation notification.
      await refetchDetail(domain, resource.id);
      await expect(page.getByText(label, { exact: true })).toBeVisible();
      expect(new URL(page.url()).pathname).toBe(`/app/${route}/${resource.id}`);
      if (domain === "blockPack")
        await expect(page.locator(".bn-editor")).toHaveCount(0);
    });
  }

  const station = await callAPI("POST", "stations/", {
    name,
    description: "Retained isolated deletion acceptance",
  });
  const routine = await callAPI("POST", `routines/station/${station.id}`, {
    title: name,
    isActive: false,
    timezone: "UTC",
  });
  const task = await callAPI("POST", `routine-tasks/routine/${routine.id}`, {
    title: "Persisted deletion target",
    kind: "Action",
    priority: 0,
    payload: { schemaVersion: 1, purpose: "GetRoutine", routineId: routine.id },
    expectedDefinitionVersion: routine.definitionVersion,
  });
  await page.goto(`/app/routines/${routine.id}/dependency-graph-editor`);
  const node = page.locator(`.react-flow__node[data-id="${task.id}"]`);
  await expect(node).toBeVisible({ timeout: 30_000 });
  const box = await node.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box!.x + 20, box!.y + 20);
  await page.mouse.down();
  await page.mouse.move(box!.x + 80, box!.y + 60, { steps: 10 });
  await page.mouse.up();
  await expect(
    page.getByRole("button", { name: "Save", exact: true })
  ).toBeEnabled();
  await node.click({ button: "right", position: { x: 20, y: 20 } });
  await page.getByRole("menuitem", { name: "Edit", exact: true }).click();
  await page.waitForLoadState("networkidle");
  const title = page.locator("#routine-task-inspector-title");
  await title.fill("Unsubmitted live-backend draft");
  // The draft can render before the initial detail read settles. A refetch
  // during that pending read joins it rather than guaranteeing a later read.
  await refetchDetail("routineTask", task.id);
  const detailState = await page.evaluate(
    async ({ id, modulePath }) => {
      const load = (path: string) => import(/* @vite-ignore */ path);
      const { getQueryClient } = (await load(
        modulePath
      )) as typeof import("@shared/api/queryClient");
      const { localDB } = await load("/src/api/local/db.ts");
      const { RoutineTaskDependencyGraphDraft } = await load(
        "/src/api/local/schemas/index.ts"
      );
      const rows = await localDB.select().from(RoutineTaskDependencyGraphDraft);
      const baseline = rows.flatMap(
        (row: { nodes: string }) =>
          JSON.parse(row.nodes).snapshot?.baselineTasks ?? []
      );
      return {
        baselineContainsTask: baseline.some(
          (task: { id: string }) => task.id === id
        ),
        queries: getQueryClient()
          .getQueryCache()
          .findAll({
            predicate: query =>
              query.queryKey[0] === "routineTask" &&
              query.queryKey[1] === "oneById" &&
              query.queryKey[2] === id,
          })
          .map(query => ({
            active: query.isActive(),
            status: query.state.status,
            observers: query.getObserversCount(),
          })),
      };
    },
    {
      id: task.id,
      modulePath: `/@fs${process.cwd()}/shared/api/queryClient.ts`,
    }
  );
  await test.info().attach("persisted-task-detail-before-deletion", {
    body: JSON.stringify(detailState),
    contentType: "application/json",
  });
  expect(detailState.baselineContainsTask).toBe(true);
  expect(detailState.queries).toHaveLength(1);
  expect(detailState.queries[0].active).toBe(true);
  expect(detailState.queries[0].status).toBe("success");
  await callAPI("DELETE", `routine-tasks/${task.id}/permanently`);
  const deletedTask = await page.request.get(
    `${apiURL}/api/development/v1/routine-tasks/${task.id}`,
    {
      headers: {
        Origin: "http://127.0.0.1:4173",
        "User-Agent": userAgent,
        "X-CSRF-Token": csrfToken!,
      },
    }
  );
  expect(deletedTask.status()).toBe(404);
  await refetchDetail("routineTask", task.id);
  const refreshedTask = await page.evaluate(
    async ({ id, modulePath }) => {
      const { getQueryClient } = (await import(
        /* @vite-ignore */ modulePath
      )) as typeof import("@shared/api/queryClient");
      const query = getQueryClient()
        .getQueryCache()
        .findAll({
          predicate: query =>
            query.queryKey[0] === "routineTask" &&
            query.queryKey[1] === "oneById" &&
            query.queryKey[2] === id,
        })[0];
      return {
        status: query?.state.status,
        available: !!(query?.state.data as { data?: unknown } | undefined)
          ?.data,
        error: query?.state.error?.message ?? null,
      };
    },
    {
      id: task.id,
      modulePath: `/@fs${process.cwd()}/shared/api/queryClient.ts`,
    }
  );
  expect(refreshedTask).toEqual({
    status: "success",
    available: false,
    error: null,
  });
  await expect(
    page
      .getByRole("dialog")
      .getByText("Routine task not found.", { exact: true })
  ).toBeVisible();
  await expect(title).toBeHidden();
  await expect(title).toHaveValue("Unsubmitted live-backend draft");
  await expect(page.locator(".react-flow")).toBeVisible();
  await page.keyboard.press("Escape");
  const draftBefore = await page.evaluate(async () => {
    const load = (path: string) => import(/* @vite-ignore */ path);
    const { localDB } = await load("/src/api/local/db.ts");
    const { RoutineTaskDependencyGraphDraft } = await load(
      "/src/api/local/schemas/index.ts"
    );
    return JSON.stringify(
      await localDB.select().from(RoutineTaskDependencyGraphDraft)
    );
  });
  expect(JSON.parse(draftBefore).length).toBeGreaterThan(0);
  await callAPI("DELETE", `routines/${routine.id}`);
  await refetchDetail("routine", routine.id);
  await expect(
    page.getByText("Routine not found.", { exact: true })
  ).toBeVisible();
  await expect(page.locator(".react-flow")).toHaveCount(0);
  expect(
    await page.evaluate(async () => {
      const load = (path: string) => import(/* @vite-ignore */ path);
      const { localDB } = await load("/src/api/local/db.ts");
      const { RoutineTaskDependencyGraphDraft } = await load(
        "/src/api/local/schemas/index.ts"
      );
      return JSON.stringify(
        await localDB.select().from(RoutineTaskDependencyGraphDraft)
      );
    })
  ).toBe(draftBefore);
  await page.screenshot({ path: "/private/tmp/notegic-live-deletion.png" });
});

test("live login distinguishes request validation and a rejected password without replaying credentials", async ({
  page,
  request,
}) => {
  const name = `Login${randomUUID().replaceAll("-", "").slice(0, 12)}`;
  const registration = await request.post(
    `${apiURL}/api/development/v1/auth/register`,
    {
      headers: { Origin: "http://127.0.0.1:4173", "User-Agent": userAgent },
      data: {
        name,
        email: `${name}@example.invalid`,
        password: "LoginAcceptance123!",
      },
    }
  );
  expect(registration.status()).toBe(200);
  expect((await registration.json()).success).toBe(true);
  await page.goto("/login");
  await page.waitForLoadState("networkidle");
  const loginURL = await page.evaluate(async () => {
    const path = "/src/api/functions/auth.serverFn.ts";
    return (await import(/* @vite-ignore */ path)).Login.url;
  });
  let attempts = 0;
  page.on("request", request => {
    if (
      request.method() === "POST" &&
      new URL(request.url()).pathname === new URL(loginURL, page.url()).pathname
    )
      attempts++;
  });
  await page.getByLabel("Account").fill(name);
  await page.getByLabel("Password", { exact: true }).fill("asd");
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await expect(
    page.getByText("Password must be at least 8 characters.", { exact: true })
  ).toBeVisible();
  expect(attempts).toBe(0);
  await page.getByLabel("Password", { exact: true }).fill("WrongPassword123!");
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await expect(
    page.getByText("The password is incorrect.", { exact: true })
  ).toBeVisible();
  await expect(page.getByLabel("Password", { exact: true })).toHaveValue("");
  await expect(
    page.getByRole("button", { name: "Login", exact: true })
  ).toBeEnabled();
  expect(attempts).toBe(1);
  await expect(page).toHaveURL(/\/login$/);
});
