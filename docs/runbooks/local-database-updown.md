# Local database up/down for Routine execution

SQLite `PRAGMA user_version` tracks browser migrations. Version 3
(`0002_first_tyrannus`) introduced Routine timeout and removed legacy
status/phase/cost fields. Version 4 (`0003_hesitant_forgotten_one`) adds
Routine activation/definition version and common RoutineTask node kind/X/Y,
normalizes Action payload metadata and backfills legacy starting nodes.

## Upgrade

Deploy compatible backend contracts and PostgreSQL migration before the web
bundle. `LocalDBMigrator.ensureMigrated` runs each migration and its version
flag in one transaction. Fresh databases use generated `bootstrap.sql` at
version 4. Edit schema source and run `npm run generate-local-migrations`
to generate snapshots and bootstrap; never hand-edit those artifacts.

The version-4 up SQL is a curated additive transition: it does not rebuild
unrelated tables because of generation-time timestamp defaults. Existing
Routines become active, while new Routines default inactive. Existing task,
dependency and Routine IDs remain unchanged. Actions receive
`schemaVersion: 1` and canonical payload `purpose`; reserved metadata
conflicts abort the transaction.

Each nonempty legacy Routine receives a canonical Start linked to its
zero-indegree Actions. Its UUID toggles the first hexadecimal nibble by eight,
matching PostgreSQL. Empty Routines receive no Start. Existing draft positions
populate node coordinates; draft JSON, unrelated rows, IndexedDB/Yjs and
pending transaction IDs/bodies remain intact. Queued legacy Routine creates
are enriched with their existing active intent, including batch creates.

## Local-first behavior

Node writes reuse the existing transaction queue and CRUD hooks. A stable
client-generated UUID makes ambiguous create retries idempotent. A network
failure saves locally as pending; permission/schema/version failures are not
reported as synchronized. Pending node edits/deletes are protected from
canonical read reconciliation. Queue replay is ordered and preserves the
initial version-conflict boundary while accounting for acknowledged local
edits. A failed predecessor does not acknowledge its dependent writes.

Graph edges retain the existing pending/invalid draft flow. The editor supplies
`expectedDefinitionVersion`; a conflict needs refresh/review, not silent
last-writer-wins rebasing. Layout updates do not increase the execution
definition version. Starts can overlap any other node and are not normal
Actions in lists/counts.

Node mutation responses carry the version acknowledged in the backend write
transaction. Queue acknowledgement advances matching same-Routine successor
bodies and edge-draft expectations and removes the successful predecessor in
one SQLite transaction. This survives partial network failure and reload;
never replace a failed request's expectation with a fresh GET version.
Unversioned queued node writes remain failed for review. An ambiguous create
can replay only the same stable ID/definition at its expected post-create
version; other ambiguous or conflicting writes require reconciliation.

The graph Retry button also drains node-only queues, resets retry counters only
for the current user's selected Routine nodes, then retries edges after nodes
are acknowledged. Background completion refreshes pending counts. Edge
expectations are additional JSON metadata, not a new SQLite migration. Legacy
edge drafts without an expectation are preserved as invalid and require
review/reapplication. Acknowledged draft positions do not override canonical
X/Y, and React Flow dimension/selection events do not mark the graph dirty.

Offline Routine activation returns an explicit pending result and keeps the
requested local toggle; replay must disable local fallback. Canonical Action
payload-only creates/updates and legacy requests normalize the local Purpose
projection together with payload metadata. Invalid metadata does not change
rows or enqueue a write. Read reconciliation preserves pending node intent.
DefinitionConflict and RescheduleRequired have localized public messages in
every supported language.

Execution identity and billing belong to the backend's captured Station owner.
Neither local Routine nor RoutineTask gains an editable Actor field. The task
SQLite schema never contained Actor, so its backend removal has no standalone
local migration. Admission reasons are read-only backend observations; offline
reads show Unknown rather than estimating another Station owner's balance.

## Rollback

Stop writes and export origin storage first through
`localDB.downloadLocalData()`; verify and retain the download. While a
compatible version-4 bundle remains loaded, call `LocalDBMigrator.down(4)`
against that database. It checks the actual version inside the transaction,
archives activation/layout/control nodes and Start edges, removes only the
new control-node representation, restores flat legacy Action payloads, and
sets `user_version` to 3. A subsequent up restores the archived feature data.

Down refuses queued node mutations: synchronize or resolve them with the
current bundle first. Do not delete them to make rollback pass. Other queued
operations and graph drafts remain preserved. Only switch to the version-3
bundle after local down succeeds. Backend down cannot migrate every browser;
profiles not yet rolled back must keep a compatible bundle. Maintain scheduler
maintenance on the backend during an old-version rollback, as documented in
the backend Routine execution design.

The version-3 down remains available for a separate 3→2 rollback; it restores
legacy status/phase/cost data and preserves timeout through its own backup.
Do not skip migration versions.

## Verification and retained data

Run with Node 22 from `.nvmrc`:

```sh
npm run test:unit -- apps/web/test/integration/routine-migration.test.ts
npm run test:unit -- RoutineTaskSyncLogic migrator dependency-draft-error
npm run typecheck
npm run test:e2e -- routine-graph.spec.ts local-database-startup.spec.ts --workers=1 --timeout=90000
```

The SQLite integration suite executes the real SQL splitter and migrations on
the historical schema, populated data, pending operations and position drafts.
It verifies up/down/up, conflicting metadata atomic rollback, fresh bootstrap,
and refusal to down while node writes remain queued.

On 2026-10-17 the existing populated development browser was exported first,
then upgraded from version 3 to 4 without clearing storage or signing out.
The original shelf, BlockPack, note content and to-do remained visible.
Read-only inspection confirmed version 4, one shelf, one BlockPack and zero
pending transactions. That profile had no local Routine/node/draft rows;
legacy Routine-row preservation is evidenced by populated SQL fixtures, not
by pretending that profile contained them. Isolated Playwright tests also
verify populated SQLocal graph down/up/reload, pending queue and draft retention,
and production Start-node handles, dragging, naming and activation controls. The backup and existing Docker
containers/volumes were retained; the original backend DB was not reset.

## Manual local review

The original development backend database was backed up, migrated and restored
to normal service on 2026-10-18. Do not rerun migrations, clear browser storage
or delete containers to begin UI review. Retain the existing populated profile;
use a new inactive test Routine for destructive graph operations.

- Confirm existing content, Routine activation and graph positions survive
  startup/reload. A newly created Routine must be inactive until enabled.
- Add a Start and an Action. Start is circular, its title is outside, and its
  active/inactive state is green/gray. Node left-click only selects; right-click
  or the context-menu keyboard shortcut opens Edit/Delete, with Active on Start.
  Edit opens the existing Inspector; clicking a node must not open it directly.
- Drag both node kinds repeatedly. After the debounce/save, reload and confirm
  the final positions persist without the canvas jumping or resetting its zoom.
- The add menu must have no Dependency action. Drag a source handle to an
  Action target handle, then left-click the edge. Edit opens the dependency
  Inspector; Delete removes only the edge and retains both endpoint nodes.
- Test offline movement/activation with fixture data: pending status must remain
  visible, reload must retain intent, and Retry after reconnect must synchronize
  it without duplicating nodes or silently overwriting version conflicts.
- If testing scheduling, use a disposable Routine with known quota/resources.
  Pause prevents new admissions, not already-running work. Resume must not run
  missed occurrences in a burst; an expired one-shot requires rescheduling.

Automated local checks passed: formatting/lint/typecheck, 50 Jest suites and
282 tests, graph/SQLite browser regressions, unchanged GraphQL generation and
the Cloudflare production build. No frontend deployment or daily-profile
reset is implied. The backend checkpoint records the original DB cutover,
restored-copy rehearsal and isolated production-image owner-init tests.

This handoff is for product review, not release approval. Both worktrees remain
uncommitted. The candidate-commit compatibility gate must run after authorized
delivery preparation; published-image provenance and staging/production smoke
and rollback checks remain separate release steps. Do not replace those gates
with UI sign-off or claim that a local build deployed the application.

## Authenticated Routine runtime verification

The opt-in `apps/web/test/e2e/routine-backend.spec.ts` targets a dedicated
live backend, not intercepted RPC responses. Provision an isolated migrated
PostgreSQL database, ClientGateway/Core/DurableJob processes, Kafka broker and
cache namespace first. Never point it at the original development DB.

```sh
E2E_RUN_ROUTINE_BACKEND=true \
E2E_ROUTINE_API_URL=http://127.0.0.1:38081 \
E2E_ROUTINE_DATABASE=notegic_routine_acceptance_20261018 \
npx playwright test apps/web/test/e2e/routine-backend.spec.ts --workers=1
```

The suite uses a separate Playwright profile, creates uniquely named fixture
accounts, retains their data and advances only fixture scheduling timestamps
in the isolated DB. It does not delete accounts, clear storage, remove Docker
containers or migrate the original backend database.

It exercises real login, Start creation/rename/reload, parent version
invalidation, Active toggle/refetch, production worker completion, owner
billing and reservation release. A second graph proves that an unreachable
predecessor blocks its dependent creation task and descendants without
charging them, while independent branches still complete and no blocked
domain object is created.

Successful node/edge mutations invalidate the parent Routine query. Routine
search synchronization retains isActive and definitionVersion; activation
awaits a canonical refetch before clearing pending UI intent. AdmissionState
is response-only. These boundaries are covered by the live test and the
search adapter regression test.

On 2026-10-18 this suite passed against the retained acceptance DB, together
with eight graph/startup browser tests, 50 Jest suites/282 tests and
typecheck. RealtimeGateway/WebSocket, Yjs and production-image/staging
deployment are separate checks, not claims made by this Routine rehearsal.
Backend isolation, acceptance mapping and retained-resource details are in
`docs/checkpoints/2026-10-17-routine-owner-migration.md` of the backend repo.
