import {
  type Locator,
  type Page,
  expect as playwrightExpect,
  type Route,
  test,
} from "@playwright/test";
import { NotegicAPIError, NotegicException } from "@shared/api/exceptions";
import { makeSerovalPlugin } from "@tanstack/router-core";
import { fromJSON, toCrossJSONAsync } from "seroval";
import { apiErrorSerialization } from "@/api/adapters/exceptionSerialization.adapter";

// Include SQLocal reconnection and persisted reconciliation, not only RPC completion.
const expect = playwrightExpect.configure({ timeout: 30_000 });

const dragNode = async (page: Page, node: Locator, dx: number, dy: number) => {
  await expect(node).toBeVisible();
  const box = await node.boundingBox();
  expect(box).not.toBeNull();
  const x = box!.x + 20;
  const y = box!.y + box!.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + dx, y + dy, { steps: 5 });
  await page.mouse.up();
  const moved = await node.boundingBox();
  expect(moved!.x).toBeGreaterThan(box!.x + dx / 2);
  await expect(page.getByRole("menu")).toHaveCount(0);
};

const respondGraphSave = async (route: Route, page: Page) => {
  if (route.request().method() !== "POST") return route.abort("failed");
  const {
    data: { body },
  } = fromJSON(route.request().postDataJSON()) as {
    data: {
      body: import("@shared/api/interfaces/routineTaskDependency.interface").UpdateRoutineTaskGraphByRoutineIdRequest["body"];
    };
  };
  const graph = await page.evaluate(async body => {
    const load = (path: string) => import(/* @vite-ignore */ path);
    const { localDB } = await load("/src/api/local/db.ts");
    const { RoutineTask, RoutineTaskDependency } = await load(
      "/src/api/local/schemas/index.ts"
    );
    const tasks = new Map<string, any>(
      (await localDB.select().from(RoutineTask)).map((task: any) => [
        task.id,
        task,
      ])
    );
    for (const id of body.tasks.deletes) tasks.delete(id);
    for (const task of body.tasks.creates)
      tasks.set(task.id!, {
        ...task,
        priority: task.priority ?? 0,
        maxAttempts: task.maxAttempts ?? 1,
        previousRoutineTaskIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    for (const task of body.tasks.updates)
      tasks.set(task.routineTaskId, {
        ...tasks.get(task.routineTaskId),
        ...task.values,
      });
    const key = (edge: {
      previousRoutineTaskId: string;
      routineTaskId: string;
    }) => edge.previousRoutineTaskId + "->" + edge.routineTaskId;
    const dependencies = new Map<string, any>(
      (await localDB.select().from(RoutineTaskDependency))
        .filter(
          (edge: any) =>
            tasks.has(edge.routineTaskId) &&
            tasks.has(edge.previousRoutineTaskId)
        )
        .map((edge: any) => [key(edge), edge])
    );
    for (const edge of body.dependencies.deletes)
      dependencies.delete(key(edge));
    for (const edge of body.dependencies.creates)
      dependencies.set(key(edge), {
        ...edge,
        description: edge.description ?? "",
        progress: edge.progress ?? 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    for (const edge of body.dependencies.updates)
      dependencies.set(key(edge), { ...dependencies.get(key(edge)), ...edge });
    return {
      tasks: [...tasks.values()],
      dependencies: [...dependencies.values()],
      definitionVersion: body.expectedDefinitionVersion + 1,
      updatedAt: new Date(),
    };
  }, body);
  await route.fulfill({
    contentType: "application/json",
    body: JSON.stringify({
      result: {
        success: true,
        exception: null,
        data: graph,
        embedded: { publicId: "editor-user" },
      },
    }),
  });
};

const createGraphAction = async (
  page: Page,
  editor: Locator,
  title: string
) => {
  await editor.getByRole("button", { name: "Create", exact: true }).click();
  await page.getByRole("menuitem", { name: "Action", exact: true }).click();
  await page.locator("#routine-task-title").fill(title);
  await page.getByRole("dialog").getByRole("combobox").click();
  await page
    .getByRole("option", { name: "Get · Routine", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Edit payload", exact: true })
    .click();
  const payloadDialog = page
    .getByRole("dialog")
    .filter({ has: page.locator("textarea") });
  await payloadDialog.locator("textarea").fill(
    JSON.stringify({
      schemaVersion: 1,
      routineId: "12345678-1234-4234-8234-123456789abc",
    })
  );
  await payloadDialog
    .getByRole("button", { name: "Save", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Create", exact: true })
    .click();
};

const mountLayoutEditor = async (page: Page, realProvider = false) => {
  await page.evaluate(async realProvider => {
    const path = "/test/e2e/routineGraphTestSupport.tsx";
    const { mountRoutineLayoutEditor } = await import(/* @vite-ignore */ path);
    await mountRoutineLayoutEditor(realProvider);
  }, realProvider);
  const editor = page.locator("#routine-editor-test-root");
  await expect(editor.locator(".react-flow__node")).toHaveCount(2);
  await expect
    .poll(
      async () =>
        (await editor.locator(".react-flow").boundingBox())?.height ?? 0
    )
    .toBeGreaterThan(100);
  await page.evaluate(() =>
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      get: () => true,
    })
  );
  return editor;
};

test.beforeEach(async ({ page }) => {
  test.skip(
    process.env.E2E_PRODUCTION === "true",
    "The source fixture is served by Vite in development."
  );
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Get Started" })).toBeVisible();
  await page.locator("html[data-density]").waitFor();
});

test("canvas lock freezes the viewport and nodes until unlocked", async ({
  page,
}) => {
  const editor = await mountLayoutEditor(page);
  await expect(
    editor.getByRole("button", { name: "Refresh", exact: true })
  ).toHaveCount(0);
  await expect(
    editor.getByRole("button", { name: "Reset", exact: true })
  ).toHaveCount(0);
  const viewport = editor.locator(".react-flow__viewport");
  const pane = editor.locator(".react-flow__pane");
  const start = editor.locator(".react-flow__node").first();
  const transform = await viewport.evaluate(
    node => getComputedStyle(node).transform
  );
  const position = await start.evaluate(
    node => getComputedStyle(node).transform
  );
  const lock = editor.getByRole("button", { name: "Toggle Interactivity" });
  await lock.click();

  const drag = async (target: Locator) => {
    const box = (await target.boundingBox())!;
    await page.mouse.move(box.x + 40, box.y + 40);
    await page.mouse.down();
    await page.mouse.move(box.x + 120, box.y + 80, { steps: 5 });
    await page.mouse.up();
  };
  await drag(pane);
  await expect(viewport).toHaveCSS("transform", transform);
  await page.keyboard.down("Space");
  await drag(pane);
  await page.keyboard.up("Space");
  await expect(viewport).toHaveCSS("transform", transform);
  await drag(start);
  await expect(start).toHaveCSS("transform", position);
  await pane.dblclick({ position: { x: 20, y: 20 } });
  await page.mouse.wheel(0, -200);
  await page.keyboard.down("Control");
  await page.mouse.wheel(0, -200);
  await page.keyboard.up("Control");
  await page.evaluate(
    () =>
      new Promise(resolve =>
        requestAnimationFrame(() => requestAnimationFrame(resolve))
      )
  );
  await expect(viewport).toHaveCSS("transform", transform);

  const miniMap = editor.locator(".react-flow__minimap");
  await drag(miniMap);
  await miniMap.hover();
  await page.mouse.wheel(0, -200);
  await page.evaluate(
    () =>
      new Promise(resolve =>
        requestAnimationFrame(() => requestAnimationFrame(resolve))
      )
  );
  await expect(viewport).toHaveCSS("transform", transform);
  await expect(
    editor.getByRole("button", { name: "Zoom In", exact: true })
  ).toHaveCount(0);
  await expect(
    editor.getByRole("button", { name: "Fit View", exact: true })
  ).toHaveCount(0);

  await lock.click();
  await expect(
    editor.getByRole("button", { name: "Zoom In", exact: true })
  ).toBeVisible();
  await expect(
    editor.getByRole("button", { name: "Fit View", exact: true })
  ).toBeVisible();
  await drag(pane);
  await expect(viewport).not.toHaveCSS("transform", transform);
  await dragNode(page, start, 40, 20);
});

test("graph status bar follows expanded sidebar geometry at every density", async ({
  page,
}) => {
  const editor = await mountLayoutEditor(page);
  for (const [density, height] of [
    ["compact", 77],
    ["standard", 85],
    ["comfortable", 93],
  ] as const) {
    await page.evaluate(value => {
      document.documentElement.dataset.density = value;
    }, density);
    const geometry = await editor
      .locator("main > header + div")
      .evaluate(bar => ({
        height:
          bar.getBoundingClientRect().bottom -
          bar.parentElement!.getBoundingClientRect().top,
        background: getComputedStyle(bar).backgroundColor,
        topBorder: getComputedStyle(bar).borderTopWidth,
      }));
    expect(geometry.height).toBe(height);
    expect(geometry.background).not.toBe("rgba(0, 0, 0, 0)");
    expect(geometry.topBorder).toBe("0px");
  }
});

test("real workspace Provider preserves the current Routine, sibling data and expansion after graph saves", async ({
  page,
}) => {
  test.setTimeout(60_000);
  const writes: import("@shared/api/interfaces/routineTaskDependency.interface").UpdateRoutineTaskGraphByRoutineIdRequest["body"][] =
    [];
  await page.route("**/_serverFn/**", async route => {
    if (route.request().method() !== "POST") return route.abort("failed");
    writes.push((fromJSON(route.request().postDataJSON()) as any).data.body);
    await respondGraphSave(route, page);
  });
  const editor = await mountLayoutEditor(page, true);
  const state = page.getByLabel("Workspace cache");
  const before = JSON.parse((await state.textContent())!);
  expect(before.routine.version).toBe(7);
  const action = editor.locator(
    '.react-flow__node[data-id="42345678-1234-4234-8234-123456789abc"]'
  );
  await action.click({ button: "right", position: { x: 20, y: 20 } });
  await page.getByRole("menuitem", { name: "Edit", exact: true }).click();
  await page.locator("#routine-task-inspector-title").fill("Renamed in graph");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Save", exact: true })
    .click();
  await editor.getByRole("button", { name: "Create", exact: true }).click();
  await page.getByRole("menuitem", { name: "Start", exact: true }).click();
  await expect(editor.locator(".react-flow__node")).toHaveCount(3);
  expect(JSON.parse((await state.textContent())!)).toEqual(before);
  await editor.getByRole("button", { name: "Save", exact: true }).click();
  await expect
    .poll(async () => JSON.parse((await state.textContent())!).routine?.version)
    .toBe(8);
  await expect(editor.getByText("No routines", { exact: true })).toHaveCount(0);
  const after = JSON.parse((await state.textContent())!);
  expect(after).toMatchObject({
    ...before,
    routine: {
      ...before.routine,
      version: 8,
      tasks: [
        {
          id: "42345678-1234-4234-8234-123456789abc",
          title: "Renamed in graph",
          executionStatus: "Running",
        },
      ],
    },
  });
  expect(Object.values(after.identities)).toEqual(
    Object.values(before.identities)
  );
  expect(writes).toHaveLength(1);
  expect(writes[0].expectedDefinitionVersion).toBe(7);
  await action.click({ button: "right", position: { x: 20, y: 20 } });
  await page.getByRole("menuitem", { name: "Delete", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Delete", exact: true })
    .click();
  await editor.getByRole("button", { name: "Save", exact: true }).click();
  await expect
    .poll(async () => JSON.parse((await state.textContent())!).routine?.version)
    .toBe(9);
  const empty = JSON.parse((await state.textContent())!);
  expect(empty.routine).toMatchObject({
    ids: [],
    tasks: [],
    isOpen: true,
    isExpanded: true,
  });
  expect(empty.sibling).toEqual(before.sibling);
  expect(empty.otherStation).toEqual(before.otherStation);
  expect(empty.identities).toMatchObject({ ...before.identities, task: false });
  expect(writes).toHaveLength(2);
  expect(writes[1].expectedDefinitionVersion).toBe(8);
  await expect(
    editor.getByRole("button", { name: "Save", exact: true })
  ).toBeDisabled();
  await expect(editor.getByText("No routines", { exact: true })).toHaveCount(0);
  await createGraphAction(page, editor, "New Action");
  await editor.getByRole("button", { name: "Save", exact: true }).click();
  await expect
    .poll(async () => JSON.parse((await state.textContent())!).routine?.version)
    .toBe(10);
  const created = JSON.parse((await state.textContent())!);
  expect(created.routine.tasks).toHaveLength(1);
  expect(created.routine.tasks[0].title).toBe("New Action");
  expect(created.routine.ids).toEqual([created.routine.tasks[0].id]);
  expect(created.otherStation).toEqual(before.otherStation);
  expect(created.sibling).toEqual(before.sibling);
  expect(created.tag).toEqual(before.tag);
  expect(created.identities).toEqual(empty.identities);
  expect(writes).toHaveLength(3);
  expect(writes[2].expectedDefinitionVersion).toBe(9);
  await expect(
    editor.getByRole("button", { name: "Save", exact: true })
  ).toBeDisabled();
});

test("toolbar activation shares the Routine update flow and rolls back rejected changes", async ({
  page,
}) => {
  const editor = await mountLayoutEditor(page, true);
  const active = editor.getByRole("button", { name: "Active", exact: true });
  await expect(active).toHaveAttribute("aria-pressed", "false");
  await expect(active.locator(".lucide-power-off")).toBeVisible();
  let release = () => {};
  const acknowledgement = new Promise<void>(resolve => {
    release = resolve;
  });
  const writes: boolean[] = [];
  await page.route("**/_serverFn/**", async route => {
    if (route.request().method() !== "POST") return route.abort("failed");
    const { data } = fromJSON(route.request().postDataJSON()) as {
      data: { body: { routineId: string; values: { isActive: boolean } } };
    };
    expect(data.body.routineId).toBe("12345678-1234-4234-8234-123456789abc");
    writes.push(data.body.values.isActive);
    if (writes.length === 1) {
      await acknowledgement;
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          result: {
            success: true,
            exception: null,
            data: { updatedAt: new Date().toISOString() },
            embedded: { publicId: "editor-user" },
          },
        }),
      });
    } else {
      const error = new NotegicAPIError(
        new NotegicException(
          {
            reason: "PermissionDenied",
            domain: "Routine",
            operation: "UpdateRoutine",
            message: "Permission denied",
            retryable: false,
          },
          403
        )
      );
      await route.fulfill({
        contentType: "application/json",
        headers: { "x-tss-serialized": "true" },
        body: JSON.stringify(
          await toCrossJSONAsync(
            { error },
            { plugins: [makeSerovalPlugin(apiErrorSerialization)] }
          )
        ),
      });
    }
  });
  await active.click();
  await expect.poll(() => writes).toEqual([true]);
  await expect(active).toBeDisabled();
  await expect(active).toHaveAttribute("aria-pressed", "true");
  await expect(active).toHaveAttribute("aria-busy", "true");
  release();
  await expect(active).toBeEnabled();
  await expect(active).toHaveAttribute("aria-pressed", "true");
  await expect(active.locator(".lucide-power")).toBeVisible();
  await active.click();
  await expect.poll(() => writes).toEqual([true, false]);
  await expect(active).toBeEnabled();
  await expect(active).toHaveAttribute("aria-pressed", "true");
  await expect(active.locator(".lucide-power")).toBeVisible();
  await expect
    .poll(
      async () =>
        JSON.parse((await editor.getByLabel("Workspace cache").textContent())!)
          .routine.isActive
    )
    .toBe(true);
});

test("expired schedule activation shows the actionable error and preserves the graph draft", async ({
  page,
}) => {
  const editor = await mountLayoutEditor(page, true);
  const node = editor.locator(
    '.react-flow__node[data-id="22345678-1234-4234-8234-123456789abc"]'
  );
  await dragNode(page, node, 80, 40);
  const position = await node.getAttribute("style");
  let writes = 0;
  await page.route("**/_serverFn/**", async route => {
    writes++;
    const error = new NotegicAPIError(
      new NotegicException(
        {
          reason: "RescheduleRequired",
          domain: "Routine",
          operation: "Activate",
          message: "Choose a future schedule before activating this routine",
          retryable: false,
        },
        409
      )
    );
    await route.fulfill({
      contentType: "application/json",
      headers: { "x-tss-serialized": "true" },
      body: JSON.stringify(
        await toCrossJSONAsync(
          { error },
          { plugins: [makeSerovalPlugin(apiErrorSerialization)] }
        )
      ),
    });
  });
  const active = editor.getByRole("button", { name: "Active", exact: true });
  await active.click();
  await expect(
    page.getByText("Choose a future schedule before activating this routine.", {
      exact: true,
    })
  ).toBeVisible();
  await expect(active).toBeEnabled();
  await expect(active).toHaveAttribute("aria-pressed", "false");
  await expect(active.locator(".lucide-power-off")).toBeVisible();
  await expect(node).toHaveAttribute("style", position!);
  await expect(
    editor.getByRole("button", { name: "Save", exact: true })
  ).toBeEnabled();
  expect(writes).toBe(1);
});

test("toolbar keeps its outline when Save is disabled and Routine details omit storage internals", async ({
  page,
}) => {
  const editor = await mountLayoutEditor(page);
  const save = editor.getByRole("button", { name: "Save", exact: true });
  await expect(save).toBeDisabled();
  const toolbar = editor.locator('header [data-slot="button-group"]');
  const outline = await toolbar.evaluate(element => {
    const style = getComputedStyle(element);
    return {
      left: style.borderLeftWidth,
      right: style.borderRightWidth,
      leftColor: style.borderLeftColor,
      rightColor: style.borderRightColor,
      opacity: style.opacity,
    };
  });
  expect(outline).toMatchObject({ left: "1px", right: "1px", opacity: "1" });
  expect(outline.leftColor).toBe(outline.rightColor);
  await editor.getByRole("button", { name: "Queue test" }).click();
  const details = page.getByRole("menu");
  await expect(details.getByText("Storage", { exact: true })).toHaveCount(0);
  await expect(details.getByText("Node count", { exact: true })).toBeVisible();
  await expect(details.getByText("Period", { exact: true })).toBeVisible();
  await expect(details.getByText("UTC", { exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await page.setViewportSize({ width: 390, height: 844 });
  const bounds = (await toolbar.boundingBox())!;
  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(390);
  await editor.screenshot({
    path: test.info().outputPath("graph-toolbar-mobile.png"),
  });
});

test("layout Save submits final Start and Action positions only after an explicit click", async ({
  page,
}) => {
  const writes: string[] = [];
  await page.route("**/_serverFn/**", async route => {
    if (route.request().method() !== "POST") return route.abort("failed");
    writes.push(route.request().postData() ?? "");
    await respondGraphSave(route, page);
  });
  const editor = await mountLayoutEditor(page);
  const start = editor.locator(
    '.react-flow__node[data-id="22345678-1234-4234-8234-123456789abc"]'
  );
  const action = editor.locator(
    '.react-flow__node[data-id="42345678-1234-4234-8234-123456789abc"]'
  );
  await start.evaluate(node => node.setAttribute("data-retained", "true"));
  const viewport = await editor
    .locator(".react-flow__viewport")
    .evaluate(node => (node as HTMLElement).style.transform);
  const save = editor.getByRole("button", { name: "Save", exact: true });
  await expect(save).toBeDisabled();
  await dragNode(page, start, 60, 30);
  await dragNode(page, start, 45, 15);
  await dragNode(page, action, 20, 50);
  const positions = await editor
    .locator(".react-flow__node")
    .evaluateAll(nodes =>
      nodes.map(node => (node as HTMLElement).style.transform)
    );
  expect(writes).toHaveLength(0);
  await page.waitForTimeout(1100);
  expect(writes).toHaveLength(0);
  await expect(save).toBeEnabled();
  await save.click();
  await expect.poll(() => writes.length).toBe(1);
  await expect(save).toBeDisabled({ timeout: 15_000 });
  await expect(start).toHaveAttribute("data-retained", "true");
  await expect
    .poll(() =>
      editor
        .locator(".react-flow__node")
        .evaluateAll(nodes =>
          nodes.map(node => (node as HTMLElement).style.transform)
        )
    )
    .toEqual(positions);
  expect(
    await editor
      .locator(".react-flow__viewport")
      .evaluate(node => (node as HTMLElement).style.transform)
  ).toBe(viewport);
  expect(
    writes.filter(body => body.includes("22345678-1234-4234-8234-123456789abc"))
  ).toHaveLength(1);
  expect(
    writes.filter(body => body.includes("42345678-1234-4234-8234-123456789abc"))
  ).toHaveLength(1);
  const stored = await page.evaluate(async () => {
    const path = "/src/api/local/db.ts";
    const { localDB } = await import(/* @vite-ignore */ path);
    return localDB.all("SELECT x,y FROM RoutineTaskTable ORDER BY id");
  });
  expect(stored[0]).not.toEqual([-200, 0]);
  expect(stored[1]).not.toEqual([300, 0]);
  await editor.getByRole("button", { name: "Create", exact: true }).click();
  await expect(
    page.getByRole("menuitem", { name: "Dependency", exact: true })
  ).toHaveCount(0);
  await page.keyboard.press("Escape");
  await start.click({ position: { x: 20, y: 40 } });
  await expect(page.getByRole("menu")).toHaveCount(0);
  await editor
    .locator(".react-flow__pane")
    .click({ position: { x: 10, y: 10 } });
  await start.click({ position: { x: 20, y: 40 } });
  await expect(page.getByRole("menu")).toHaveCount(0);
  await start.click({ button: "right", position: { x: 20, y: 40 } });
  await expect(
    page.getByRole("menuitem", { name: "Edit", exact: true })
  ).toBeVisible();
  await page.keyboard.press("Escape");
});

test("Start creation and later layout edits stay local until one atomic save", async ({
  page,
}) => {
  const writes: import("@shared/api/interfaces/routineTaskDependency.interface").UpdateRoutineTaskGraphByRoutineIdRequest["body"][] =
    [];
  await page.route("**/_serverFn/**", async route => {
    if (route.request().method() !== "POST") return route.abort("failed");
    writes.push((fromJSON(route.request().postDataJSON()) as any).data.body);
    await respondGraphSave(route, page);
  });
  const editor = await mountLayoutEditor(page);
  const action = editor.locator(
    '.react-flow__node[data-id="42345678-1234-4234-8234-123456789abc"]'
  );
  await dragNode(page, action, 25, 20);
  await editor.getByRole("button", { name: "Create", exact: true }).click();
  await page.getByRole("menuitem", { name: "Start", exact: true }).click();
  await expect(editor.locator(".react-flow__node")).toHaveCount(3);
  await dragNode(page, action, 25, 20);
  expect(writes).toHaveLength(0);
  await editor.getByRole("button", { name: "Save", exact: true }).click();
  await expect.poll(() => writes.length).toBe(1);
  expect(writes[0].expectedDefinitionVersion).toBe(7);
  expect(writes[0].tasks.creates).toHaveLength(1);
  expect(writes[0].tasks.creates[0].kind).toBe("Start");
  expect(writes[0].tasks.updates).toHaveLength(1);
  await expect(
    editor.getByRole("button", { name: "Save", exact: true })
  ).toBeDisabled();
  expect(
    await page.evaluate(async () => {
      const path = "/src/api/local/db.ts";
      const { localDB } = await import(/* @vite-ignore */ path);
      return localDB.all("SELECT definition_version FROM RoutineTable");
    })
  ).toEqual([[8]]);
});

test("unsaved layout survives reload without a write or a queued mutation", async ({
  page,
}) => {
  let writes = 0;
  await page.route("**/_serverFn/**", async route => {
    if (route.request().method() !== "POST") return route.abort("failed");
    writes++;
    await respondGraphSave(route, page);
  });
  const editor = await mountLayoutEditor(page);
  const action = editor.locator(
    '.react-flow__node[data-id="42345678-1234-4234-8234-123456789abc"]'
  );
  await dragNode(page, action, 35, 25);
  const position = await action.evaluate(
    node => (node as HTMLElement).style.transform
  );
  const stored = await page.evaluate(async () => {
    const path = "/src/api/local/db.ts";
    const { localDB } = await import(/* @vite-ignore */ path);
    return {
      canonical: await localDB.all(
        "SELECT x,y FROM RoutineTaskTable WHERE kind='Action'"
      ),
      queue: await localDB.all("SELECT count(*) FROM TransactionTable"),
    };
  });
  expect(stored).toEqual({ canonical: [[300, 0]], queue: [[0]] });
  await page.reload();
  await page.evaluate(async () => {
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      get: () => false,
    });
    const path = "/test/e2e/routineGraphTestSupport.tsx";
    const { mountRoutineEditor } = await import(/* @vite-ignore */ path);
    await mountRoutineEditor();
  });
  await expect(action).toBeVisible();
  await expect
    .poll(() => action.evaluate(node => (node as HTMLElement).style.transform))
    .toBe(position);
  const save = editor.getByRole("button", { name: "Save", exact: true });
  await expect(save).toBeEnabled();
  await page.waitForTimeout(1100);
  expect(writes).toBe(0);
  await page.evaluate(() =>
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      get: () => true,
    })
  );
  await save.click();
  await expect.poll(() => writes).toBe(1);
  await expect(save).toBeDisabled();
});

test("a cold workspace loads Routine details by ID without replacing its unsaved graph", async ({
  page,
}) => {
  const editor = await mountLayoutEditor(page, true);
  const action = editor.locator(
    '.react-flow__node[data-id="42345678-1234-4234-8234-123456789abc"]'
  );
  await dragNode(page, action, 45, 30);
  const position = await action.evaluate(
    node => (node as HTMLElement).style.transform
  );
  await action.click({ button: "right", position: { x: 20, y: 20 } });
  await page.getByRole("menuitem", { name: "Edit", exact: true }).click();
  await page.locator("#routine-task-inspector-title").fill("Unsaved Action");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Save", exact: true })
    .click();
  await editor.getByRole("button", { name: "Create", exact: true }).click();
  await page.getByRole("menuitem", { name: "Start", exact: true }).click();
  await expect(editor.locator(".react-flow__node")).toHaveCount(3);
  const source = (await editor
    .locator(
      '.react-flow__node[data-id="22345678-1234-4234-8234-123456789abc"] .react-flow__handle.source'
    )
    .boundingBox())!;
  const target = (await action
    .locator(".react-flow__handle.target")
    .boundingBox())!;
  await page.mouse.move(
    source.x + source.width / 2,
    source.y + source.height / 2
  );
  await page.mouse.down();
  await page.mouse.move(
    target.x + target.width / 2,
    target.y + target.height / 2,
    { steps: 12 }
  );
  await page.mouse.up();
  await expect(editor.locator(".react-flow__edge")).toHaveCount(1);
  await expect
    .poll(() =>
      page.evaluate(async () => {
        const path = "/src/api/local/db.ts";
        const { localDB } = await import(/* @vite-ignore */ path);
        const rows = await localDB.all(
          "SELECT edges FROM RoutineTaskDependencyGraphDraftTable"
        );
        return JSON.parse(rows[0][0]).length;
      })
    )
    .toBe(1);
  const fixture = await page.evaluate(async () => {
    const load = (path: string) => import(/* @vite-ignore */ path);
    const { localDB } = await load("/src/api/local/db.ts");
    const { RoutineLocalSimulator } = await load(
      "/src/api/local/simulators/routine.simulator.ts"
    );
    const { StationLocalSimulator } = await load(
      "/src/api/local/simulators/station.simulator.ts"
    );
    return {
      parent: {
        ...(await RoutineLocalSimulator.simulateGetMyRoutineById({
          param: { routineId: "12345678-1234-4234-8234-123456789abc" },
        })),
        title: "Loaded by ID",
        definitionVersion: 12,
      },
      station: {
        ...(await StationLocalSimulator.simulateGetMyStationById({
          param: { stationId: "32345678-1234-4234-8234-123456789abc" },
        })),
        name: "Direct station",
      },
      draft: await localDB.all(
        "SELECT nodes,edges FROM RoutineTaskDependencyGraphDraftTable"
      ),
      tasks: await localDB.all(
        "SELECT id,title,x,y FROM RoutineTaskTable ORDER BY id"
      ),
    };
  });
  const reads: string[] = [];
  let writes = 0;
  await page.route("**/_serverFn/**", async route => {
    const request = route.request();
    const payload =
      request.method() === "GET"
        ? JSON.parse(new URL(request.url()).searchParams.get("payload")!)
        : request.postDataJSON();
    const { data } = fromJSON(payload) as {
      data: {
        body?: unknown;
        param?: { routineId?: string; stationId?: string };
      };
    };
    if (data.body) {
      writes++;
      return route.abort("failed");
    }
    reads.push(data.param?.stationId ? "station" : "routine");
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        result: {
          success: true,
          exception: null,
          data: data.param?.stationId ? fixture.station : fixture.parent,
          embedded: { publicId: "editor-user" },
        },
      }),
    });
  });
  await page.reload();
  await page.evaluate(async () => {
    const path = "/test/e2e/routineGraphTestSupport.tsx";
    const { mountRoutineEditor } = await import(/* @vite-ignore */ path);
    await mountRoutineEditor(true, false);
  });
  await expect(
    editor.getByRole("button", { name: "Loaded by ID" })
  ).toBeVisible();
  await expect(
    editor.getByText("Direct station", { exact: true })
  ).toBeVisible();
  await expect(editor.getByText("No routines", { exact: true })).toHaveCount(0);
  await expect(editor.locator(".react-flow__node")).toHaveCount(3);
  await expect(
    action.getByText("Unsaved Action", { exact: true })
  ).toBeVisible();
  expect(
    await action.evaluate(node => (node as HTMLElement).style.transform)
  ).toBe(position);
  await expect(editor.locator(".react-flow__edge")).toHaveCount(1);
  await expect(
    editor.getByRole("button", { name: "Save", exact: true })
  ).toBeDisabled();
  await expect(
    editor.getByRole("button", { name: "Review latest changes", exact: true })
  ).toBeVisible();
  const retained = await page.evaluate(async () => {
    const path = "/src/api/local/db.ts";
    const { localDB } = await import(/* @vite-ignore */ path);
    return {
      draft: await localDB.all(
        "SELECT nodes,edges FROM RoutineTaskDependencyGraphDraftTable"
      ),
      tasks: await localDB.all(
        "SELECT id,title,x,y FROM RoutineTaskTable ORDER BY id"
      ),
      queue: await localDB.all("SELECT count(*) FROM TransactionTable"),
    };
  });
  expect(retained).toEqual({
    draft: fixture.draft,
    tasks: fixture.tasks,
    queue: [[0]],
  });
  expect(JSON.parse(retained.draft[0][0]).snapshot.definitionVersion).toBe(7);
  expect(reads).toEqual(["routine", "station"]);
  expect(writes).toBe(0);
});

test("layout conflicts retain the draft without retrying on rerenders", async ({
  page,
}) => {
  let writes = 0;
  const error = new NotegicAPIError(
    new NotegicException(
      {
        reason: "DefinitionConflict",
        domain: "Routine",
        operation: "UpdateDefinition",
        message: "The routine was changed; refresh before applying this edit",
        retryable: false,
      },
      409
    )
  );
  const serialized = JSON.stringify(
    await toCrossJSONAsync(
      { error },
      {
        plugins: [makeSerovalPlugin(apiErrorSerialization)],
      }
    )
  );
  await page.route("**/_serverFn/**", async route => {
    if (route.request().method() !== "POST") return route.abort("failed");
    writes++;
    await route.fulfill({
      contentType: "application/json",
      headers: { "x-tss-serialized": "true" },
      body: serialized,
    });
  });
  const editor = await mountLayoutEditor(page);
  await dragNode(
    page,
    editor.locator(
      '.react-flow__node[data-id="42345678-1234-4234-8234-123456789abc"]'
    ),
    30,
    20
  );
  expect(writes).toBe(0);
  await editor.getByRole("button", { name: "Save", exact: true }).click();
  await expect.poll(() => writes).toBe(1);
  await expect(
    page.getByText(
      "This routine changed. Review the latest version before saving.",
      {
        exact: true,
      }
    )
  ).toBeVisible();
  await page.evaluate(async () => {
    const path = "/src/i18n/index.ts";
    const { default: i18n } = await import(/* @vite-ignore */ path);
    await i18n.changeLanguage("zh-TW");
  });
  await page.waitForTimeout(1800);
  expect(writes).toBe(1);
  expect(
    await page.evaluate(async () => {
      const path = "/src/api/local/db.ts";
      const { localDB } = await import(/* @vite-ignore */ path);
      return localDB.all(
        "SELECT nodes FROM RoutineTaskDependencyGraphDraftTable"
      );
    })
  ).not.toEqual([]);
});

test("version conflicts preserve drafts and require review plus a separate atomic Save", async ({
  page,
}) => {
  const editor = await mountLayoutEditor(page, true);
  const action = editor.locator(
    '.react-flow__node[data-id="42345678-1234-4234-8234-123456789abc"]'
  );
  await action.click({ button: "right", position: { x: 20, y: 20 } });
  await page.getByRole("menuitem", { name: "Edit", exact: true }).click();
  await page.locator("#routine-task-inspector-title").fill("My unsaved title");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Save", exact: true })
    .click();
  const fixture = await page.evaluate(async () => {
    const load = (path: string) => import(/* @vite-ignore */ path);
    const { localDB } = await load("/src/api/local/db.ts");
    const { RoutineTask } = await load("/src/api/local/schemas/index.ts");
    const { RoutineLocalSimulator } = await load(
      "/src/api/local/simulators/routine.simulator.ts"
    );
    return {
      parent: {
        ...(await RoutineLocalSimulator.simulateGetMyRoutineById({
          param: { routineId: "12345678-1234-4234-8234-123456789abc" },
        })),
        definitionVersion: 8,
      },
      tasks: (await localDB.select().from(RoutineTask)).map((task: any) =>
        task.kind === "Action" ? { ...task, title: "Collaborator title" } : task
      ),
    };
  });
  let writes = 0,
    reads = 0;
  let readFailure: "network" | "version" | null = null;
  const conflict = JSON.stringify(
    await toCrossJSONAsync(
      {
        error: new NotegicAPIError(
          new NotegicException(
            {
              reason: "DefinitionConflict",
              domain: "RoutineTaskDependency",
              operation: "UpdateGraph",
              message:
                "The routine was changed; refresh before applying this edit",
              retryable: false,
            },
            409
          )
        ),
      },
      { plugins: [makeSerovalPlugin(apiErrorSerialization)] }
    )
  );
  await page.route("**/_serverFn/**", async route => {
    const request = route.request();
    const payload =
      request.method() === "GET"
        ? JSON.parse(new URL(request.url()).searchParams.get("payload")!)
        : request.postDataJSON();
    const { data } = fromJSON(payload) as {
      data: { body?: { expectedDefinitionVersion: number } };
    };
    if (data.body) {
      writes++;
      if (writes === 1)
        return route.fulfill({
          contentType: "application/json",
          headers: { "x-tss-serialized": "true" },
          body: conflict,
        });
      expect(data.body.expectedDefinitionVersion).toBe(8);
      return respondGraphSave(route, page);
    }
    if (readFailure === "network") {
      readFailure = null;
      return route.abort("failed");
    }
    const step = reads++ % 4;
    const parent =
      step === 3 && readFailure === "version"
        ? { ...fixture.parent, definitionVersion: 9 }
        : fixture.parent;
    if (step === 3) readFailure = null;
    return route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        result: {
          success: true,
          exception: null,
          data: step === 1 ? fixture.tasks : step === 2 ? [] : parent,
          embedded: { publicId: "editor-user" },
        },
      }),
    });
  });
  await editor.getByRole("button", { name: "Save", exact: true }).click();
  await expect(
    editor.getByRole("button", { name: "Review latest changes", exact: true })
  ).toBeVisible();
  await expect(
    editor.getByRole("button", { name: "Save", exact: true })
  ).toBeDisabled();
  await editor
    .getByRole("button", { name: "Review latest changes", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByText('"My unsaved title"', { exact: true })
  ).toBeVisible();
  await expect(
    dialog.getByText('"Collaborator title"', { exact: true })
  ).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: "Apply to draft", exact: true })
  ).toBeDisabled();
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  expect(writes).toBe(1);
  await expect(
    action.getByText("My unsaved title", { exact: true })
  ).toBeVisible();
  for (const failure of ["network", "version"] as const) {
    readFailure = failure;
    await editor
      .getByRole("button", { name: "Review latest changes", exact: true })
      .click();
    await expect(
      editor.getByRole("button", { name: "Review latest changes", exact: true })
    ).toBeEnabled();
    await expect(dialog).toHaveCount(0);
    const version = await page.evaluate(async () => {
      const path = "/src/api/local/db.ts";
      const { localDB } = await import(/* @vite-ignore */ path);
      const [[nodes]] = await localDB.all(
        "SELECT nodes FROM RoutineTaskDependencyGraphDraftTable"
      );
      return JSON.parse(nodes).snapshot.definitionVersion;
    });
    expect(version).toBe(7);
    expect(writes).toBe(1);
  }
  await editor
    .getByRole("button", { name: "Review latest changes", exact: true })
    .click();
  await dialog.getByRole("button", { name: "Keep mine", exact: true }).click();
  await dialog
    .getByRole("button", { name: "Apply to draft", exact: true })
    .click();
  await expect(dialog).toHaveCount(0);
  expect(writes).toBe(1);
  await page.reload();
  await page.evaluate(async () => {
    const path = "/test/e2e/routineGraphTestSupport.tsx";
    const { mountRoutineEditor } = await import(/* @vite-ignore */ path);
    await mountRoutineEditor(true);
  });
  await expect(
    action.getByText("My unsaved title", { exact: true })
  ).toBeVisible();
  expect(writes).toBe(1);
  await editor.getByRole("button", { name: "Save", exact: true }).click();
  await expect.poll(() => writes).toBe(2);
  await expect(
    editor.getByRole("button", { name: "Save", exact: true })
  ).toBeDisabled();
});

test("handle dragging creates a dependency and its left-click menu edits or deletes only the edge", async ({
  page,
}) => {
  let writes = 0;
  await page.route("**/_serverFn/**", async route => {
    if (route.request().method() !== "POST") return route.abort("failed");
    writes++;
    await respondGraphSave(route, page);
  });
  const editor = await mountLayoutEditor(page);
  const source = await editor
    .locator(
      '.react-flow__node[data-id="22345678-1234-4234-8234-123456789abc"] .react-flow__handle.source'
    )
    .boundingBox();
  const target = await editor
    .locator(
      '.react-flow__node[data-id="42345678-1234-4234-8234-123456789abc"] .react-flow__handle.target'
    )
    .boundingBox();
  expect(source).not.toBeNull();
  expect(target).not.toBeNull();
  expect(source!.width).toBeGreaterThanOrEqual(12);
  expect(target!.width).toBeGreaterThanOrEqual(12);
  await page.mouse.move(
    source!.x + source!.width / 2,
    source!.y + source!.height / 2
  );
  await page.mouse.down();
  await page.mouse.move(
    target!.x + target!.width / 2,
    target!.y + target!.height / 2,
    { steps: 12 }
  );
  await page.mouse.up();
  const edge = editor.locator(".react-flow__edge");
  await expect(edge).toHaveCount(1);
  await expect(
    editor.locator("marker.react-flow__arrowhead").first()
  ).toHaveAttribute("markerWidth", "24");
  expect(writes).toBe(0);
  await editor.getByRole("button", { name: "Save", exact: true }).click();
  await expect.poll(() => writes).toBe(1);
  await expect(
    editor.getByRole("button", { name: "Save", exact: true })
  ).toBeDisabled();
  await expect(page.getByRole("menu")).toHaveCount(0);
  const midpoint = await edge
    .locator(".react-flow__edge-interaction")
    .evaluate(path => {
      const curve = path as SVGPathElement;
      const point = curve
        .getPointAtLength(curve.getTotalLength() / 2)
        .matrixTransform(curve.getScreenCTM()!);
      return { x: point.x, y: point.y };
    });
  await page.mouse.click(midpoint.x, midpoint.y);
  await expect(
    page.getByRole("menuitem", { name: "Edit", exact: true })
  ).toBeVisible();
  await expect(
    page
      .getByRole("menuitem", { name: "Edit", exact: true })
      .locator("svg.lucide-square-pen")
  ).toBeVisible();
  await expect(page.locator("#routine-dependency-description")).toHaveCount(0);
  await page.getByRole("menuitem", { name: "Edit", exact: true }).click();
  await expect(page.locator("#routine-dependency-description")).toBeVisible();
  await editor
    .locator(".react-flow__pane")
    .click({ position: { x: 10, y: 10 } });
  await expect(page.locator("#routine-dependency-description")).toHaveCount(0);
  await page.mouse.click(midpoint.x, midpoint.y);
  await page.getByRole("menuitem", { name: "Delete", exact: true }).click();
  expect(writes).toBe(1);
  await editor.getByRole("button", { name: "Save", exact: true }).click();
  await expect.poll(() => writes).toBe(2);
  await expect(edge).toHaveCount(0);
  await expect(page.getByRole("menu")).toHaveCount(0);
  await expect(editor.locator(".react-flow__node")).toHaveCount(2);
  await expect
    .poll(() =>
      page.evaluate(async () => {
        const path = "/src/api/local/db.ts";
        const { localDB } = await import(/* @vite-ignore */ path);
        return localDB.all("SELECT count(*) FROM RoutineDependencyTable");
      })
    )
    .toEqual([[0]]);
});

test("saving freezes graph edits; failed and offline saves remain drafts rather than queued mutations", async ({
  page,
}) => {
  let writes = 0;
  let release = () => {};
  const acknowledgement = new Promise<void>(resolve => {
    release = resolve;
  });
  await page.route("**/_serverFn/**", async route => {
    if (route.request().method() !== "POST") return route.abort("failed");
    writes++;
    if (writes === 1) {
      await acknowledgement;
      await respondGraphSave(route, page);
    } else await route.abort("failed");
  });
  const editor = await mountLayoutEditor(page);
  const start = editor.locator(
    '.react-flow__node[data-id="22345678-1234-4234-8234-123456789abc"]'
  );
  await dragNode(page, start, 40, 20);
  const save = editor.getByRole("button", { name: "Save", exact: true });
  const transform = await start.evaluate(
    node => (node as HTMLElement).style.transform
  );
  await save.click();
  await expect.poll(() => writes).toBe(1);
  const saving = editor.getByRole("button", { name: "Saving", exact: true });
  await expect(saving).toBeDisabled();
  await expect(saving).toHaveAttribute("aria-busy", "true");
  await expect(
    editor.getByRole("button", { name: "Active", exact: true })
  ).toBeDisabled();
  const box = (await start.boundingBox())!;
  await page.mouse.move(box.x + 20, box.y + 40);
  await page.mouse.down();
  await page.mouse.move(box.x + 80, box.y + 70, { steps: 5 });
  await page.mouse.up();
  expect(
    await start.evaluate(node => (node as HTMLElement).style.transform)
  ).toBe(transform);
  release();
  await expect(save).toBeDisabled();
  await expect(saving).toHaveCount(0);
  await expect(
    page.getByText("Routine saved.", { exact: true }).first()
  ).toBeVisible();
  await expect(
    page.getByText(/saved locally|Backend sync is pending/)
  ).toHaveCount(0);
  await dragNode(page, start, 25, 25);
  await save.click();
  await expect.poll(() => writes).toBe(2);
  await expect(save).toBeEnabled();
  await page.waitForTimeout(1200);
  expect(writes).toBe(2);
  const local = await page.evaluate(async () => {
    const path = "/src/api/local/db.ts";
    const { localDB } = await import(/* @vite-ignore */ path);
    return {
      queue: await localDB.all("SELECT count(*) FROM TransactionTable"),
      draft: await localDB.all(
        "SELECT count(*) FROM RoutineTaskDependencyGraphDraftTable"
      ),
    };
  });
  expect(local).toEqual({ queue: [[0]], draft: [[1]] });
  await page.evaluate(() =>
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      get: () => false,
    })
  );
  await save.click();
  await expect(save).toBeEnabled();
  expect(writes).toBe(2);
});

test("starting nodes expose only outgoing handles, remain draggable, and edit their own activation", async ({
  page,
}) => {
  await page.evaluate(async () => {
    const path = "/test/e2e/routineGraphTestSupport.tsx";
    const { mountRoutineGraph } = await import(/* @vite-ignore */ path);
    mountRoutineGraph();
  });
  const fixture = page.locator("#routine-graph-test-root");
  await fixture.getByRole("button", { name: "Create", exact: true }).click();
  await expect(
    page.getByRole("menuitem", { name: "Action", exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole("menuitem", { name: "Routine task", exact: true })
  ).toHaveCount(0);
  await expect(
    page
      .getByRole("menuitem", { name: "Start", exact: true })
      .locator(".lucide-git-fork")
  ).toBeVisible();
  await expect(
    page
      .getByRole("menuitem", { name: "Action", exact: true })
      .locator(".lucide-square-function")
  ).toBeVisible();
  await page.getByRole("menuitem", { name: "Start", exact: true }).click();
  const start = fixture.locator('.react-flow__node[data-id="start-1"]');
  await expect(start.locator(".react-flow__handle.target")).toHaveCount(0);
  await expect(start.locator(".react-flow__handle.source")).toHaveCount(1);
  await expect(
    fixture.locator(
      '.react-flow__node[data-id="action"] .react-flow__handle.target'
    )
  ).toHaveCount(1);
  const circle = start.locator('[data-node-kind="Start"]');
  await expect(circle).toBeVisible();
  await fixture.getByRole("button", { name: "Fit View", exact: true }).click();
  await expect(circle).toHaveClass(/rounded-full/);
  await expect(circle).toHaveAttribute("data-active", "true");
  await expect(start.getByRole("textbox")).toHaveCount(0);
  await expect(start.getByText("Daily entry", { exact: true })).toBeVisible();
  await start.click({ position: { x: 20, y: 40 } });
  await expect(fixture.getByLabel("Editing node")).toHaveText("");
  await expect(page.getByRole("menu")).toHaveCount(0);
  await expect(start.getByRole("button", { name: /^More:/ })).toHaveCount(0);
  await circle.focus();
  await circle.press("Enter");
  await expect(
    page.getByRole("menuitem", { name: "Edit", exact: true })
  ).toBeVisible();
  await expect(
    page
      .getByRole("menuitem", { name: "Edit", exact: true })
      .locator("svg.lucide-square-pen")
  ).toBeVisible();
  await expect(
    page.getByRole("menuitemcheckbox", { name: "Active", exact: true })
  ).toHaveAttribute("aria-checked", "true");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu")).toHaveCount(0);
  await start.focus();
  await start.press("Enter");
  await expect(
    page.getByRole("menuitemcheckbox", { name: "Active", exact: true })
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await start.click({ button: "right", position: { x: 20, y: 40 } });
  await expect(
    page.getByRole("menuitem", { name: "Edit", exact: true })
  ).toBeVisible();
  await page
    .getByRole("menuitemcheckbox", { name: "Active", exact: true })
    .click();
  await expect(circle).toHaveAttribute("data-active", "false");
  await start.click({ button: "right", position: { x: 20, y: 40 } });
  await expect(
    page.getByRole("menuitemcheckbox", { name: "Active" })
  ).toHaveAttribute("aria-checked", "false");
  await page.getByRole("menuitem", { name: "Edit", exact: true }).click();
  await expect(fixture.getByLabel("Editing node")).toHaveText("start-1");
  await expect(page.getByRole("menu")).toHaveCount(0);
  const before = await start.boundingBox();
  expect(before).not.toBeNull();
  await dragNode(page, start, 100, 60);
  const after = await start.boundingBox();
  expect(after!.x).toBeGreaterThan(before!.x + 50);
  const action = fixture.locator('.react-flow__node[data-id="action"]');
  await action.click({ position: { x: 20, y: 20 } });
  await expect(fixture.getByLabel("Editing node")).toHaveText("start-1");
  await expect(page.getByRole("menu")).toHaveCount(0);
  await expect(action.getByRole("button", { name: /^More:/ })).toHaveCount(0);
  await action.click({ button: "right", position: { x: 20, y: 20 } });
  await expect(page.getByRole("menuitemcheckbox")).toHaveCount(0);
  await expect(
    page.getByRole("menuitem", { name: "Delete", exact: true })
  ).toBeVisible();
  await page.getByRole("menuitem", { name: "Edit", exact: true }).click();
  await expect(fixture.getByLabel("Editing node")).toHaveText("action");
  await action.click({ button: "right", position: { x: 20, y: 20 } });
  await expect(
    page.getByRole("menuitem", { name: "Delete", exact: true })
  ).toBeVisible();
  await page.keyboard.press("Escape");
  const actionCard = action.locator('[data-node-kind="Action"]');
  await actionCard.focus();
  await actionCard.press("Enter");
  await expect(
    page.getByRole("menuitem", { name: "Edit", exact: true })
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu")).toHaveCount(0);
  await action.focus();
  await action.press("Enter");
  await expect(page.getByRole("menuitemcheckbox")).toHaveCount(0);
  await page
    .getByRole("menuitem", { name: "Edit", exact: true })
    .press("Enter");
  await expect(page.getByRole("menu")).toHaveCount(0);
  await start.locator(".react-flow__handle.source").click();
  await expect(page.getByRole("menu")).toHaveCount(0);
  await page.keyboard.press("Escape");
});

test("SQLocal preserves a populated Routine graph, queue and draft across down/up and reload", async ({
  page,
}) => {
  const result = await page.evaluate(async () => {
    const importModule = (path: string) => import(/* @vite-ignore */ path);
    const { localDB } = await importModule("/src/api/local/db.ts");
    const { LocalDBMigrator } = await importModule(
      "/src/api/local/migrator.ts"
    );
    const { getOrderedMigrations } = await importModule(
      "/src/api/local/migrationCatalog.ts"
    );
    await localDB.ensureReady();
    const { sql } = await importModule("/test/e2e/localDatabaseTestSupport.ts");
    const migrator = new LocalDBMigrator(
      {
        transaction: (
          operation: (client: {
            run: (query: string) => Promise<unknown>;
          }) => Promise<unknown>
        ) =>
          localDB.transaction(
            async (transaction: {
              all: (query: unknown) => Promise<unknown[]>;
            }) =>
              operation({
                run: async query => {
                  const rows = await transaction.all(sql.raw(query));
                  return query === "PRAGMA user_version"
                    ? rows.map(row =>
                        Array.isArray(row) ? { user_version: row[0] } : row
                      )
                    : rows;
                },
              })
          ),
      },
      getOrderedMigrations()
    );
    for (let version = getOrderedMigrations().length; version > 3; version--)
      await migrator.down(version);
    await localDB.run(
      "INSERT INTO StationTable (id,name) VALUES ('graph-station','Graph station')"
    );
    await localDB.run(
      "INSERT INTO UserTable (public_id,name,display_name,email) VALUES ('graph-user','GraphUser','Graph user','graph@example.invalid')"
    );
    await localDB.run(
      "INSERT INTO RoutineTable (id,station_id,title) VALUES ('12345678-1234-4234-8234-123456789abc','graph-station','Graph migration')"
    );
    await localDB.run(
      `INSERT INTO RoutineTaskTable (id,routine_id,purpose,payload) VALUES ('graph-task','12345678-1234-4234-8234-123456789abc','GetRoutine','{"routineId":"existing"}')`
    );
    await localDB.run(
      `INSERT INTO RoutineTaskDependencyGraphDraftTable (routine_id,nodes,edges) VALUES ('12345678-1234-4234-8234-123456789abc','[{"id":"graph-task","position":{"x":23,"y":47}}]','[]')`
    );
    await localDB.run(
      `INSERT INTO TransactionTable (owner_public_id,entity_type,action_type,body) VALUES ('graph-user','Routine','UPDATE','{"values":{"title":"Pending"}}')`
    );
    await migrator.ensureMigrated({ currentVersion: 3 });
    const before = await localDB.all(
      "SELECT id,kind,x,y,payload FROM RoutineTaskTable ORDER BY id"
    );
    for (let version = getOrderedMigrations().length; version > 3; version--)
      await migrator.down(version);
    await migrator.ensureMigrated({ currentVersion: 3 });
    return {
      before,
      expectedVersion: getOrderedMigrations().length,
      after: await localDB.all(
        "SELECT id,kind,x,y,payload FROM RoutineTaskTable ORDER BY id"
      ),
      pending: await localDB.all("SELECT count(*) FROM TransactionTable"),
      drafts: await localDB.all(
        "SELECT nodes FROM RoutineTaskDependencyGraphDraftTable"
      ),
    };
  });
  expect(result.after).toEqual(result.before);
  expect(result.before).toHaveLength(2);
  expect(result.pending).toEqual([[1]]);
  expect(result.drafts).toEqual([
    ['[{"id":"graph-task","position":{"x":23,"y":47}}]'],
  ]);
  await page.reload();
  const rows = await page.evaluate(async () => {
    const path = "/src/api/local/db.ts";
    const { localDB } = await import(/* @vite-ignore */ path);
    return {
      version: await localDB.all("PRAGMA user_version"),
      nodes: await localDB.all(
        "SELECT id,kind,x,y,payload FROM RoutineTaskTable ORDER BY id"
      ),
    };
  });
  expect(rows.version).toEqual([[result.expectedVersion]]);
  expect(rows.nodes).toEqual(result.before);
});

test("coming online never submits an unconfirmed graph draft", async ({
  page,
}) => {
  let writes = 0;
  await page.route("**/_serverFn/**", async route => {
    if (route.request().method() === "POST") writes++;
    await route.abort("failed");
  });
  const editor = await mountLayoutEditor(page);
  await editor.getByRole("button", { name: "Create", exact: true }).click();
  await page.getByRole("menuitem", { name: "Start", exact: true }).click();
  await expect(editor.locator(".react-flow__node")).toHaveCount(3);
  await page.evaluate(() => window.dispatchEvent(new Event("online")));
  await page.waitForTimeout(1400);
  expect(writes).toBe(0);
  await expect(editor.getByRole("button", { name: /Retry sync/ })).toHaveCount(
    0
  );
  expect(
    await page.evaluate(async () => {
      const path = "/src/api/local/db.ts";
      const { localDB } = await import(/* @vite-ignore */ path);
      return localDB.all("SELECT count(*) FROM TransactionTable");
    })
  ).toEqual([[0]]);
});

test("node dialogs stage final definitions and deletion removes stale layout operations", async ({
  page,
}) => {
  const writes: any[] = [];
  await page.route("**/_serverFn/**", async route => {
    if (route.request().method() !== "POST") return route.abort("failed");
    writes.push((fromJSON(route.request().postDataJSON()) as any).data.body);
    await respondGraphSave(route, page);
  });
  const editor = await mountLayoutEditor(page);
  const action = editor.locator(
    '.react-flow__node[data-id="42345678-1234-4234-8234-123456789abc"]'
  );
  await dragNode(page, action, 35, 30);
  await editor.getByRole("button", { name: "Create", exact: true }).click();
  await page.getByRole("menuitem", { name: "Start", exact: true }).click();
  const created = editor
    .locator(".react-flow__node")
    .filter({ has: page.getByRole("group", { name: "Start", exact: true }) });
  await expect(created).toHaveCount(1);
  await created.click({ button: "right", position: { x: 20, y: 40 } });
  await page.getByRole("menuitem", { name: "Edit", exact: true }).click();
  await page.locator("#routine-task-inspector-title").fill("Final draft entry");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Save", exact: true })
    .click();
  await expect(
    editor.getByRole("group", { name: "Final draft entry", exact: true })
  ).toBeVisible();
  await action.click({ button: "right", position: { x: 20, y: 20 } });
  await page.getByRole("menuitem", { name: "Delete", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Delete", exact: true })
    .click();
  await expect(action).toHaveCount(0);
  expect(writes).toHaveLength(0);
  await editor.getByRole("button", { name: "Save", exact: true }).click();
  await expect.poll(() => writes.length).toBe(1);
  expect(writes[0].tasks.creates).toHaveLength(1);
  expect(writes[0].tasks.creates[0].title).toBe("Final draft entry");
  expect(writes[0].tasks.updates).toEqual([]);
  expect(writes[0].tasks.deletes).toEqual([
    "42345678-1234-4234-8234-123456789abc",
  ]);
  await expect(
    editor.getByRole("button", { name: "Save", exact: true })
  ).toBeDisabled();
});

test("creating then deleting a node cancels the draft operation without any request", async ({
  page,
}) => {
  let writes = 0;
  await page.route("**/_serverFn/**", async route => {
    if (route.request().method() === "POST") writes++;
    await route.abort("failed");
  });
  const editor = await mountLayoutEditor(page);
  await editor.getByRole("button", { name: "Create", exact: true }).click();
  await page.getByRole("menuitem", { name: "Start", exact: true }).click();
  const created = editor
    .locator(".react-flow__node")
    .filter({ has: page.getByRole("group", { name: "Start", exact: true }) });
  await created.click({ button: "right", position: { x: 20, y: 40 } });
  await page.getByRole("menuitem", { name: "Delete", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Delete", exact: true })
    .click();
  await expect(editor.locator(".react-flow__node")).toHaveCount(2);
  await expect(
    editor.getByRole("button", { name: "Save", exact: true })
  ).toBeDisabled();
  expect(writes).toBe(0);
});

test("the shared Action dialog and Inspector only edit the local graph until toolbar Save", async ({
  page,
}) => {
  const writes: any[] = [];
  await page.route("**/_serverFn/**", async route => {
    if (route.request().method() !== "POST") return route.abort("failed");
    writes.push((fromJSON(route.request().postDataJSON()) as any).data.body);
    await respondGraphSave(route, page);
  });
  const editor = await mountLayoutEditor(page);
  await createGraphAction(page, editor, "Draft Action");
  const created = editor.getByRole("group", {
    name: "Draft Action",
    exact: true,
  });
  await expect(created).toBeVisible();
  await created.click({ button: "right" });
  await page.getByRole("menuitem", { name: "Edit", exact: true }).click();
  await page.locator("#routine-task-inspector-title").fill("Final Action");
  await page.locator("#routine-task-inspector-priority").fill("5");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Save", exact: true })
    .click();
  await expect(
    editor.getByRole("group", { name: "Final Action", exact: true })
  ).toBeVisible();
  expect(writes).toHaveLength(0);
  await editor.getByRole("button", { name: "Save", exact: true }).click();
  await expect.poll(() => writes.length).toBe(1);
  expect(writes[0].tasks.creates).toHaveLength(1);
  expect(writes[0].tasks.creates[0]).toMatchObject({
    kind: "Action",
    title: "Final Action",
    priority: 5,
    payload: { purpose: "GetRoutine" },
  });
  expect(writes[0].tasks.updates).toEqual([]);
  await expect(
    editor.getByRole("button", { name: "Save", exact: true })
  ).toBeDisabled();
  expect(
    await page.evaluate(async () => {
      const path = "/src/api/local/db.ts";
      const { localDB } = await import(/* @vite-ignore */ path);
      return localDB.all("SELECT count(*) FROM RoutinesToTasksTable");
    })
  ).toEqual([[2]]);
});

test("a confirmed remote commit survives local failure and reload without replaying the write", async ({
  page,
}) => {
  let writes = 0;
  await page.route("**/_serverFn/**", async route => {
    if (route.request().method() !== "POST") return route.abort("failed");
    writes++;
    await respondGraphSave(route, page);
  });
  const editor = await mountLayoutEditor(page);
  const action = editor.locator(
    '.react-flow__node[data-id="42345678-1234-4234-8234-123456789abc"]'
  );
  await dragNode(page, action, 30, 25);
  await page.evaluate(async () => {
    const path = "/src/api/local/db.ts";
    const { localDB } = await import(/* @vite-ignore */ path);
    await localDB.run(
      "CREATE TRIGGER reject_graph_cache BEFORE UPDATE ON RoutineTable BEGIN SELECT RAISE(ABORT, 'fixture cache failure'); END"
    );
  });
  await editor.getByRole("button", { name: "Save", exact: true }).click();
  await expect.poll(() => writes).toBe(1);
  await expect(
    editor.getByRole("button", { name: "Save", exact: true })
  ).toBeEnabled();
  await expect
    .poll(() =>
      page.evaluate(async () => {
        const path = "/src/api/local/db.ts";
        const { localDB } = await import(/* @vite-ignore */ path);
        const rows = await localDB.all(
          "SELECT nodes FROM RoutineTaskDependencyGraphDraftTable"
        );
        return JSON.parse(rows[0][0]).snapshot.confirmed?.definitionVersion;
      })
    )
    .toBe(8);
  await page.reload();
  await page.evaluate(async () => {
    const path = "/test/e2e/routineGraphTestSupport.tsx";
    const { mountRoutineEditor } = await import(/* @vite-ignore */ path);
    await mountRoutineEditor();
  });
  await expect(action).toBeVisible();
  await page.evaluate(async () => {
    const path = "/src/api/local/db.ts";
    const { localDB } = await import(/* @vite-ignore */ path);
    await localDB.run("DROP TRIGGER reject_graph_cache");
  });
  await editor.getByRole("button", { name: "Save", exact: true }).click();
  await expect(
    editor.getByRole("button", { name: "Save", exact: true })
  ).toBeDisabled();
  expect(writes).toBe(1);
  expect(
    await page.evaluate(async () => {
      const path = "/src/api/local/db.ts";
      const { localDB } = await import(/* @vite-ignore */ path);
      return localDB.all(
        "SELECT count(*) FROM RoutineTaskDependencyGraphDraftTable"
      );
    })
  ).toEqual([[0]]);
});

test("offline routine activation and canonical local payloads survive storage and replay", async ({
  page,
}) => {
  const result = await page.evaluate(async () => {
    const load = (path: string) => import(/* @vite-ignore */ path);
    const { localDB } = await load("/src/api/local/db.ts");
    const { RoutineTaskLocalSimulator } = await load(
      "/src/api/local/simulators/routineTask.simulator.ts"
    );
    const { RoutineTaskLocalSynchronizer } = await load(
      "/src/api/local/synchronizers/routineTask.synchronizer.ts"
    );
    await localDB.ensureReady();
    await localDB.run(
      `INSERT INTO UserTable (public_id,name,display_name,email,is_logged_in) VALUES ('editor-user','User','User','editor@example.invalid',1)`
    );
    await localDB.run(
      `INSERT INTO StationTable (id,name) VALUES ('32345678-1234-4234-8234-123456789abc','Fixture station')`
    );
    await localDB.run(
      `INSERT INTO UsersToStationsTable (user_public_id,station_id,permission) VALUES ('editor-user','32345678-1234-4234-8234-123456789abc','Owner')`
    );
    await localDB.run(
      `INSERT INTO RoutineTable (id,station_id,title,definition_version,is_active) VALUES ('12345678-1234-4234-8234-123456789abc','32345678-1234-4234-8234-123456789abc','Queue test',7,1)`
    );
    const id = "22345678-1234-4234-8234-123456789abc";
    const routineId = "12345678-1234-4234-8234-123456789abc";
    await RoutineTaskLocalSimulator.simulateCreateRoutineTaskByRoutineId({
      body: {
        id,
        routineId,
        title: "Canonical Action",
        payload: { schemaVersion: 1, purpose: "GetRoutine", routineId },
        expectedDefinitionVersion: 7,
      },
    });
    await RoutineTaskLocalSimulator.simulateUpdateMyRoutineTaskById({
      body: {
        routineTaskId: id,
        values: {
          payload: { schemaVersion: 1, purpose: "DeleteRoutine", routineId },
        },
        expectedDefinitionVersion: 7,
      },
    });
    const canonical = await localDB.all(
      "SELECT json_extract(payload,'$.purpose') FROM RoutineTaskTable"
    );
    const columns: unknown[][] = await localDB.all(
      "PRAGMA table_info(RoutineTaskTable)"
    );
    let rejected = false;
    try {
      await RoutineTaskLocalSimulator.simulateUpdateMyRoutineTaskById({
        body: {
          routineTaskId: id,
          values: {
            payload: { schemaVersion: 2, purpose: "GetRoutine", routineId },
          },
        },
      });
    } catch {
      rejected = true;
    }
    const pending = await RoutineTaskLocalSimulator.getPendingMutations();
    await localDB.run(
      `INSERT INTO RoutineTaskDependencyGraphDraftTable (routine_id,nodes,edges) VALUES ('${routineId}','[]','[{"id":"edge","source":"a","target":"b","syncStatus":"pending","expectedDefinitionVersion":7}]')`
    );
    await RoutineTaskLocalSynchronizer.acknowledgeMutation(
      pending[0],
      routineId,
      7,
      8
    );
    const durable = await localDB.all(
      "SELECT json_extract(body,'$.expectedDefinitionVersion') FROM TransactionTable"
    );
    const draft = await localDB.all(
      "SELECT json_extract(edges,'$[0].expectedDefinitionVersion') FROM RoutineTaskDependencyGraphDraftTable"
    );
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      get: () => false,
    });
    const { mountRoutineEditor } = await load(
      "/test/e2e/routineGraphTestSupport.tsx"
    );
    await mountRoutineEditor();
    return { canonical, columns, rejected, durable, draft };
  });
  expect(result.canonical).toEqual([["DeleteRoutine"]]);
  expect(result.columns.map(column => column[1])).not.toContain("purpose");
  expect(result.rejected).toBe(true);
  expect(result.durable).toEqual([[8]]);
  expect(result.draft).toEqual([[8]]);
  await page
    .getByRole("button", { name: "Pause fixture", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Active queued", exact: true })
  ).toBeVisible();
  const paused = await page.evaluate(async () => {
    const path = "/src/api/local/db.ts";
    const { localDB } = await import(/* @vite-ignore */ path);
    return {
      active: await localDB.all("SELECT is_active FROM RoutineTable"),
      pending: await localDB.all(
        "SELECT count(*) FROM TransactionTable WHERE entity_type='Routine'"
      ),
    };
  });
  expect(paused.active).toEqual([[0]]);
  expect(paused.pending).toEqual([[1]]);
});

test("Realign confirms the entire overlapping graph and preserves its queued layout after reload", async ({
  page,
}) => {
  await page.route("**/_serverFn/**", route => route.abort("failed"));
  const editor = await mountLayoutEditor(page);
  await page.evaluate(() =>
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      get: () => false,
    })
  );
  const realign = editor.getByRole("button", { name: "Realign", exact: true });
  await expect(realign).toBeDisabled();
  const start = editor.locator(
    '.react-flow__node[data-id="22345678-1234-4234-8234-123456789abc"]'
  );
  const action = editor.locator(
    '.react-flow__node[data-id="42345678-1234-4234-8234-123456789abc"]'
  );
  const source = (await start
    .locator(".react-flow__handle.source")
    .boundingBox())!;
  const target = (await action
    .locator(".react-flow__handle.target")
    .boundingBox())!;
  await page.mouse.move(
    source.x + source.width / 2,
    source.y + source.height / 2
  );
  await page.mouse.down();
  await page.mouse.move(
    target.x + target.width / 2,
    target.y + target.height / 2,
    { steps: 12 }
  );
  await page.mouse.up();
  await expect(editor.locator(".react-flow__edge")).toHaveCount(1);
  const startBounds = (await start.boundingBox())!;
  const actionBounds = (await action.boundingBox())!;
  await dragNode(
    page,
    start,
    actionBounds.x - startBounds.x + 30,
    actionBounds.y - startBounds.y
  );
  await expect(realign).toBeEnabled();
  const lock = editor.getByRole("button", { name: "Toggle Interactivity" });
  await lock.click();
  await expect(realign).toBeDisabled();
  await lock.click();
  await expect(realign).toBeEnabled();
  const before = await editor
    .locator(".react-flow__node")
    .evaluateAll(nodes =>
      nodes.map(node => (node as HTMLElement).style.transform)
    );
  await realign.click();
  const dialog = page.getByRole("dialog", {
    name: "Realign the graph ?",
    exact: true,
  });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText(
    "This operation will cause the entire graph with all the routine tasks and dependency links being realigned."
  );
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  expect(
    await editor
      .locator(".react-flow__node")
      .evaluateAll(nodes =>
        nodes.map(node => (node as HTMLElement).style.transform)
      )
  ).toEqual(before);
  await realign.click();
  await dialog
    .getByRole("button", { name: "Realign", exact: true })
    .evaluate(button => {
      (button as HTMLButtonElement).click();
      (button as HTMLButtonElement).click();
    });
  await expect(dialog).toHaveCount(0);
  await expect(realign).toBeDisabled();
  await expect(editor.locator(".react-flow__edge")).toHaveCount(1);
  const snapshot = await page.evaluate(async () => {
    const path = "/src/api/local/db.ts";
    const { localDB } = await import(/* @vite-ignore */ path);
    const rows = await localDB.all(
      "SELECT id,x,y FROM RoutineTaskTable ORDER BY id"
    );
    const draft = await localDB.all(
      "SELECT nodes,edges FROM RoutineTaskDependencyGraphDraftTable"
    );
    return { rows, draft };
  });
  expect(snapshot.rows).toHaveLength(2);
  expect(snapshot.rows[0][1]).toBeLessThan(snapshot.rows[1][1]);
  expect(JSON.parse(snapshot.draft[0][0]).nodes).toHaveLength(2);
  expect(JSON.parse(snapshot.draft[0][1])).toHaveLength(1);
  await page.reload();
  await page.evaluate(async () => {
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      get: () => false,
    });
    const path = "/test/e2e/routineGraphTestSupport.tsx";
    const { mountRoutineEditor } = await import(/* @vite-ignore */ path);
    await mountRoutineEditor();
  });
  await expect(editor.locator(".react-flow__node")).toHaveCount(2);
  await expect(editor.locator(".react-flow__edge")).toHaveCount(1);
  await expect(realign).toBeDisabled();
  expect(
    await page.evaluate(async () => {
      const path = "/src/api/local/db.ts";
      const { localDB } = await import(/* @vite-ignore */ path);
      return await localDB.all(
        "SELECT id,x,y FROM RoutineTaskTable ORDER BY id"
      );
    })
  ).toEqual(snapshot.rows);
});
