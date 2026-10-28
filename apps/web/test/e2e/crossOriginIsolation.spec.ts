import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("https://www.youtube-nocookie.com/embed/**", route =>
    route.fulfill({
      contentType: "text/html",
      body: "<!doctype html><p>Public player</p>",
    })
  );
});

test("only public documentation permits non-isolated embeds", async ({
  request,
}) => {
  for (const path of ["/document", "/document/"]) {
    const response = await request.get(path);
    expect(response.status()).toBe(200);
    expect(response.headers()["cross-origin-embedder-policy"], path).toBe(
      "unsafe-none"
    );
    expect(response.headers()["cross-origin-opener-policy"], path).toBe(
      "same-origin"
    );
  }
  for (const path of ["/", "/login", "/app/dashboard", "/document-other"]) {
    const response = await request.get(path);
    expect(response.headers()["cross-origin-embedder-policy"], path).toBe(
      "require-corp"
    );
    expect(response.headers()["cross-origin-opener-policy"], path).toBe(
      "same-origin"
    );
  }
});

test("documentation loads all players without starting the local database", async ({
  page,
}) => {
  const localErrors: string[] = [];
  page.on("console", message => {
    if (
      message.type() === "error" &&
      /SQLocal|local database|migration|opfs/i.test(message.text())
    )
      localErrors.push(message.text());
  });
  await page.goto("/document#website");
  await page.waitForLoadState("networkidle");
  expect(await page.evaluate(() => window.crossOriginIsolated)).toBe(false);
  expect(
    page.workers().filter(worker => /sqlocal/i.test(worker.url()))
  ).toHaveLength(0);
  expect(
    await page.evaluate(() =>
      Object.keys(localStorage).filter(key =>
        key.startsWith("notegic-local-db-diagnostics:")
      )
    )
  ).toEqual([]);
  for (const video of await page.locator("[data-article-video]").all()) {
    await expect(video.locator("iframe")).not.toHaveAttribute("credentialless");
    await expect(
      video.frameLocator("iframe").getByText("Public player")
    ).toHaveText("Public player");
  }
  expect(localErrors).toEqual([]);
});

test("crossing the documentation boundary preserves committed rows, pending transactions, and Yjs", async ({
  page,
}) => {
  test.setTimeout(60_000);
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  expect(await page.evaluate(() => window.crossOriginIsolated)).toBe(true);

  if (process.env.E2E_PRODUCTION !== "true") {
    await page.evaluate(async () => {
      const load = (path: string) => import(/* @vite-ignore */ path);
      const { localDB } = await load("/src/api/local/db.ts");
      const { Transaction, User } = await load(
        "/src/api/local/schemas/index.ts"
      );
      const { LocalYjsDocumentStore } = await load(
        "/test/e2e/localDatabaseTestSupport.ts"
      );
      await localDB.ensureReady();
      await localDB.insert(User).values({
        publicId: "e2e-isolation-boundary",
        name: "Isolation marker",
        displayName: "Isolation marker",
        email: "isolation@example.invalid",
        isLoggedIn: false,
      });
      await localDB.insert(Transaction).values({
        ownerPublicId: "e2e-isolation-boundary",
        entityType: "RootShelf",
        actionType: "CREATE",
        body: { id: "e2e-isolation-shelf", name: "Pending shelf" },
        retryCount: 0,
      });
      await LocalYjsDocumentStore.save(
        "e2e-isolation-boundary",
        "00000000-0000-4000-8000-000000000073",
        new Uint8Array([1, 2, 3]),
        new Uint8Array([4, 5]),
        true
      );
    });
  }

  const homeOrigin = await page.evaluate(() => performance.timeOrigin);
  await page.getByRole("button", { name: "View Docs", exact: true }).click();
  await expect(page).toHaveURL(/\/document$/);
  await page.waitForLoadState("networkidle");
  expect(await page.evaluate(() => window.crossOriginIsolated)).toBe(false);
  const documentOrigin = await page.evaluate(() => performance.timeOrigin);
  expect(documentOrigin).not.toBe(homeOrigin);
  expect(
    page.workers().filter(worker => /sqlocal/i.test(worker.url()))
  ).toHaveLength(0);

  await page.locator('#website a[href$="#website-widgets"]').first().click();
  await expect(page).toHaveURL(/#website-widgets$/);
  expect(await page.evaluate(() => performance.timeOrigin)).toBe(
    documentOrigin
  );

  await page.getByRole("link", { name: "Home", exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
  await page.waitForLoadState("networkidle");
  expect(await page.evaluate(() => window.crossOriginIsolated)).toBe(true);
  expect(await page.evaluate(() => performance.timeOrigin)).not.toBe(
    documentOrigin
  );

  if (process.env.E2E_PRODUCTION !== "true") {
    const preserved = await page.evaluate(async () => {
      const load = (path: string) => import(/* @vite-ignore */ path);
      const { localDB } = await load("/src/api/local/db.ts");
      const { Transaction, User } = await load(
        "/src/api/local/schemas/index.ts"
      );
      const { eq, LocalYjsDocumentStore } = await load(
        "/test/e2e/localDatabaseTestSupport.ts"
      );
      await localDB.ensureReady();
      const rows = await localDB
        .select({ name: User.name })
        .from(User)
        .where(eq(User.publicId, "e2e-isolation-boundary"));
      const transaction = await localDB.query.Transaction.findFirst({
        where: eq(Transaction.ownerPublicId, "e2e-isolation-boundary"),
      });
      const yjs = await LocalYjsDocumentStore.load(
        "e2e-isolation-boundary",
        "00000000-0000-4000-8000-000000000073"
      );
      return {
        rows,
        pendingTransaction: transaction && {
          body: transaction.body,
          retryCount: transaction.retryCount,
        },
        pendingYjs: yjs && {
          update: Array.from(yjs.update),
          stateVector: Array.from(yjs.stateVector),
          needsFlush: yjs.needsFlush,
        },
      };
    });
    expect(preserved).toEqual({
      rows: [{ name: "Isolation marker" }],
      pendingTransaction: {
        body: { id: "e2e-isolation-shelf", name: "Pending shelf" },
        retryCount: 0,
      },
      pendingYjs: {
        update: [1, 2, 3],
        stateVector: [4, 5],
        needsFlush: true,
      },
    });
  }

  await page.goBack();
  await expect(page).toHaveURL(/\/document#website-widgets$/);
  await page.waitForLoadState("networkidle");
  expect(await page.evaluate(() => window.crossOriginIsolated)).toBe(false);
});
