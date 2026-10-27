import { expect, test } from "@playwright/test";

test("@environment starts the local database without migration errors", async ({
  page,
}) => {
  // Two worker connections, a reload and persisted-row verification share this budget.
  test.setTimeout(60_000);
  await page.addInitScript(() => {
    const originalPostMessage = Worker.prototype.postMessage;
    const sendPostMessage = originalPostMessage as (
      message: unknown,
      transfer?: Transferable[] | StructuredSerializeOptions
    ) => void;
    Worker.prototype.postMessage = function (
      this: Worker,
      message: unknown,
      transfer?: Transferable[] | StructuredSerializeOptions
    ) {
      if (
        typeof message === "object" &&
        message !== null &&
        "type" in message &&
        message.type === "config"
      ) {
        setTimeout(() => sendPostMessage.call(this, message, transfer), 250);
        return;
      }
      return sendPostMessage.call(this, message, transfer);
    } as typeof Worker.prototype.postMessage;
  });

  const localDatabaseErrors: string[] = [];
  const pages = [page, await page.context().newPage()];

  for (const currentPage of pages) {
    currentPage.on("console", message => {
      if (
        message.type() === "error" &&
        /local database|local yjs|transaction synchronization|migration|opfs|driver not initialized|pragma user_version/i.test(
          message.text()
        )
      ) {
        localDatabaseErrors.push(message.text());
      }
    });

    currentPage.on("pageerror", error => {
      if (
        /local database|local yjs|transaction synchronization|migration|opfs|driver not initialized|pragma user_version/i.test(
          error.message
        )
      ) {
        localDatabaseErrors.push(error.message);
      }
    });
  }

  await Promise.all(
    pages.map(async currentPage => {
      await currentPage.goto("/");
      await currentPage.waitForLoadState("networkidle");
    })
  );

  for (const currentPage of pages) {
    await expect(
      currentPage.getByRole("button", { name: "Get Started" })
    ).toBeVisible();
  }

  if (process.env.E2E_PRODUCTION !== "true") {
    for (const currentPage of pages) {
      const state = await currentPage.evaluate(async () => {
        const path = "/src/api/local/db.ts";
        const { localDB } = await import(/* @vite-ignore */ path);
        await localDB.ensureReady();
        return {
          ready: localDB.isReady,
          version: await localDB.getVersion(),
          targetVersion: localDB.getDiagnostics().targetVersion,
        };
      });
      expect(state.ready).toBe(true);
      expect(state.version).toBeGreaterThan(0);
      expect(state.version).toBe(state.targetVersion);
    }

    await page.evaluate(async () => {
      const load = (path: string) => import(/* @vite-ignore */ path);
      const { localDB } = await load("/src/api/local/db.ts");
      const { User } = await load("/src/api/local/schemas/index.ts");
      await localDB.insert(User).values({
        publicId: "e2e-multitab-startup",
        name: "Startup marker",
        displayName: "Startup marker",
        email: "startup@example.invalid",
        isLoggedIn: false,
      });
    });
  }

  await page.reload();
  await page.waitForLoadState("networkidle");
  await expect(page.getByRole("button", { name: "Get Started" })).toBeVisible();
  if (process.env.E2E_PRODUCTION !== "true") {
    for (const currentPage of pages) {
      const marker = await currentPage.evaluate(async () => {
        const load = (path: string) => import(/* @vite-ignore */ path);
        const { localDB } = await load("/src/api/local/db.ts");
        const { User } = await load("/src/api/local/schemas/index.ts");
        const { eq } = await load("/test/e2e/localDatabaseTestSupport.ts");
        await localDB.ensureReady();
        return await localDB
          .select({ name: User.name })
          .from(User)
          .where(eq(User.publicId, "e2e-multitab-startup"));
      });
      expect(marker).toEqual([{ name: "Startup marker" }]);
    }
  }
  expect(localDatabaseErrors).toEqual([]);

  await pages[1].close();
});

test("waits for another tab's migration before opening OPFS", async ({
  page,
}) => {
  test.skip(
    process.env.E2E_PRODUCTION === "true",
    "Imports the development database module."
  );
  const lockPage = await page.context().newPage();
  await lockPage.route("**/startup-lock-fixture", route =>
    route.fulfill({ contentType: "text/html", body: "<!doctype html>" })
  );
  await lockPage.goto("/startup-lock-fixture");
  await lockPage.evaluate(() => {
    void navigator.locks.request(
      "notegic-local-database-migration",
      { mode: "exclusive" },
      () => new Promise<void>(() => {})
    );
  });
  await expect
    .poll(() =>
      lockPage.evaluate(async () =>
        (await navigator.locks.query()).held?.some(
          lock => lock.name === "notegic-local-database-migration"
        )
      )
    )
    .toBe(true);

  try {
    await page.goto("/");
    await expect
      .poll(async () =>
        page.evaluate(async () => {
          const path = "/src/api/local/db.ts";
          const { localDB } = await import(/* @vite-ignore */ path);
          return localDB
            .getDiagnostics()
            .workerEvents.some(
              (event: { stage: string }) =>
                event.stage === "sqlite-wasm-init-complete"
            );
        })
      )
      .toBe(true);
    await expect
      .poll(() =>
        page.evaluate(async () =>
          (await navigator.locks.query()).pending?.some(
            lock => lock.name === "notegic-local-database-migration"
          )
        )
      )
      .toBe(true);
    const opened = await page.evaluate(async () => {
      const path = "/src/api/local/db.ts";
      const { localDB } = await import(/* @vite-ignore */ path);
      return localDB
        .getDiagnostics()
        .workerEvents.some(
          (event: { stage: string }) =>
            event.stage === "opfs-driver-init-complete"
        );
    });
    expect(opened).toBe(false);
  } finally {
    await lockPage.close();
  }

  const state = await page.evaluate(async () => {
    const path = "/src/api/local/db.ts";
    const { localDB } = await import(/* @vite-ignore */ path);
    await localDB.ensureReady();
    return {
      ready: localDB.isReady,
      version: await localDB.getVersion(),
      targetVersion: localDB.getDiagnostics().targetVersion,
    };
  });
  expect(state.ready).toBe(true);
  expect(state.version).toBeGreaterThan(0);
  expect(state.version).toBe(state.targetVersion);
});

test("@environment survives a reload while the SQLocal worker is connecting", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const originalPostMessage = Worker.prototype.postMessage;
    const sendPostMessage = originalPostMessage as (
      message: unknown,
      transfer?: Transferable[] | StructuredSerializeOptions
    ) => void;
    Worker.prototype.postMessage = function (
      this: Worker,
      message: unknown,
      transfer?: Transferable[] | StructuredSerializeOptions
    ) {
      if (
        typeof message === "object" &&
        message !== null &&
        "type" in message &&
        message.type === "config"
      ) {
        setTimeout(() => sendPostMessage.call(this, message, transfer), 1_000);
        return;
      }
      return sendPostMessage.call(this, message, transfer);
    } as typeof Worker.prototype.postMessage;
  });

  const localDatabaseErrors: string[] = [];
  page.on("console", message => {
    if (
      message.type() === "error" &&
      /local database|local yjs|transaction synchronization|migration|opfs|driver not initialized|pragma user_version/i.test(
        message.text()
      )
    ) {
      localDatabaseErrors.push(message.text());
    }
  });
  page.on("pageerror", error => {
    if (
      /local database|local yjs|transaction synchronization|migration|opfs|driver not initialized|pragma user_version/i.test(
        error.message
      )
    ) {
      localDatabaseErrors.push(error.message);
    }
  });

  await page.goto("/");
  await page.reload();
  await page.waitForLoadState("networkidle");
  await expect(page.getByRole("button", { name: "Get Started" })).toBeVisible();
  expect(localDatabaseErrors).toEqual([]);
});

test("preserves local rows, pending transactions, and Yjs across a reload", async ({
  page,
}) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  await page.evaluate(async () => {
    const importModule = (path: string) => import(/* @vite-ignore */ path);
    const { localDB } = await importModule("/src/api/local/db.ts");
    const { eq, LocalYjsDocumentStore } = await importModule(
      "/test/e2e/localDatabaseTestSupport.ts"
    );
    const { Routine, Station, Transaction, User } = await importModule(
      "/src/api/local/schemas/index.ts"
    );

    const userPublicId = "e2e-local-db-user";
    const stationId = "e2e-local-db-station";
    const routineId = "e2e-local-db-routine";
    const blockPackId = "00000000-0000-4000-8000-000000000001";

    await localDB
      .delete(Transaction)
      .where(eq(Transaction.ownerPublicId, userPublicId));
    await localDB.delete(Routine).where(eq(Routine.id, routineId));
    await localDB.delete(Station).where(eq(Station.id, stationId));
    await localDB.delete(User).where(eq(User.publicId, userPublicId));

    await localDB.insert(User).values({
      publicId: userPublicId,
      name: "E2ELocalUser",
      displayName: "E2E Local User",
      email: "e2e-local-db@example.com",
      isLoggedIn: false,
    });
    await localDB.insert(Station).values({
      id: stationId,
      name: "E2E Station",
    });
    await localDB.insert(Routine).values({
      id: routineId,
      stationId,
      title: "E2E Routine",
    });
    await localDB.insert(Transaction).values({
      ownerPublicId: userPublicId,
      entityType: "Routine",
      actionType: "CREATE",
      body: { id: routineId },
      retryCount: 0,
    });
    await LocalYjsDocumentStore.save(
      userPublicId,
      blockPackId,
      new Uint8Array([1, 2, 3]),
      new Uint8Array([4, 5]),
      true
    );
  });

  await page.reload();
  await page.waitForLoadState("networkidle");

  const preserved = await page.evaluate(async () => {
    const importModule = (path: string) => import(/* @vite-ignore */ path);
    const { localDB } = await importModule("/src/api/local/db.ts");
    const { eq, LocalYjsDocumentStore } = await importModule(
      "/test/e2e/localDatabaseTestSupport.ts"
    );
    const { Routine, Station, Transaction, User } = await importModule(
      "/src/api/local/schemas/index.ts"
    );
    const userPublicId = "e2e-local-db-user";
    const user = await localDB.query.User.findFirst({
      where: eq(User.publicId, userPublicId),
    });
    const station = await localDB.query.Station.findFirst({
      where: eq(Station.id, "e2e-local-db-station"),
    });
    const routine = await localDB.query.Routine.findFirst({
      where: eq(Routine.id, "e2e-local-db-routine"),
    });
    const transaction = await localDB.query.Transaction.findFirst({
      where: eq(Transaction.ownerPublicId, userPublicId),
    });
    const yjs = await LocalYjsDocumentStore.load(
      userPublicId,
      "00000000-0000-4000-8000-000000000001"
    );
    return {
      hasUser: user !== undefined,
      hasStation: station !== undefined,
      hasRoutine: routine !== undefined,
      hasPendingTransaction: transaction?.retryCount === 0,
      hasPendingYjs: yjs?.needsFlush === true,
    };
  });

  expect(preserved).toEqual({
    hasUser: true,
    hasStation: true,
    hasRoutine: true,
    hasPendingTransaction: true,
    hasPendingYjs: true,
  });
});

test("upgrades a freshly created database after a local down migration", async ({
  page,
}) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  await page.evaluate(async () => {
    const importModule = (path: string) => import(/* @vite-ignore */ path);
    const { localDB } = await importModule("/src/api/local/db.ts");
    const { getOrderedMigrations } = await importModule(
      "/src/api/local/migrationCatalog.ts"
    );
    const { sql } = await importModule("/test/e2e/localDatabaseTestSupport.ts");
    const { Routine, Station } = await importModule(
      "/src/api/local/schemas/index.ts"
    );

    await localDB.insert(Station).values({
      id: "e2e-updown-station",
      name: "E2E Updown Station",
    });
    await localDB.insert(Routine).values({
      id: "e2e-updown-routine",
      stationId: "e2e-updown-station",
      title: "E2E Updown Routine",
      timeoutSeconds: 600,
    });

    const latest = getOrderedMigrations().at(-1);
    if (
      latest?.tag !== "0004_routine_activation_schedule" ||
      !latest.downStatements
    ) {
      throw new Error("Routine local down migration is unavailable");
    }
    await localDB.transaction(
      async (transaction: { run: (query: unknown) => Promise<unknown> }) => {
        for (const statement of latest.downStatements) {
          await transaction.run(sql.raw(statement));
        }
        await transaction.run(sql.raw("PRAGMA user_version = 4"));
      }
    );
  });

  await page.reload();
  await page.waitForLoadState("networkidle");
  const result = await page.evaluate(async () => {
    const importModule = (path: string) => import(/* @vite-ignore */ path);
    const { localDB } = await importModule("/src/api/local/db.ts");
    const { eq } = await importModule("/test/e2e/localDatabaseTestSupport.ts");
    const { Routine } = await importModule("/src/api/local/schemas/index.ts");
    await localDB.ensureReady();
    const routine = await localDB.query.Routine.findFirst({
      where: eq(Routine.id, "e2e-updown-routine"),
    });
    return {
      version: await localDB.getVersion(),
      timeoutSeconds: routine?.timeoutSeconds,
    };
  });
  expect(result).toEqual({ version: 5, timeoutSeconds: 600 });
});
