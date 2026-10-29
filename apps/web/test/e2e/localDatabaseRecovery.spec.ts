import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";

test("manual recovery keeps failed data until an exported, confirmed rebuild", async ({
  page,
}) => {
  test.skip(
    process.env.E2E_PRODUCTION === "true",
    "Uses isolated development SQLocal fixtures"
  );
  test.setTimeout(90_000);
  const hydrationErrors: string[] = [];
  page.on("console", message => {
    if (
      message.type() === "error" &&
      /hydration|server rendered HTML/i.test(message.text())
    )
      hydrationErrors.push(message.text());
  });
  page.on("pageerror", error => {
    if (/hydration|server rendered HTML/i.test(error.message))
      hydrationErrors.push(error.message);
  });
  await page.goto("/");
  await page.evaluate(async () => {
    const load = (path: string) => import(/* @vite-ignore */ path);
    const { localDB } = await load("/src/api/local/db.ts");
    const { sql, LocalYjsDocumentStore } = await load(
      "/test/e2e/localDatabaseTestSupport.ts"
    );
    const { User, Station, Routine, Transaction } = await load(
      "/src/api/local/schemas/index.ts"
    );
    await localDB.ensureReady();
    await localDB.insert(User).values({
      publicId: "recovery-user",
      name: "Recovery123",
      displayName: "Recovery123",
      email: "recovery@example.invalid",
      isLoggedIn: false,
    });
    await localDB
      .insert(Station)
      .values({ id: "recovery-station", name: "Retained station" });
    await localDB.insert(Routine).values({
      id: "12345678-1234-4234-8234-123456789abc",
      stationId: "recovery-station",
      title: "Retained routine",
    });
    await localDB.insert(Transaction).values({
      ownerPublicId: "recovery-user",
      entityType: "Routine",
      actionType: "UPDATE",
      body: {
        routineId: "12345678-1234-4234-8234-123456789abc",
        values: { title: "Unsynced title" },
      },
    });
    await LocalYjsDocumentStore.save(
      "recovery-user",
      "00000000-0000-4000-8000-000000000001",
      new Uint8Array([1, 2, 3]),
      new Uint8Array([4]),
      true
    );
    await localDB.transaction(
      async (tx: { run: (query: unknown) => Promise<unknown> }) => {
        await tx.run(
          sql.raw("CREATE TABLE UnknownLegacyTable (content TEXT);")
        );
        await tx.run(
          sql.raw(
            "INSERT INTO UnknownLegacyTable VALUES ('retained legacy data');"
          )
        );
        await tx.run(
          sql.raw(
            "ALTER TABLE RoutineTable ADD COLUMN status TEXT NOT NULL DEFAULT 'Scheduled';"
          )
        );
        await tx.run(sql.raw("PRAGMA user_version=2"));
      }
    );
    try {
      await localDB.ensureReady();
    } catch {
      /* Expected incompatible historical schema. */
    }
  });

  const cover = page.getByRole("region", {
    name: "Local data recovery required",
    includeHidden: true,
  });
  // The existing recovery surface is a labelled section, not a separate dialog.
  await expect(cover).toBeVisible();
  const checkButton = cover.getByRole("button", {
    name: "Check Eligibility",
    exact: true,
  });
  const exportButton = cover.getByRole("button", {
    name: "Export",
    exact: true,
    includeHidden: true,
  });
  const retryButton = cover.getByRole("button", { name: "Retry", exact: true });
  const rebuildButton = cover.getByRole("button", {
    name: "Rebuild",
    exact: true,
  });
  const bounds = await Promise.all(
    [checkButton, exportButton, retryButton, rebuildButton].map(button =>
      button.boundingBox()
    )
  );
  for (const bound of bounds) expect(bound).not.toBeNull();
  expect(bounds[0]!.x).toBeLessThan(bounds[1]!.x);
  expect(bounds[1]!.x).toBeLessThan(bounds[2]!.x);
  expect(bounds[2]!.x + bounds[2]!.width).toBeLessThan(bounds[3]!.x);
  const clusters = await checkButton.evaluate(button => {
    const bounds = button.parentElement!.parentElement!.getBoundingClientRect();
    return { left: bounds.left, right: bounds.right };
  });
  expect(bounds[0]!.x).toBeCloseTo(clusters.left, 0);
  expect(bounds[3]!.x + bounds[3]!.width).toBeCloseTo(clusters.right, 0);
  const arrow = exportButton.locator("svg").last();
  await exportButton.click();
  await expect(exportButton).toHaveAttribute("aria-expanded", "true");
  await expect
    .poll(() =>
      arrow.evaluate(icon => parseFloat(getComputedStyle(icon).rotate) || 0)
    )
    .toBeGreaterThan(179);
  await page.keyboard.press("Escape");
  await expect(exportButton).toHaveAttribute("aria-expanded", "false");
  await expect
    .poll(() =>
      arrow.evaluate(icon => parseFloat(getComputedStyle(icon).rotate) || 0)
    )
    .toBeLessThan(1);
  await expect(cover.getByText(/no such column: phase/)).toBeVisible();
  await expect(
    cover.getByRole("button", { name: "Reconnect", exact: true })
  ).toHaveCount(0);
  await expect(
    cover.getByRole("button", { name: "Check Eligibility", exact: true })
  ).toBeVisible();
  await cover
    .getByRole("button", { name: "Check Eligibility", exact: true })
    .click();
  await expect(cover.getByRole("status")).toContainText(
    "remote rebuild source has not been validated"
  );
  await expect(cover.getByText(/no such column: phase/)).toBeVisible();

  await cover.getByRole("button", { name: "Report", exact: true }).click();
  const report = page.getByRole("dialog", { name: "Report", exact: true });
  await expect(
    report.getByRole("button", { name: "Open email" })
  ).toBeDisabled();
  await report
    .getByRole("button", { name: "Close", exact: true })
    .first()
    .click();

  await cover.getByRole("button", { name: "Rebuild", exact: true }).click();
  const rebuild = page.getByRole("dialog", { name: "Rebuild", exact: true });
  await expect(rebuild.getByRole("checkbox")).toBeDisabled();
  await expect(
    rebuild.getByRole("button", { name: "Rebuild", exact: true })
  ).toBeDisabled();
  await rebuild.getByRole("button", { name: "Cancel", exact: true }).click();

  const unchanged = await page.evaluate(async () => {
    const path = "/src/api/local/db.ts";
    const { localDB } = await import(/* @vite-ignore */ path);
    const before = localDB.getDiagnostics();
    try {
      await localDB.rebuild({
        diagnosticsExported: false,
        localDataExported: false,
        discardLocalData: false,
      });
    } catch {
      /* Must refuse without exports and consent. */
    }
    return {
      version: await localDB.getVersion(),
      marker: await localDB.get("SELECT content FROM UnknownLegacyTable"),
      pending: await localDB.get("SELECT count(*) FROM TransactionTable"),
      error: localDB.getDiagnostics().errorMessage,
      originalError: before.errorMessage,
    };
  });
  expect(unchanged).toMatchObject({
    version: 2,
    marker: ["retained legacy data"],
    pending: [1],
  });
  expect(unchanged.error).toBe(unchanged.originalError);

  await page.setViewportSize({ width: 390, height: 844 });
  for (const button of [
    checkButton,
    exportButton,
    retryButton,
    rebuildButton,
  ]) {
    const bound = await button.boundingBox();
    expect(bound!.x).toBeGreaterThanOrEqual(0);
    expect(bound!.x + bound!.width).toBeLessThanOrEqual(390);
  }
  await cover.getByRole("button", { name: "Export", exact: true }).click();
  const diagnosticsDownload = page.waitForEvent("download");
  await page
    .getByRole("menuitem", { name: "Export diagnostics", exact: true })
    .click();
  const diagnosticsFile = await diagnosticsDownload;
  const diagnostics = JSON.parse(
    await readFile((await diagnosticsFile.path())!, "utf8")
  );
  expect(diagnostics.errorMessage).toContain("no such column: phase");

  await cover.getByRole("button", { name: "Export", exact: true }).click();
  page.once("dialog", dialog => dialog.accept());
  const localDownload = page.waitForEvent("download");
  await page
    .getByRole("menuitem", { name: "Export local data", exact: true })
    .click();
  const localFile = await localDownload;
  const backup = JSON.parse(await readFile((await localFile.path())!, "utf8"));
  expect(backup.database.base64.length).toBeGreaterThan(0);
  expect(
    backup.indexedDB["recovery-user_blockPackYjsDocuments"].contents[0].update
  ).toEqual({ type: "Uint8Array", base64: "AQID" });

  await cover.getByRole("button", { name: "Rebuild", exact: true }).click();
  await rebuild.getByRole("checkbox").check();
  await rebuild.getByRole("button", { name: "Cancel", exact: true }).click();
  await cover.getByRole("button", { name: "Rebuild", exact: true }).click();
  await expect(rebuild.getByRole("checkbox")).not.toBeChecked();
  await rebuild.getByRole("checkbox").check();
  // This browser context contains disposable fixtures only; never use the user's Chrome profile.
  await Promise.all([
    page.waitForNavigation({ waitUntil: "domcontentloaded" }),
    rebuild.getByRole("button", { name: "Rebuild", exact: true }).click(),
  ]);
  await expect(cover).toHaveCount(0, { timeout: 30_000 });
  const fresh = await page.evaluate(async () => {
    const load = (path: string) => import(/* @vite-ignore */ path);
    const { localDB } = await load("/src/api/local/db.ts");
    const { LocalYjsDocumentStore } = await load(
      "/test/e2e/localDatabaseTestSupport.ts"
    );
    await localDB.ensureReady();
    return {
      ready: localDB.isReady,
      version: await localDB.getVersion(),
      target: localDB.getLatestMigrationVersion(),
      legacy: await localDB.all(
        "SELECT name FROM sqlite_master WHERE name='UnknownLegacyTable'"
      ),
      users: await localDB.get("SELECT count(*) FROM UserTable"),
      pending: await localDB.get("SELECT count(*) FROM TransactionTable"),
      yjs: await LocalYjsDocumentStore.load(
        "recovery-user",
        "00000000-0000-4000-8000-000000000001"
      ),
    };
  });
  expect(fresh).toEqual({
    ready: true,
    version: 5,
    target: 5,
    legacy: [],
    users: [0],
    pending: [0],
    yjs: null,
  });
  await page.getByRole("button", { name: "Report", exact: true }).click();
  await report.getByRole("checkbox").check();
  await expect(
    report.getByRole("link", { name: "Open email" })
  ).toHaveAttribute("href", /^mailto:.*subject=.*&body=/);
  await expect(report).toContainText("never attached or sent automatically");
  await report
    .getByRole("button", { name: "Close", exact: true })
    .first()
    .click();
  await page
    .getByRole("status")
    .filter({ hasText: "After trying Rebuild" })
    .getByRole("button", { name: "Close", exact: true })
    .click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Report", exact: true })
  ).toHaveCount(0);
  expect(hydrationErrors).toEqual([]);
});

test("Retry reconnects a failed worker without deleting local data", async ({
  page,
}) => {
  test.skip(
    process.env.E2E_PRODUCTION === "true",
    "Uses isolated development SQLocal fixtures"
  );
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.evaluate(async () => {
    const path = "/src/api/local/db.ts";
    const { localDB } = await import(/* @vite-ignore */ path);
    await localDB.ensureReady();
    await localDB.run("CREATE TABLE RetriedWorkerMarker (content TEXT)");
    await localDB.run("INSERT INTO RetriedWorkerMarker VALUES ('retained')");
    localDB.transitionDiagnostics("failed", {
      result: "manual-recovery",
      recoverability: "manual-recovery",
      errorCode: "LOCAL_DB_RUNTIME_FAILURE",
      errorMessage: "Worker fixture requires reconnect",
    });
  });
  await expect(
    page.getByText("Worker fixture requires reconnect")
  ).toBeVisible();
  await Promise.all([
    page.waitForNavigation({ waitUntil: "domcontentloaded" }),
    page.getByRole("button", { name: "Retry", exact: true }).click(),
  ]);
  const retained = await page.evaluate(async () => {
    const path = "/src/api/local/db.ts";
    const { localDB } = await import(/* @vite-ignore */ path);
    await localDB.ensureReady();
    return {
      ready: localDB.isReady,
      marker: await localDB.get("SELECT content FROM RetriedWorkerMarker"),
    };
  });
  expect(retained).toEqual({ ready: true, marker: ["retained"] });
});

for (const motion of ["normal", "system", "preference"] as const) {
  test(`recovery notice countdown closes after 30 seconds and pauses during interaction (${motion})`, async ({
    page,
  }) => {
    test.skip(
      process.env.E2E_PRODUCTION === "true",
      "Uses an isolated diagnostic fixture"
    );
    await page.emulateMedia({
      reducedMotion: motion === "system" ? "reduce" : "no-preference",
    });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.mouse.move(0, 0);
    await page.evaluate(async mode => {
      const path = "/src/api/local/db.ts";
      const { localDB } = await import(/* @vite-ignore */ path);
      await localDB.ensureReady();
      if (mode === "preference")
        document.documentElement.dataset.reduceMotion = "true";
      localDB.transitionDiagnostics("ready", {
        rebuildAttemptedAt: Date.now(),
      });
    }, motion);
    const notice = page
      .locator('section[role="status"]')
      .filter({ hasText: "After trying Rebuild" });
    await expect(notice).toBeVisible();
    const line = notice.locator('[data-slot="progress"]');
    await expect
      .poll(() =>
        line.evaluate(element => element.getAnimations()[0]?.playState)
      )
      .toBe("running");
    expect(
      await line.evaluate(
        element => element.getAnimations()[0].effect!.getTiming().duration
      )
    ).toBe(30_000);
    const clipping = await notice.evaluate(element => {
      const style = getComputedStyle(element);
      return {
        overflow: style.overflow,
        radius: parseFloat(style.borderBottomLeftRadius),
        visibility: getComputedStyle(
          element.querySelector('[data-slot="progress"]')!
        ).visibility,
      };
    });
    expect(clipping.overflow).toBe("hidden");
    expect(clipping.radius).toBeGreaterThan(0);
    expect(clipping.visibility).toBe(
      motion === "normal" ? "visible" : "hidden"
    );
    await line.evaluate(element => {
      element.getAnimations()[0].currentTime = 15_000;
    });
    const widths = await line.evaluate(element => ({
      line: element.getBoundingClientRect().width,
      container: element.parentElement!.clientWidth,
    }));
    expect(widths.line / widths.container).toBeGreaterThan(0.45);
    expect(widths.line / widths.container).toBeLessThan(0.55);
    // Diagnostic updates must not restart the animation.
    await page.evaluate(async () => {
      const path = "/src/api/local/db.ts";
      const { localDB } = await import(/* @vite-ignore */ path);
      await localDB.getVersion();
    });
    expect(
      await line.evaluate(element =>
        Number(element.getAnimations()[0].currentTime)
      )
    ).toBeGreaterThanOrEqual(15_000);
    await notice.hover();
    await expect
      .poll(() =>
        line.evaluate(element => element.getAnimations()[0].playState)
      )
      .toBe("paused");
    await notice.getByRole("button", { name: "Report", exact: true }).focus();
    await page.mouse.move(0, 0);
    await expect
      .poll(() =>
        line.evaluate(element => element.getAnimations()[0].playState)
      )
      .toBe("paused");
    await notice.getByRole("button", { name: "Report", exact: true }).click();
    const report = page.getByRole("dialog", { name: "Report", exact: true });
    await expect(report).toBeVisible();
    await page.mouse.move(0, 0);
    await expect
      .poll(() =>
        line.evaluate(element => element.getAnimations()[0].playState)
      )
      .toBe("paused");
    await report
      .getByRole("button", { name: "Close", exact: true })
      .first()
      .click();
    await page
      .getByRole("button", { name: "Get Started", exact: true })
      .focus();
    await page.mouse.move(0, 0);
    await expect
      .poll(() =>
        line.evaluate(element => element.getAnimations()[0].playState)
      )
      .toBe("running");
    // Seek the native animation near its deadline; let its real finish event dismiss the notice.
    await line.evaluate(element => {
      element.getAnimations()[0].currentTime = 29_990;
    });
    await expect(notice).toHaveCount(0);
    await page.reload();
    await page.waitForLoadState("networkidle");
    await expect(notice).toHaveCount(0);
  });
}
