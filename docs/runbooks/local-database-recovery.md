# Frontend Local Database Recovery

This runbook describes the user-visible recovery contract for the SQLocal,
SQLite WASM, OPFS, IndexedDB, transaction, and Yjs boundaries.

## Normal startup

1. The SQLocal worker opens OPFS under the shared migration lock, so opening
   another tab cannot race schema creation or migration.
2. The browser waits for the worker connection before acquiring that same lock
   for migration, preventing a circular wait.
3. `PRAGMA user_version` is the schema source of truth.
4. Version `0` uses the current `bootstrap.sql` only when the database has no
   application tables.
5. An existing version advances through immutable migration files in order.
6. Statements and the version flag are committed in the same transaction.
7. The database is `ready` only after the committed version equals the target.

Migration failure never deletes the OPFS database. The previous committed
version remains the retry point.

The public `/document` page embeds external players and does not start SQLocal
or run local-data cleanup. Entering or leaving it performs a document navigation
so application pages retain cross-origin isolation and SharedArrayBuffer access.
Existing OPFS data is retained across this boundary; see
[Website guide isolation](website-guide.md#cross-origin-isolation).

## Transaction isolation

The shared Drizzle driver serializes raw SQL, query builders, prepared and
relational queries, and batches on the same connection queue. A transaction
holds that queue through COMMIT or ROLLBACK and uses its own Drizzle session;
unrelated operations wait and cannot read or roll back with its pending writes.
Transactions are not automatically replayed after an error.

Inside `localDB.transaction(async tx => ...)`, use `tx` for every executed
query and pass it to any helper that performs database work. Do not await an
operation on the exported `localDB` from that callback: it waits behind the
transaction itself. Nested transactions use `tx.transaction(...)` savepoints.
Do not retain transaction handles or prepared queries after the transaction
finishes; their driver rejects further execution. This queue is per connection,
not a replacement for the existing cross-tab SQLite and migration locks.

No schema up/down or local data reset is required for this adapter change.

## Transaction replay and Material identities

Replay calls use the existing mutation hooks with `offlineFallback: false`
(or their existing `allowOffline = false` parameter). A remote outage must leave
the original transaction pending without simulating it again or adding another
queue entry. Each prepared job acknowledges its complete merged sequence set.

Material creation receives its ID from the server. After confirmation,
`MaterialLocalSynchronizer.acknowledgeCreate` moves the cached metadata, Item
row, Routine links and pending request references in one local transaction, and
removes the acknowledged CREATE from that queue. Prepared Material and linked-item
jobs read the remapped body when they run. A failed local write rolls back the
remap and retains the pending work; no database reset or schema migration is
required for this acknowledgement change.

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
- `safe-to-rebuild`: preflight validated the complete remote rebuild source, or
  the user explicitly confirmed the destructive discard operation below.
- `manual-recovery`: OPFS, driver, schema, storage, or Yjs state cannot be
  classified safely.

Every terminal state renders a recovery surface instead of leaving the app in
an indefinite loading state. Its four primary actions are **Check Eligibility**,
**Retry**, **Export**, and **Rebuild**. Export is the existing shadcn dropdown
with diagnostics and local-data downloads. Retry reruns non-destructive startup;
worker/runtime failures reload the document to obtain a fresh connection.
The former Reconnect action only reloaded the document/worker and was removed.

Eligibility checks are advisory. They retain the startup/migration error,
phase and classification; their own result appears separately in the UI.
A failed eligibility read must not replace the original technical details.
The cover subscribes through `useSyncExternalStore` with stable diagnostic
snapshots and an empty server snapshot, so persisted recovery/follow-up state
does not produce a hydration mismatch.
Unknown queues and unvalidated remote data must never be presented as proof
that discarding data is safe.

## Explicit destructive rebuild

Rebuild is a user-requested discard operation, separate from migrations and
automatic recovery. It does not require the old schema to be readable or the
remote full-data source to have been validated. The user must export diagnostics
and local data, save both files, and explicitly confirm permanent local-data
loss in the existing shadcn Dialog before it is enabled. Cancelling never resets
data. Pending transactions or unsynced document drafts may be discarded only
by that explicit confirmation; eligibility alone never starts deletion.

The operation acquires the existing exclusive rebuild lock, freezes local writes,
notifies other tabs, drains the connection queue and records `rebuild-in-progress`.
SQLocal's native `deleteDatabaseFile()` runs **before** worker destruction: it
coordinates the database mutation lock and removes the SQLite file, tables and
sidecar files regardless of their schema. The Notegic IndexedDB cache is also
cleared, including all user document drafts and attachment caches. Diagnostics,
preferences, cookies and remote data remain. The user should close other Notegic
tabs first; the SQLocal cross-tab close/reinit protocol and application write
barrier still apply. No migration SQL or version number is rewritten.

After deletion, the worker is closed and the document reloads. The existing
empty-database startup uses current `bootstrap.sql`, verifies the latest schema
version and continues normal app synchronization. It does not replay obsolete
historical migrations against the discarded database. A failed deletion/cache
clear surfaces an error and keeps writes frozen; an interrupted rebuild never
automatically repeats destructive work.

Local-data export format 2 includes the SQLite file and every Notegic IndexedDB
namespace. Blob/File contents and typed-array byte slices use base64 with type
metadata, and dates use ISO strings. An unreadable IndexedDB makes the export
fail rather than silently creating an incomplete backup. Downloads can contain
private notes/files and must be retained securely; this format is a recovery
artifact, not an implemented automatic import flow.

## Reporting after recovery

The existing Report navigation opens the authenticated Feedback tab. Recovery
can occur before authentication, so this surface reuses the configured contact
email (`VITE_CONTACT_EMAIL`, with the existing documentation contact as fallback)
instead of submitting through that API or copying its form.

Before sending a recovery report, export both files, attempt Rebuild, then sign
in and inspect cloud data in the app if it opens. A persisted diagnostic timestamp
keeps a dismissible follow-up after reload so the user can check the app first.
The email link is enabled only after a rebuild attempt and explicit confirmation
that the issue remains. Failed rebuilds can also be reported. It opens the mail
client with a short template; nothing is sent or attached automatically. Ask for
diagnostics, and only reviewed local-data files if necessary. Dismissing the
follow-up clears its marker, without changing workspace data. The follow-up also
auto-dismisses after 30 seconds of unpaused display. Its decorative bottom line
uses the existing Progress primitive and a native Web Animation, clipped within
the card's rounded border. Hover, keyboard focus and the open Report dialog pause
the same animation/timeout. System or app reduced-motion preferences hide the
animated line while preserving timeout behavior. Diagnostic updates do not
restart the countdown; hiding/unmounting the notice cancels its animation.

## Verification

Run the following from the repository root:

```bash
npm run test:unit -- apps/web/src/api/local/recovery.test.ts apps/web/src/api/local/migrator.test.ts apps/web/src/api/local/cleanup.test.ts
npm run typecheck
npx playwright install chromium
npm run test:e2e -- apps/web/test/e2e/localDatabaseStartup.spec.ts
npm run test:e2e -- localDatabaseRecovery.spec.ts localDatabaseStartup.spec.ts localDatabaseIsolation.spec.ts --workers=1
```

The Playwright startup test delays worker configuration and exercises two tabs
plus a reload. It must not report `Driver not initialized`, a duplicate
migration, an unhandled rejection, or a permanent migration lock. No backend
Docker services are required for this verification.
Development coverage also checks both tabs' ready state and schema version,
retains a marker row across reload, and holds the lock in another tab to verify
that OPFS opens only after release. Production smoke coverage checks page
availability and errors without importing development modules.

## Manual recovery

1. Use **Export → Export diagnostics** and retain the JSON.
2. Use **Export → Export local data**, acknowledge its personal content and
   save the complete SQLite/IndexedDB JSON.
3. Use **Check Eligibility** to review known pending changes independently of
   the original startup error, or **Retry** for a non-destructive retry.
4. Close other Notegic tabs. If choosing to discard all local workspace data,
   select **Rebuild**, confirm the saved backups and permanent loss, then wait
   for reload and current-schema initialization.
5. Sign in, enter the app and check cloud data before using **Report**. If data
   is still missing or rebuilding failed, open the email template and manually
   attach the diagnostics. Review any local-data attachment before sharing it.

Do not exercise Rebuild on a user's existing profile during development or
verification without their separate explicit instruction. Tests must use an
isolated disposable browser context. Never clear site storage or reset local
migrations merely to make a test pass.


## Current-version test assertions

Startup and explicit rebuild assertions must use the migrator's current target,
not a historical constant. On 2026-11-04 the latest Material migration made the
local target 6. The recovery browser test reached ready/version/target 6 but
failed its older expected value of 5; startup/reload/down-up tests passed.
Keep the export, confirmation, error-retention and data-preservation checks
when updating that fixture. Never alter migration history or a real user's
database to satisfy the old number. See the
[workspace verification record](workspace-release-verification.md#recorded-candidate-2026-11-04)
for the complete result and remaining release gates.

The 2026-11-05 fixture correction reads the migration journal independently and
asserts both the rebuilt version and target against its entry count. This
checks the migrator's current target without comparing two potentially wrong
runtime values or freezing an obsolete version. Migration sources and existing
user databases are unchanged; rebuild testing uses only disposable contexts.
