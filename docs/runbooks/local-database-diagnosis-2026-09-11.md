# Local Database Diagnosis — 2026-09-11

## Conclusion and Scope

The migration currently fails on the Zen Browser production site. The root cause is confirmed to be that frontend `getVersion()` misinterprets the raw query result format from the Drizzle SQLite proxy. The actual SQLite version is 1, but the frontend reports 0. This error blocks local synchronization after login/registration and causes the next initialization to enter the delete-and-rebuild branch again.

Inspected local HEAD: `87ca7bee863877d5a614d3ff546b54afc8b5f7d8`.
Production bundle loaded by Zen: `https://www.notegic.com/assets/db-Ct2zxo1D.js`.
Relevant installed packages: SQLocal 0.17.0 and Drizzle ORM 0.45.2.

This investigation only read diagnostics from the existing page, the database version, and the table count, and ran existing unit tests. It did not call production `ensureReady()`, delete user data, log in or register again, modify application code, or deploy anything. This report does not claim that every historical error or browser scenario has been eliminated.

## Direct Evidence from Production

On the existing page, the loaded module's localDB instance with a `getVersion` method was retrieved and the following was run:

```js
{
  raw: await db.get("PRAGMA user_version"),
  parsed: await db.getVersion(),
  tables: await db.get("SELECT count(*) FROM sqlite_master WHERE type = 'table'")
}
```

Actual Zen console output:

```json
{"raw":[1],"parsed":0,"tables":[19]}
```

This result came from the same page and the same localDB connection; it was not a mock. The 19 tables prove that table creation produced results, but do not mean that every table's contents, indexes, or data integrity were individually verified.

Existing diagnostic records also show:

1. SQLite WASM initialization completed with `opfsVfs: true`.
2. OPFS driver initialization completed with `storageType: "opfs"`.
3. Table and index creation completed.
4. `PRAGMA user_version = 1` succeeded.
5. In-transaction `PRAGMA user_version` (`method: "all"`) succeeded with `rowCount: 1`.
6. `COMMIT` succeeded.
7. Out-of-transaction `PRAGMA user_version` (`method: "get"`) succeeded with `rowCount: 1`.
8. The frontend changed to `failed`: `local database migration stopped at version 0; expected 1.`.

The final version-setting/in-transaction query was recorded at `1789062927121`, COMMIT completed at `1789062927132`, and the out-of-transaction query and failure state completed at `1789062927135`. This failure occurred after a successful COMMIT, not because of a transaction rollback or Worker timeout.

## Root Cause: Two Query APIs Return Different Formats

Location: `apps/web/src/api/local/db.ts:384`.

```ts
const getVersion = async (): Promise<number> => {
  const result = await wrappedGet<{ user_version?: number }>(
    `PRAGMA user_version`
  );
  return Math.max(0, Math.trunc(Number(result?.user_version ?? 0)));
};
```

`wrappedGet` calls Drizzle's `get`. The SQLocal driver uses SQLite's `rowMode: 'array'`, and `method: 'get'` returns the first row as an array. When Drizzle receives raw SQL without field-mapping information, it returns that row directly. The actual value is therefore `[1]`.

`<{ user_version?: number }>` only tells TypeScript to assume that type; it does not convert the array into an object. `[1].user_version` is `undefined`, so `?? 0` disguises a successful query as version 0.

In contrast, the migration transaction uses SQLocal `transaction.query()`, which converts each row to an object using the columns and returns `[{ user_version: 1 }]`. This is why the in-transaction version check in `migrator.ts` passes while the out-of-transaction `getVersion()` fails. Do not change the in-transaction object access to array access just because the outer read is wrong.

The installed package source was checked:

- `node_modules/sqlocal/src/drivers/sqlite-memory-driver.ts`: `execOnDb()`, `rowMode: 'array'`, and `case 'get'`. The OPFS driver inherits this implementation.
- `node_modules/drizzle-orm/sqlite-proxy/session.js`: `mapGetResult()` returns the row directly when there are no fields/customResultMapper.
- `node_modules/sqlocal/src/client.ts`: `query()` inside `beginTransaction()` calls `convertRowsToObjects()`.

Official contracts: [Drizzle Proxy](https://orm.drizzle.team/docs/connect-drizzle-proxy) and [SQLocal transaction](https://sqlocal.dev/api/transaction).

## Why Login, Registration, and the Home Page Appear Broken

Login and registration share this dependency chain:

```text
Login/registration API response
  → async onSuccess in auth.hook.ts
  → await AuthLocalSynchronizer.syncLogin / syncRegister
  → await localDB.ensureReady()
  → ensureMigrated → getVersion incorrectly reads 0
  → create tables, set version, COMMIT
  → verifyMigrationVersion → getVersion incorrectly reads 0 again
  → throw
  → mutateAsync rejects, the page catch displays an error, and normal navigation stops
```

Corresponding code locations:

- `apps/web/src/api/hooks/auth.hook.ts:20`, `:60`: local synchronization is still awaited after the API succeeds.
- `apps/web/src/api/local/synchronizers/auth.synchronizer.ts`: each login/registration synchronization method calls ensureReady first.
- `apps/web/src/pages/auth/LoginPage.tsx:40`, `RegisterPage.tsx:41`: navigation occurs after mutateAsync succeeds.

Therefore, the backend can succeed while the frontend still displays login/registration failure in this flow. This investigation did not resubmit account operations or verify every historical HTTP response, so it cannot claim that every backend response succeeded.

The home-page error has a separate entry point: `LocalPreferencesProvider.tsx:211` calls `cleanupLocalData()` after preferences load. To find the user namespace for Yjs cleanup, it calls ensureReady in `cleanup.ts`. The final console message is `Failed to resolve local Yjs cleanup namespace.`, but the underlying cause remains the misread SQLite version; this log does not prove that Yjs/IndexedDB itself is broken.

The main screen also awaits ensureReady first at `TransactionSynchronizerProvider.tsx:1005` and remains unsynchronized after it fails. Multiple errors across different screens can therefore share the same root cause.

## Recovery Strategy That Amplifies the Problem

`db.ts:423` treats `currentVersion === 0 && targetVersion > 0` as a rebuild condition and then calls `recoverOPFSError()` at `db.ts:432`.

The actual operation in `recover.ts:51` is `sqlocalDrizzle.deleteDatabaseFile()`. It does not merely reconnect or rerun the migration.

The current path is therefore:

```text
The database version is actually 1
  → misread as 0
  → database deleted and schema rebuilt
  → version 1 successfully COMMITted
  → misread as 0 again and marked failed
  → the next ensureReady repeats the process
```

This affects local SQL data and transactions that have not yet synchronized. This investigation did not inspect user data, so it cannot determine how much existing data was lost.

Even after fixing the parsing, a real `user_version = 0` only means that the version marker is unset; it does not prove that the database is empty or safe to delete. An ordinary file-open error must not be interpreted as permission to discard all local data.

## Why Existing Changes and Tests Did Not Resolve It

- `git blame` shows that the incorrect getVersion logic came from `9ab604af` (2026-05-11), rather than being introduced by the latest COMMIT verification.
- `2879b3c` strengthened startup, transactions, the migration lock, and bootstrap, but retained the incorrect read.
- Later commits adjusted the Worker, resource isolation, and diagnostics. They may have fixed real problems at other stages; this investigation shows that Worker/OPFS startup succeeds, so all historical changes cannot be dismissed as invalid.
- `87ca7be` added in-transaction/out-of-transaction version-consistency checks, but the post-transaction check still uses the broken getVersion, so a successful migration is still rejected.
- `migrator.test.ts` tests an isolated migrator whose transaction mock returns object rows. This matches SQLocal `transaction.query()` but does not cross the integration boundary from the external Drizzle get to getVersion.
- Running `migrator.test.ts`, `diagnostics.test.ts`, and `cleanup.test.ts` produced **3 suites and 10 passing tests**. This verifies only their covered scope and does not prove that real initialization succeeds.
- `local-database-startup.spec.ts` waits for the page/networkidle and checks buttons and collected errors, but does not explicitly wait for database phase=ready or read the actual version. networkidle does not mean that database initialization in the Worker is complete.
- The existing Playwright configuration covers only Chromium with a development server. CI does not enable authenticated suites requiring `E2E_RUN_AUTHENTICATED=true` and an API URL, and it does not cover Firefox/Zen or a production build.

## Recommended Fix and Acceptance

First, fix the getVersion result format and make unrecognized results fail explicitly instead of silently treating them as 0. The minimal direction is shown below (not yet applied):

```ts
const getVersion = async (): Promise<number> => {
  const result = await wrappedGet<[number]>(`PRAGMA user_version`);
  const version = result?.[0];
  if (!Number.isInteger(version) || version < 0) {
    throw new Error("Invalid local database user_version result.");
  }
  return version;
};
```

Second, remove the inference that version 0 means the file should be deleted automatically: bootstrap an empty database normally, and preserve a database with existing tables but an unknown version until its schema/migration source is inspected. Changing CREATE TABLE to IF NOT EXISTS is not enough to complete a migration because existing columns and indexes must also match.

Third, adjust the auth error boundary: distinguish remote authentication failure from local synchronization failure. If the app should continue online when the local database fails, verify that UserProvider and subsequent reads can use the remote path; do not merely swallow the synchronization exception. This is additional fault tolerance, not a substitute for fixing this bug.

Required acceptance checks:

1. A real SQLocal + Drizzle connection reads user_version=1, and getVersion returns 1; empty or invalid results must not be treated as rebuildable version 0.
2. After a complete ensureReady on a fresh test database, phase=ready and the version equals targetVersion.
3. After repeated ensureReady calls, reloads, and two open tabs, test marker data remains and the delete-and-rebuild path is not entered.
4. If a migration fails midway, schema changes and user_version roll back together.
5. In an isolated test-account environment, verify successful login/registration navigation and main-screen synchronization while explicitly waiting for the database to be ready.
6. Cover Chromium and Firefox-like browsers, including Worker/WASM resource paths in a production build.

There is also a transaction-isolation risk that needs separate verification: ordinary business transactions still use the native Drizzle transaction (`db.ts:301`), while migrations use a SQLocal transaction. The outer operation chain wraps raw methods and transactions, but query builder/select/insert calls use rawDriver directly and do not all enter the same chain. SQLocal also recommends using its transaction API. This requires concurrency tests and cannot be treated as the confirmed cause of this incident.

## Assessment of Local Database Viability

The current evidence is insufficient to reject the local database. This case directly proves that SQLite/WASM/OPFS can start, create tables, COMMIT, and read version 1 in Zen. The confirmed defects are in frontend adapter result parsing, the rebuild strategy, and integration-test coverage.

However, the fact that the database itself works does not mean that this integration already provides reliable offline-first behavior. Fix version reads and data protection first, then accept the result with reload, multi-tab, failure-rollback, and real login tests. Increasing timeouts, adding retries, or asking users to clear storage cannot fix this deterministic parsing error.
