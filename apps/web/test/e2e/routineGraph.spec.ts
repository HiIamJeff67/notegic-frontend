import { expect, type Locator, type Page, test } from "@playwright/test";

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

const mountLayoutEditor = async (page: Page) => {
  await page.evaluate(async () => {
    const path = "/test/e2e/routineGraphTestSupport.tsx";
    const { mountRoutineLayoutEditor } = await import(/* @vite-ignore */ path);
    await mountRoutineLayoutEditor();
  });
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

test.beforeEach(async ({ page }, testInfo) => {
  test.skip(
    process.env.E2E_PRODUCTION === "true",
    "The source fixture is served by Vite in development."
  );
  if (testInfo.title.startsWith("layout debounce")) await page.clock.install();
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

test("layout debounce keeps final Start and Action positions without remounting the canvas", async ({
  page,
}) => {
  const writes: string[] = [];
  await page.route("**/_serverFn/**", async route => {
    if (route.request().method() !== "POST") return route.abort("failed");
    writes.push(route.request().postData() ?? "");
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        result: {
          success: true,
          exception: null,
          data: { updatedAt: new Date().toISOString(), definitionVersion: 7 },
          embedded: { publicId: "editor-user" },
        },
      }),
    });
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
  await page.clock.pauseAt(new Date(Date.now() + 1000));
  await dragNode(page, start, 60, 30);
  await dragNode(page, start, 45, 15);
  await dragNode(page, action, 20, 50);
  const positions = await editor
    .locator(".react-flow__node")
    .evaluateAll(nodes =>
      nodes.map(node => (node as HTMLElement).style.transform)
    );
  expect(writes).toHaveLength(0);
  await page.clock.runFor(749);
  expect(writes).toHaveLength(0);
  await page.clock.runFor(1);
  await page.clock.resume();
  await expect.poll(() => writes.length).toBe(2);
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

test("handle dragging creates a dependency and its left-click menu edits or deletes only the edge", async ({
  page,
}) => {
  let writes = 0;
  await page.route("**/_serverFn/**", async route => {
    if (route.request().method() !== "POST") return route.abort("failed");
    writes++;
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        result: {
          success: true,
          exception: null,
          data:
            writes === 1
              ? {
                  routineTaskId: "42345678-1234-4234-8234-123456789abc",
                  previousRoutineTaskId: "22345678-1234-4234-8234-123456789abc",
                  description: "",
                  progress: 0,
                  updatedAt: new Date().toISOString(),
                  createdAt: new Date().toISOString(),
                }
              : { deletedCount: 1 },
          embedded: { publicId: "editor-user" },
        },
      }),
    });
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
  await expect.poll(() => writes).toBe(1);
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

test("a newer drag survives a delayed acknowledgement and offline layout remains queued", async ({
  page,
}) => {
  let writes = 0;
  let releaseFirst: () => void = () => {};
  const firstAck = new Promise<void>(resolve => {
    releaseFirst = resolve;
  });
  await page.route("**/_serverFn/**", async route => {
    if (route.request().method() !== "POST") return route.abort("failed");
    writes++;
    if (writes === 1) await firstAck;
    if (writes > 2) return route.abort("failed");
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        result: {
          success: true,
          exception: null,
          data: { updatedAt: new Date().toISOString(), definitionVersion: 7 },
          embedded: { publicId: "editor-user" },
        },
      }),
    });
  });
  const editor = await mountLayoutEditor(page);
  const start = editor.locator(
    '.react-flow__node[data-id="22345678-1234-4234-8234-123456789abc"]'
  );
  await dragNode(page, start, 40, 20);
  await expect.poll(() => writes).toBe(1);
  await dragNode(page, start, 60, 30);
  const finalPosition = await start.evaluate(
    node => (node as HTMLElement).style.transform
  );
  releaseFirst();
  await expect.poll(() => writes).toBe(2);
  await expect
    .poll(() => start.evaluate(node => (node as HTMLElement).style.transform))
    .toBe(finalPosition);
  await dragNode(page, start, 25, 25);
  const offlinePosition = await start.evaluate(
    node => (node as HTMLElement).style.transform
  );
  await expect.poll(() => writes).toBe(3);
  await expect
    .poll(() =>
      page.evaluate(async () => {
        const path = "/src/api/local/db.ts";
        const { localDB } = await import(/* @vite-ignore */ path);
        return localDB.all(
          "SELECT count(*) FROM TransactionTable WHERE entity_type='RoutineTask'"
        );
      })
    )
    .toEqual([[1]]);
  await expect(
    editor.getByRole("button", { name: /Retry sync/ })
  ).toBeVisible();
  await expect
    .poll(() => start.evaluate(node => (node as HTMLElement).style.transform))
    .toBe(offlinePosition);
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
    await migrator.down(4);
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
    await migrator.down(4);
    await migrator.ensureMigrated({ currentVersion: 3 });
    return {
      before,
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
  expect(rows.version).toEqual([[4]]);
  expect(rows.nodes).toEqual(result.before);
});

test("real editor retries a node-only durable queue and refreshes pending status", async ({
  page,
}) => {
  let writes = 0;
  await page.route("**/_serverFn/**", async route => {
    if (route.request().method() !== "POST") return route.abort("failed");
    writes++;
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        result: {
          success: true,
          exception: null,
          data: {
            id: "22345678-1234-4234-8234-123456789abc",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            definitionVersion: 8,
          },
          embedded: { publicId: "editor-user" },
        },
      }),
    });
  });
  await page.evaluate(async () => {
    const load = (path: string) => import(/* @vite-ignore */ path);
    const { localDB } = await load("/src/api/local/db.ts");
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
    const { RoutineTaskLocalSimulator } = await load(
      "/src/api/local/simulators/routineTask.simulator.ts"
    );
    await RoutineTaskLocalSimulator.simulateCreateRoutineTaskByRoutineId({
      body: {
        id: "22345678-1234-4234-8234-123456789abc",
        routineId: "12345678-1234-4234-8234-123456789abc",
        kind: "Start",
        title: "Pending entry",
        payload: { schemaVersion: 1, isActive: true },
        expectedDefinitionVersion: 7,
      },
    });
    await localDB.run("UPDATE TransactionTable SET retry_count=5");
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      get: () => false,
    });
    const { mountRoutineEditor } = await load(
      "/test/e2e/routineGraphTestSupport.tsx"
    );
    await mountRoutineEditor();
  });
  const editor = page.locator("#routine-editor-test-root");
  await expect(
    editor.getByRole("button", { name: /Retry sync/ })
  ).toBeVisible();
  await expect(editor.locator(".react-flow__node")).toHaveCount(1);
  await page.evaluate(() => {
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      get: () => true,
    });
    window.dispatchEvent(new Event("online"));
  });
  await editor.getByRole("button", { name: /Retry sync/ }).click();
  await expect(editor.getByRole("button", { name: /Retry sync/ })).toHaveCount(
    0
  );
  await editor.getByRole("button", { name: "Queue test", exact: true }).click();
  await expect(
    page
      .getByRole("menu", { name: "Queue test" })
      .getByText("Saved", { exact: true })
  ).toBeVisible();
  expect(writes).toBe(1);
  const pending = await page.evaluate(async () => {
    const path = "/src/api/local/db.ts";
    const { localDB } = await import(/* @vite-ignore */ path);
    return localDB.all("SELECT count(*) FROM TransactionTable");
  });
  expect(pending).toEqual([[0]]);
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
  expect(JSON.parse(snapshot.draft[0][0])).toHaveLength(2);
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
