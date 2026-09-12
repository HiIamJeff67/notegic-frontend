# Frontend Local Database Recovery

This runbook describes the user-visible recovery contract for the SQLocal,
SQLite WASM, OPFS, IndexedDB, transaction, and Yjs boundaries.

## Normal startup

1. The SQLocal worker connects before any `PRAGMA user_version` query.
2. The browser acquires the migration lock.
3. `PRAGMA user_version` is the schema source of truth.
4. Version `0` uses the current `bootstrap.sql` only when the database has no
   application tables.
5. An existing version advances through immutable migration files in order.
6. Statements and the version flag are committed in the same transaction.
7. The database is `ready` only after the committed version equals the target.

Migration failure never deletes the OPFS database. The previous committed
version remains the retry point.

## Diagnostic state

The persisted local diagnostic record contains the current and previous phase,
result classification, current and target versions, pending and terminal
transaction counts, active operation count, an error code/message, and recent
worker events. Authentication credentials and cookies are not included.

The result is one of:

- `retryable`: transient worker, network, timeout, 5xx, or WebSocket failure;
  retry is finite and local data is preserved.
- `needs-action`: rejected request, expired session, permission/conflict, or
  terminal transaction failure; the user must review or re-authenticate.
- `safe-to-rebuild`: all local preflight checks passed and an explicit caller
  validated the complete remote rebuild source.
- `manual-recovery`: OPFS, driver, schema, storage, or Yjs state cannot be
  classified safely.

Every terminal state renders a recovery surface instead of leaving the app in
an indefinite loading state. It provides Retry, Reconnect, diagnostics export,
and a confirmed local-data export. Read-only mode is available only when the
database is verified ready, and its SQLite and Yjs/IndexedDB write boundaries
are guarded. Rebuild is not available until an explicit preflight proves it is
safe.

## Destructive rebuild contract

The rebuild API is separate from the migration runner and requires both an
explicit local-data export and remote-source validation. Its preflight checks:

- retryable and terminal transaction counts separately;
- active local operation count;
- unsynced Yjs updates;
- the currently logged-in local user;
- the caller's remote full-data validation.

If any check is unknown or non-empty, rebuild is refused. The operation also
requires an exclusive browser lock, freezes local writes, notifies other tabs,
and records `rebuild-in-progress` before destructive work. When all checks
pass, the caller closes SQLocal, removes only the rebuildable OPFS/IndexedDB
data, keeps diagnostics, and reloads into the current bootstrap path. The next
startup must reach schema verification and resynchronization before `ready`.

## Verification

Run the following from the repository root:

```bash
npm test -- --runInBand apps/web/src/api/local/recovery.test.ts apps/web/src/api/local/migrator.test.ts apps/web/src/api/local/cleanup.test.ts
npm run typecheck
npx playwright install chromium
npm run test:e2e -- apps/web/test/e2e/local-database-startup.spec.ts
```

The Playwright startup test delays worker configuration and exercises two tabs
plus a reload. It must not report `Driver not initialized`, a duplicate
migration, an unhandled rejection, or a permanent migration lock. No backend
Docker services are required for this verification.

## Manual recovery

1. Select **Export diagnostics** and retain the JSON for investigation.
2. Select **Export local data** and acknowledge that the JSON contains the
   SQLite database plus IndexedDB/Yjs data, including notes and personal
   workspace content.
3. Select **Retry** for a transient failure or **Reconnect** after a worker or
   browser lifecycle failure.
4. Use read-only mode only when the UI confirms the local database is ready.
5. Rebuild only after the remote source is known complete and all pending,
   terminal, unknown, and Yjs states have been resolved.

Clearing browser site data remains a last-resort manual action because it can
destroy unsynchronized user content.
