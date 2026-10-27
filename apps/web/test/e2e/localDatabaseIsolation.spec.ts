import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  test.skip(
    process.env.E2E_PRODUCTION === "true",
    "Uses isolated SQLocal fixtures"
  );
  await page.goto("/");
  await page.locator("html[data-density]").waitFor();
  await page.evaluate(async () => {
    const path = "/test/e2e/routineGraphTestSupport.tsx";
    const { mountRoutineLayoutEditor } = await import(/* @vite-ignore */ path);
    await mountRoutineLayoutEditor();
  });
  await expect(
    page.locator("#routine-editor-test-root .react-flow__node")
  ).toHaveCount(2);
});

test("a graph draft acknowledged during another transaction survives that transaction's rollback", async ({
  page,
}, info) => {
  const result = await page.evaluate(async () => {
    const load = (path: string) => import(/* @vite-ignore */ path);
    const { localDB } = (await load(
      "/src/api/local/db.ts"
    )) as typeof import("../../src/api/local/db");
    const { RoutineTaskDependencyGraphDraft } = (await load(
      "/src/api/local/schemas/index.ts"
    )) as typeof import("../../src/api/local/schemas");
    const routineId = "12345678-1234-4234-8234-123456789abc";
    await localDB.all(
      "SELECT count(*) FROM RoutineTaskDependencyGraphDraftTable"
    );
    let started = () => {};
    const begin = new Promise<void>(resolve => (started = resolve));
    let release = () => {};
    const gate = new Promise<void>(resolve => (release = resolve));
    const transaction = localDB
      .transaction(async tx => {
        await tx.run(
          "UPDATE RoutineTable SET title = 'rolled-back fixture' WHERE id = '12345678-1234-4234-8234-123456789abc'"
        );
        started();
        await gate;
        throw new Error("controlled unrelated rollback");
      })
      .then(
        () => false,
        () => true
      );
    await begin;
    let acknowledged = false;
    const draft = {
      routineId,
      nodes: JSON.stringify({ marker: "acknowledged-draft" }),
      edges: "[]",
      updatedAt: new Date(),
    };
    const write = localDB
      .insert(RoutineTaskDependencyGraphDraft)
      .values(draft)
      .onConflictDoUpdate({
        target: RoutineTaskDependencyGraphDraft.routineId,
        set: draft,
      })
      .then(() => {
        acknowledged = true;
      });
    await Promise.race([
      write,
      new Promise(resolve => setTimeout(resolve, 1000)),
    ]);
    const acknowledgedBeforeRollback = acknowledged;
    release();
    const rolledBack = await transaction;
    await write;
    const rows = await localDB.all(
      "SELECT nodes FROM RoutineTaskDependencyGraphDraftTable"
    );
    return {
      rolledBack,
      acknowledgedBeforeRollback,
      draftSurvivedRollback: rows.some(
        row =>
          Array.isArray(row) && String(row[0]).includes("acknowledged-draft")
      ),
    };
  });
  await info.attach("isolation-result", {
    body: Buffer.from(JSON.stringify(result)),
    contentType: "application/json",
  });
  expect(result.rolledBack).toBe(true);
  expect(result.acknowledgedBeforeRollback).toBe(false);
  expect(result.draftSurvivedRollback).toBe(true);
});

test("raw, builder, prepared, relational and batch reads cannot see another transaction's writes", async ({
  page,
}) => {
  const result = await page.evaluate(async () => {
    const load = (path: string) => import(/* @vite-ignore */ path);
    const { localDB } = (await load(
      "/src/api/local/db.ts"
    )) as typeof import("../../src/api/local/db");
    const { Routine } = (await load(
      "/src/api/local/schemas/index.ts"
    )) as typeof import("../../src/api/local/schemas");
    const original = await localDB
      .select({ title: Routine.title })
      .from(Routine);
    let started = () => {};
    const begin = new Promise<void>(resolve => (started = resolve));
    let release = () => {};
    const gate = new Promise<void>(resolve => (release = resolve));
    const transaction = localDB
      .transaction(async tx => {
        await tx.update(Routine).set({ title: "uncommitted-secret" });
        started();
        await gate;
        throw new Error("controlled rollback");
      })
      .catch(() => undefined);
    await begin;
    const completed: string[] = [];
    const query = "SELECT title FROM RoutineTable";
    const reads = [
      localDB.get(query),
      localDB.all(query),
      localDB.values(query),
      localDB.run(query),
      localDB.select({ title: Routine.title }).from(Routine),
      localDB.select({ title: Routine.title }).from(Routine).prepare().all(),
      localDB.query.Routine.findMany({ columns: { title: true } }),
      localDB.batch([localDB.select({ title: Routine.title }).from(Routine)]),
    ].map((read, index) =>
      Promise.resolve(read).then(value => {
        completed.push(String(index));
        return value;
      })
    );
    await new Promise(resolve => setTimeout(resolve, 100));
    const completedBeforeRollback = [...completed];
    release();
    await transaction;
    const results = await Promise.all(reads);
    return { original, completedBeforeRollback, results };
  });
  expect(result.original).not.toHaveLength(0);
  expect(result.completedBeforeRollback).toEqual([]);
  expect(
    JSON.stringify(result.results, (_key, value) =>
      typeof value === "bigint" ? String(value) : value
    )
  ).not.toContain("uncommitted-secret");
  expect(result.results[4]).toEqual(result.original);
  expect(result.results[5]).toEqual(result.original);
  expect(result.results[6]).toEqual(result.original);
  expect(result.results[7]).toEqual([result.original]);
});

test("independent transactions, nested rollback and expired handles preserve their boundaries", async ({
  page,
}) => {
  const result = await page.evaluate(async () => {
    const path = "/src/api/local/db.ts";
    const { localDB } = (await import(
      /* @vite-ignore */ path
    )) as typeof import("../../src/api/local/db");
    await localDB.run(
      "CREATE TABLE IsolationFixture (id integer PRIMARY KEY, value text)"
    );
    let expiredRead: (() => Promise<unknown>) | undefined;
    const results = await Promise.all([
      localDB.transaction(async tx => {
        expiredRead = () => tx.get("SELECT * FROM IsolationFixture");
        await tx.run("INSERT INTO IsolationFixture VALUES (1, 'outer')");
        await tx
          .transaction(async nested => {
            await nested.run(
              "INSERT INTO IsolationFixture VALUES (2, 'nested-rollback')"
            );
            nested.rollback();
          })
          .catch(() => undefined);
        await tx.transaction(async nested => {
          await nested.run(
            "INSERT INTO IsolationFixture VALUES (3, 'nested-commit')"
          );
        });
        return "committed";
      }),
      localDB
        .transaction(async tx => {
          await tx.run(
            "INSERT INTO IsolationFixture VALUES (4, 'independent-rollback')"
          );
          throw new Error("controlled rollback");
        })
        .catch(() => "rolled-back"),
      localDB.transaction(async tx => {
        await tx.run(
          "INSERT INTO IsolationFixture VALUES (5, 'independent-commit')"
        );
        return "committed";
      }),
    ]);
    const expiredRejected = await expiredRead?.().then(
      () => false,
      () => true
    );
    await localDB.run(
      "INSERT INTO IsolationFixture VALUES (6, 'queue-recovered')"
    );
    const rows = await localDB.all(
      "SELECT id FROM IsolationFixture ORDER BY id"
    );
    return { results, expiredRejected, rows };
  });
  expect(result).toEqual({
    results: ["committed", "rolled-back", "committed"],
    expiredRejected: true,
    rows: [[1], [3], [5], [6]],
  });
});
