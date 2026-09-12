import { expect, test } from "@playwright/test";

test("@environment starts the local database without migration errors", async ({
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

  await page.reload();
  await page.waitForLoadState("networkidle");
  await expect(page.getByRole("button", { name: "Get Started" })).toBeVisible();
  expect(localDatabaseErrors).toEqual([]);

  await pages[1].close();
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
      "/test/e2e/local-database-test-support.ts"
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
      "/test/e2e/local-database-test-support.ts"
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
