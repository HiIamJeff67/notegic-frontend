# Workspace release verification

Use this runbook before delivering changes that cross command navigation,
resource availability, local persistence and editor/viewer state. Passing a
build or a targeted unit suite alone is not release acceptance.

The latest correction and validation are recorded in
[the 2026-11-05 follow-up](#follow-up-2026-11-05). The original failed run below
is retained as evidence rather than overwritten.

## Environment and boundaries

- Inspect the candidate diff against the local tracking ref before selecting
  tests. Do not fetch, commit, push, tag or deploy without authorization.
- Keep a developer's running server and browser profile separate from tests.
  The repository Playwright config starts a dedicated server on `127.0.0.1:4173`.
- Use isolated browser storage and fixture records. The recovery suite
  deliberately discards only its own exported/confirmed test database; never
  apply that workflow to a user's populated profile to make a test pass.
- Genuine authenticated acceptance requires the isolated Core/Gateway setup in
  [Local database up/down](local-database-updown.md#authenticated-routine-runtime-verification).
  A controlled HTTP/RPC fixture is not that backend and does not prove remote
  data, object storage, multi-client delivery or deployment compatibility.
- The production comparison below builds Node SSR locally. Cloudflare bundle
  compatibility remains a separate `build:web:cloudflare` check; neither build
  deploys the application.

## Commands and expected coverage

```sh
npm run format:check
npm run lint
npm run typecheck
npm run codegen:check
npm run test:unit
npm run test:e2e -- localDatabaseStartup.spec.ts localDatabaseIsolation.spec.ts localDatabaseRecovery.spec.ts searchOffline.spec.ts routineGraph.spec.ts articleResponsive.spec.ts articleVersions.spec.ts apiResponses.spec.ts apolloSession.spec.ts realtimeClient.spec.ts sessionTabs.spec.ts publicNavigation.spec.ts viteStartup.spec.ts --workers=1
E2E_ROUTINE_API_URL=http://127.0.0.1:38919 npm run test:e2e -- serverFunctionErrors.spec.ts --workers=1
npm run build:web
E2E_PRODUCTION=true npm run test:e2e -- articleVersions.spec.ts --grep 'version deep links' --workers=1
npm run build:web:cloudflare
npm run test:security
```

The RPC suite owns its synthetic upstream on port 38919. Never substitute an
existing backend for that endpoint. The production run uses the built Node
server and must run after development Playwright has released its port, or use
a separate local port through a temporary config.

Use the installed Playwright browser normally. In the recorded run, bundled
Chromium was unavailable, so Jest used `PLAYWRIGHT_CHANNEL=chrome` and temporary
Playwright configs extended the repository config with Chrome, an explicit
repository `webServer.cwd`, and isolated artifact output. Development stayed on
4173; the Node SSR comparison used 4183 for its URL, baseURL and `PORT` together.
No committed browser or service configuration was changed.

## Recorded candidate: 2026-11-04

Candidate `8b3bd374`, compared with local `origin/main` at `6844d493` (14 local
commits; the remote ref was not refreshed). Node 22.23.1 and the installed
Google Chrome were used. The existing developer server on port 6776 was left
untouched. Docker inspection found the backend containers stopped; no backend
container, migration or user database was started or changed for this run.

| Check | Result |
| --- | --- |
| Format, lint and TypeScript | Passed; the final typecheck reused the matching Turbo cache |
| GraphQL generation | Passed, with no generated diff |
| Complete Jest run | 105 suites, 1,491 tests passed, including isolated Chrome integration and in-memory SQLite tests |
| Development E2E selection above | 124 cases: 110 passed, 13 failed, 1 skipped |
| Independent graph conflict/activation rerun | Both selected failures reproduced |
| HTTP/RPC suite | 22 passed, 1 failed |
| Node SSR build | Passed |
| Built Node SSR version deep link | Failed with the same heading outside the viewport |
| Cloudflare build | Passed; matching build reused the Turbo cache |
| Production dependency audit | Exit 0 at the configured high threshold; 4 low and 2 moderate advisories remain |

### Findings and next acceptance criteria

| Area | Evidence and interpretation | Required follow-up |
| --- | --- | --- |
| Article hydration | Development repeatedly reports a server/client tree mismatch at `ArticleCommand`. Its server render returns `null` while the initial browser render creates a body portal (`ArticleCommand.tsx:247`). | Make initial SSR/client rendering compatible, then assert no hydration errors on document entry. The production deep-link failure below is confirmed separately; a shared cause has not been established. |
| Version deep links | `/document#version-0-2-0` fails `articleVersions.spec.ts:148`: the heading exists but its viewport ratio stays 0. Reproduced in development and built Node SSR. | Verify initial hash navigation reaches the requested paragraph, then exercise the document command. The failing test stops before its command-search assertions, so those assertions are not evidence of a second observed failure. |
| Version-card tests | Four progress tests assume every card contains a Ring, but future cards intentionally omit it. Another test expects 4 cards while the current data produces 6. | Update fixture/selector assumptions while retaining geometry and reachability assertions. These failures alone do not establish a product layout defect. |
| Recovery fixture | Rebuild reaches ready state and schema version/target 6; `localDatabaseRecovery.spec.ts:273` still expects both values to be 5. | Derive the expected current version from the migration owner; preserve the original-error/export/confirmation assertions. Do not change migrations to satisfy the old number. |
| Graph deletion fixtures | Three cases wait for a legacy Delete dialog after selecting Delete. Draft node deletion now invokes the owning local draft operation directly. | Adapt the interaction to the current owner and continue checking atomic Save, workspace identity and draft/queue preservation. |
| Standalone graph fixture | Starting-node coverage fails because `mountRoutineGraph` renders a node using `useHardDeleteMyRoutineTaskById` without ApolloProvider. | Supply the normal provider boundary in that fixture; do not bypass the production hook. |
| Graph conflict review | `routineGraph.spec.ts:1114` times out waiting for Keep mine. Logs include Zod failures while the fixture assigns read responses by request order. Reproduced alone. | Inspect the actual request/response sequence and review state before deciding whether this is a fixture or product defect. No resolution has been assumed. |
| Offline activation/replay | `routineGraph.spec.ts:1888` times out waiting for Active queued. Reproduced alone. | Trace offline mutation, durable queue state and replay acknowledgement. The earlier canonical-payload checks do not prove the final replay state. |
| Login upstream failure | The RPC login case cannot find its expected server-error message at `serverFunctionErrors.spec.ts:138`. It stops before checking password clearing and request count. | Record the actual displayed message and request count for HTTP 503. Do not claim the no-retry assertion passed based on this failed case. The other 22 RPC cases passed. |
| Dependency audit | npm reports moderate fast-uri and seroval advisories and low KaTeX-related dependency findings. | Triage applicability and compatible upstream fixes separately; no automatic audit fix or lockfile change was performed. |

The three new Routine/RoutineTask deletion/new-draft E2E cases passed, as did
startup, reload, migration round trips, offline search and the other retained
cases. Their success does not waive the failures above.

### Skips, retention and decision

`sessionTabs.spec.ts` was skipped because the opt-in isolated live
Core/Gateway/database was not provisioned. Authenticated backend, storage and
real multi-client deletion/revocation acceptance remain unproven in this run.

Development/production test servers, synthetic upstreams and isolated browsers
exit with their runners. Temporary Playwright configs are removed after use;
logs remain under `/private/tmp/notegic-readiness-*.log`. Real browser data,
backend volumes, migrations and the developer's port-6776 service are retained.

**Hold delivery pending review and correction of the failures.** This record
is local evidence, not deployment approval. Product and test sources were not
changed to turn failures green. The documentation changes remain uncommitted;
no push or deployment was performed.

## Follow-up: 2026-11-05

The working tree fixes the failures recorded above; HEAD remains `8b3bd374`.
No commit, push, backend edit, dependency change or migration change is part of
this follow-up. Existing browser data and editor drafts are retained.

### Corrections and evidence

- `ArticleCommand` now directly renders its fixed overlay, matching `AppCommand`.
  The server no longer returns `null` before the client creates a body portal.
  The existing hash navigation works without an additional scroll workaround.
  The regression checks current-version entry, navigation through command
  domains to a hidden previous version, the selected sidebar link and absence
  of hydration errors, including against a fresh Node SSR build.
- Version-card tests use the current roadmap and visible-card ownership.
  Future versions intentionally omit Ring; other cards retain their Ring and
  exact spacing/expansion assertions. Recovery checks both version and target
  against the migration journal, retaining exports and data-preservation checks.
- Graph fixtures use the normal Apollo/Query boundaries, current local Delete
  interaction, actual server-function operation URLs and the local response's
  empty `embedded.publicId` marker. They keep explicit Save/CAS, queue and
  workspace identity assertions. Request arrival order is not the read contract.
- Conflict review also exposed a product defect: successful offline fallback
  data could be accepted as a remote baseline. Each review read now requires a
  remote response; a failed or mixed read preserves the draft and permits retry.
  The conflict case retains network/version rejection, Keep mine, Apply to draft,
  reload and subsequent explicit Save assertions under its original timeout.
- Server-function middleware preserves typed gateway errors and their original
  presentation reason. The shared network classifier still permits read
  fallback for gateway 502/503/504; other typed statuses remain failures.
  Login 503 coverage checks the exact translated error, cleared password and a
  single request. Raw transport failures still use MissingNetwork.
- RPC UI cases wait for page loading before changing locale or entering values:
  the pre-paint density attribute alone does not prove hydration is complete.
  The Japanese registration regression passed two repeated runs with the exact
  expected message and no API request; assertions and retry policy are unchanged.

### Follow-up commands and boundaries

Commands use the selection above, installed Chrome and isolated test storage.
The temporary development config uses 4173; Node SSR uses 4183; the HTTP/RPC
config uses 4184 with its owned synthetic upstream on 38919. Each temporary
config extends the repository config and sets an explicit repository cwd.
No live credentials or existing user browser profile are used.

The targeted network/query-client/error-translation/response-adapter Jest run
passed 4 suites and 306 tests. The complete Jest run passed 105 suites and
1,501 tests. The complete affected development E2E selection finished with
123 passed and 1 skipped in 7.3 minutes, with no failures. The skipped
`sessionTabs.spec.ts` still requires the unprovisioned isolated live backend;
it was not disabled to obtain this result.
The complete controlled HTTP/RPC suite passed all 23 cases. The
built Node SSR deep-link/command regression passed. Format, lint, TypeScript,
Node SSR build and a fresh Cloudflare build passed. The build retains existing
upstream deprecation warnings; none required a dependency or API migration.

Logs are retained at `/private/tmp/notegic-followup-*.log`; browser artifacts
use `/private/tmp/notegic-followup-results`, `notegic-followup-rpc-results` and
`notegic-followup-production-results`. The original developer service on 6776
is left running. Temporary configs and runner-owned servers are removed or
stopped after verification.

Live authenticated backend/storage and real multi-client session acceptance
remain separate release gates. The controlled RPC suite cannot establish those
properties. Delivery remains subject to review; no deployment is implied.

### Subsequent local packaging

After verification, the user authorized local commits on 2026-11-05. Document
corrections are in `ef76506a`, graph review corrections in `6cbf0f18`, and login
error corrections in `e48150d0`. The recovery fixture and this verification
record are packaged together in a separate test commit. Each commit includes
its generated devlog. This packaging does not change the tested product code,
authorize a push, or satisfy the remaining live-backend acceptance gate.

## Live Core/Gateway verification: 2026-11-05

The user subsequently authorized starting a local backend and running the
remaining authenticated session/login/resource-deletion checks. Product code
remains at `92f70b6c`; the follow-up changes only browser tests and this record.
No new commit, push, tag or deployment is part of this verification.
The sibling backend source revision is `99a21bfb`; its working tree is unchanged.

### Isolated environment

- Started the existing PostgreSQL and Redis containers without recreating them
  or their volumes. The original Core/Gateway/DurableJob services remain stopped.
- Created `notegic_routine_acceptance_20261105` as a copy of the retained
  `notegic_routine_acceptance_20261020` test database. No original database was
  migrated, cleared or repointed. Fixture accounts use unique names and are
  retained; deletion operations target only objects created by this run.
- Built current-source Core and ClientGateway into `/private/tmp`, then started
  separate loopback processes on 38080 and 38081. Both point to the new database,
  Redis DB 14 and the existing independent integration Kafka on 19094.
- Used fixture-only session, CSRF and delegation keys. No production signing key
  or OAuth credential is used. Turnstile is disabled for this local environment.
- Created the required Core topics in the isolated broker. No Email consumer or
  external delivery service was started. Core uses its in-memory storage adapter;
  the Material deletion case verifies metadata/viewer state, not uploaded-file
  delivery or production object storage. RealtimeGateway/Yjs, Notification,
  Feedback and DurableJob are outside this runtime.
- Playwright uses installed Chrome, disposable browser storage and its own 4173
  frontend. The developer's 6776 service and original browser profiles stay
  untouched. A temporary config sets `sidebarHoverDelay: 3000` through the existing
  local preference storage format; this is the supported disabled value, not a
  DOM/style override. This affects only test contexts.

### Commands and assertions

Use the isolated runtime above, never a populated personal database, for:

```sh
E2E_RUN_ROUTINE_BACKEND=true \
E2E_RUN_PAGE_BACKEND=true \
E2E_ROUTINE_API_URL=http://127.0.0.1:38081 \
E2E_ROUTINE_DATABASE=notegic_routine_acceptance_20261105 \
E2E_ROUTINE_ACCESS_TOKEN_SECRET=routine-refresh-fixture-access-only \
npm run test:e2e -- --config=/private/tmp/notegic-live.config.mjs sessionTabs.spec.ts authenticatedPages.spec.ts routineBackend.spec.ts resourceAvailabilityBackend.spec.ts --grep 'new tabs|local authenticated pages|expired access|editing a new Routine|real deletion|live login' --workers=1
```

The temporary Chrome config extends the repository configuration and changes no
product route, API acknowledgement or network response. Logs are retained under
`/private/tmp/notegic-live-*.log`; screenshots and failures use
`/private/tmp/notegic-live-results`.

`resourceAvailabilityBackend.spec.ts` creates real Material, BlockPack, Routine
and RoutineTask records and issues their actual deletion APIs. It then explicitly
refetches the active detail query through QueryClient, without replacing cached
data. Material/BlockPack remain on their original route with the exact Not Found
message. The persisted task's inspector hides editing while retaining its
unsubmitted title; deleting its Routine hides the graph without removing its
stored draft. This is evidence of handling a confirmed refetch, not an automatic
cross-client deletion notification or a sidebar-delete navigation assertion.
The inspector can render its draft while its initial detail query is pending.
Refetching at that point can join the older request. The test first settles that
read and asserts a successful active subscription, then checks the real 404
after deletion, the refetched query's empty data, and the UI. A diagnostic run
confirmed the pending-read state; the test does not treat a coalesced request
as a new post-deletion read or replace cached data to bypass it.

The live login case checks that a short password is translated before any login
RPC, and that a correctly formatted wrong password reaches Core once, displays
the exact translated rejection and clears the password. Existing session tests
exercise missing-tab CSRF, rejected CSRF, expired access renewal, session-cache
loss and a real two-tab definition conflict with retained/reloaded drafts.

The older Routine creation case assumed immediate node writes. Its updated
assertions require local staging, an explicit toolbar Save, verified safe draft
refresh after parent edits, and a second explicit Save. Database counts and
versions are checked before and after submission. A stale external edit must
still reject one write, retain the local node through reload and leave the
remote task count unchanged. Inspector input is edited only after its initial
value agrees with the database; asynchronous loading must not overwrite the
test's edit.

### Final result and retained services

The final six-case run passed all six cases in 1.8 minutes with no skips:
authenticated page sessions, real resource deletion/draft retention, login
validation/wrong password, access renewal after session-cache loss, graph
creation/version conflicts, and two-tab session/conflict recovery. Exact log:
`/private/tmp/notegic-live-complete.log`.

`npm run format:check`, `npm run lint`, `npm run typecheck` and `git diff --check`
passed on the final test sources. Static logs are
`/private/tmp/notegic-live-{format,lint,types}-end.log`. No product, dependency,
generated-contract or migration source changed, so the earlier unit/build
results remain historical rather than being claimed as newly rerun checks.

Initial failures and diagnostics remain in `notegic-live-initial.log`,
`notegic-live-final.log`, `notegic-live-verified.log`,
`notegic-live-deletion-diagnosis.log` and
`notegic-live-deletion-confirmation.log`. They distinguish the hovercard defect,
obsolete staging assumptions, incomplete inspector initialization, test-route
parameters and the pending-read/refetch race from backend contract failures.
The final case adds successful active-query, real 404 and empty-query-data
assertions; it does not waive the earlier failure or force a remount/reset.

Runner-owned browser/frontend processes exit after testing. The isolated
Core/Gateway, PostgreSQL/Redis and integration Kafka are left running for local
review; no acceptance database, account, volume or original browser profile is
removed. The fixture-only startup/configuration and PID records remain under
`/private/tmp/notegic-live-*` for inspection. The backend repository is unchanged;
frontend test/document changes remain uncommitted. No push was performed.

The previously unprovisioned session/login/refetch-deletion checks now have real
Core/Gateway evidence. This does not close the separate issues below or establish
production storage, realtime/Yjs, automatic cross-client deletion delivery,
DurableJob execution, staging or deployment acceptance.

### Additional observed issues

- With the default sidebar hover delay, a routine hovercard can intercept clicks
  on the context menu's Open in inspector item. The first live run captured that
  pointer interception. Disabling sidebar previews through the existing setting
  permits the scoped data-flow checks; it does not fix this interaction defect.
- Authenticated page navigation preserves the session, but full-page entry to
  Account and Preferences reports hydration mismatches. `ScreenProvider` starts
  at width 0 during SSR and the actual browser width on the client; both pages
  conditionally render their sheet-toggle button at width 1024. The logged
  mismatch points at that button. This is separate from the corrected Document
  command hydration issue. The session-only page test does not assert hydration
  cleanliness, so its pass cannot waive these errors.
- Intermediate development runs also logged TanStack route initialization
  (`trimPathRight`) and LocalPreferences context errors. These are retained in
  the logs and are not attributed to a Core API contract without further evidence.
  No runtime workaround or assertion suppression was introduced.

## Sidebar overlays and settings hydration follow-up: 2026-11-05

The subsequent UI fix keeps all earlier working-tree tests and evidence. No
commit, push, backend change, dependency update, migration edit or user-data
reset is part of this follow-up.

### Changes

- `AppUtilitiesWrapper` provides one `ContextMenuProvider` for its existing
  menus and sidebar. The ContextMenu wrapper reports native Radix open/close
  events, retains caller callbacks and releases only its own active menu on
  unmount. SidebarHoverCard closes and rejects delayed opens while any menu in
  that scope is open. Scoping only one item was insufficient: a Station preview
  could cover a Routine's menu. There is no z-index override, forced click,
  hidden trigger, feature-specific timer or permanently disabled preference.
- ScreenProvider starts at the same width/height 0 on server and client, then
  its existing resize subscription updates the real dimensions. This removes
  the initial conditional sheet-button mismatch without changing the layout
  breakpoint or remounting settings content.
- useNetwork starts with a consistent online snapshot, then observes actual
  browser connectivity through its existing effect/events. Node's navigator
  may exist without onLine; treating that undefined value as offline rendered
  OfflineTab on the server and ProfileTab on the client.
- Profile and Account date labels display a stable dash until real user data
  exists. Their FakeUser defaults contain independently constructed dates,
  which otherwise produced different Last updated text during hydration.
  Real dates retain the existing locale formatting; form/draft state is not
  replaced to fix the mismatch.

### Verification

All browser contexts in this follow-up use the normal enabled hovercard
preference. The prior temporary disabled setting is not carried into the new
Chrome config (`/private/tmp/notegic-ui-followup.config.mjs`).

- The real ContextMenu/SidebarHoverCard integration tests pass 3 cases: an
  already-open preview closes; pending opens remain suppressed; a sibling menu
  suppresses even a caller-controlled open preview. Dismissal restores normal
  behavior, the original trigger remains mounted, menu selection works and
  the disabled-preview preference remains effective.
- Targeted Jest passed 3 suites / 19 tests (overlay integration, screen
  breakpoints and Node network snapshots). Nitro's installed worker readiness
  tests also passed in the earlier targeted run.
- Complete Jest passed 107 suites / 1,507 tests on the final product/test
  sources in 226.11 seconds. Its log is
  `/private/tmp/notegic-ui-followup-all-unit.log`.
- The combined development selection in
  `/private/tmp/notegic-ui-followup-browser-complete.log` passed 8 cases. Its one
  failure was the newly added mobile assertion demanding a visible user menu
  inside a correctly closed sidebar drawer. The corrected test checks the
  mobile trigger, route and session, while retaining the desktop user-menu
  assertion and an empty page-error list.
- That final authenticated-pages rerun passed in
  `/private/tmp/notegic-ui-followup-settings-final.log`: Account and Preferences
  full-page entries at desktop and 390px produce no hydration/page errors or
  lost session. All earlier route, no-CSRF-failure and no-error-toast checks
  remain. No hydration-warning suppression or relaxed error assertion was used.
- The other 8 selected cases passed with the final product fixes: real graph
  creation/Save and version rejection, expired session renewal, two-tab conflict
  recovery, real deletion/refetch/draft preservation, exact login validation,
  concurrent SSR invalidation, cold startup and HMR/SQLite row retention.
- Format/lint/typecheck passed. Node SSR and a fresh Cloudflare build passed;
  built Node SSR public-navigation/login/registration/document smoke passed
  both cases. Logs use `/private/tmp/notegic-ui-followup-*.log`.

Commands used for this scope (with the isolated live variables from the previous
section when running authenticated cases):

```sh
PLAYWRIGHT_CHANNEL=chrome npm run test:unit -- apps/web/test/integration/sidebarHoverCard.test.ts apps/web/src/providers/ScreenProvider.test.ts apps/web/src/hooks/useNetwork.test.tsx
PLAYWRIGHT_CHANNEL=chrome npm run test:unit
npm run test:e2e -- --config=/private/tmp/notegic-ui-followup.config.mjs authenticatedPages.spec.ts routineBackend.spec.ts sessionTabs.spec.ts resourceAvailabilityBackend.spec.ts viteStartup.spec.ts --grep 'new tabs|local authenticated pages|expired access|editing a new Routine|real deletion|live login|cold startup|HMR accepts|concurrent SSR' --workers=1
npm run test:e2e -- --config=/private/tmp/notegic-ui-followup.config.mjs authenticatedPages.spec.ts --workers=1
npm run format:check
npm run lint
npm run typecheck
npm run build:web
E2E_PRODUCTION=true npm run test:e2e -- --config=/private/tmp/notegic-ui-followup-production.config.mjs publicNavigation.spec.ts --workers=1
npm run build:web:cloudflare
git diff --check
```

The built Node SSR smoke uses its own 4183 endpoint and no live credentials.
Backend source is unchanged, so backend Go unit/race targets and contract
generation were not rerun. The live Core/Gateway browser checks are the relevant
cross-repository verification for these frontend-only changes.

### Vite initialization diagnosis and limit

The original stack locations are route initialization at trimPathRight and a
consumer seeing no LocalPreferences context despite the declared provider
composition. They identify SSR module/route/context evaluation boundaries,
not a database migration or an API error contract. The exact transient cause
is not established from those stacks alone.

The Vite startup fixture now invalidates a temporary shared dependency of the
real Providers/useLocalPreferences modules and performs 4 batches of 6 concurrent
SSR requests across 3 edits. All 24 responses retained HTTP 200 and no matching
route/context failure text. Original cold-optimizer, no-automatic-reload and
actual HMR/full-reload SQLite retention assertions still pass. It uses native
Vite/Nitro and independent temporary optimizer/build directories, without
editing live source or restarting the server to turn a request green.

Upstream [Vite #22999](https://github.com/vitejs/vite/issues/22999) describes a
similar partial-export race; its [fix #23009](https://github.com/vitejs/vite/pull/23009)
is already present in the installed 8.2.4 module runner's in-flight cycle guard.
That similarity is context, not proof that the same bug caused these failures.
No package upgrade, node_modules patch, worker replacement, added startup retry
or relaxed timeout is justified by the current evidence.

Neither transient was reproduced in the final unchanged-source runs. Retain
the original logs and new regression coverage; do not label the exact Vite
root cause confirmed or claim a production-runtime fix. If it recurs, capture
the first failed URL/status/body and module invalidation timeline before
changing caches or data. Existing backend services and the developer's 6776
server remain intact; runner-owned browser/frontend processes have exited.

### Local packaging after review

The user subsequently authorized local packaging of this follow-up. Sidebar
overlay coordination is committed in `4d7e6605`, settings hydration in
`1f8573e0`, and live session/resource-deletion test updates in a separate
workspace test commit. Vite regression coverage and this complete record are
packaged together in their own test commit. Each includes a generated devlog.
This preserves the failed-run history and the unconfirmed Vite root cause;
local packaging does not authorize a push or deployment.

### Server-function HMR repair follow-up

A focused real-browser RPC regression reproduced
`getRequestHeader is not a function` on the first route hot update before the
repair. Runtime tracing in the preceding diagnosis observed the public Start
server barrel returning empty exports while a split server function imported
it through a cycle involving the Start handler and application router. This is
a demonstrated development module-boundary failure, not an upstream API or
local database failure.

Request/response APIs now come from the published
`@tanstack/start-server-core/request-response` subpath across server functions,
the response adapter and cookie bridge. The already-installed 1.169.39 runtime
is declared directly; no package upgrade, private dist import, library patch or
new wrapper is involved. LocalPreferences and User contexts remain with their owning Providers;
Vite module-local hot data retains only context identity across hot updates. Intermediate
coverage exposed both context mismatches; the final body check rejects any
`must be used within` message, not just the original LocalPreferences error.

The development-only client define plugin uses Vite's public transform API to
replace Start's existing TSS compile-time constants in unbundled client modules.
The blank-document test proves client RPC initialization with no global process.
An attempted whole-entry optimization was removed because it bypassed Start's
isomorphic transform and loaded Node AsyncLocalStorage in the browser.

The final startup suite passed all 6 cases in 41.4 seconds: concurrent SSR,
cold startup, accepted HMR/full-reload SQLite row retention, client RPC bootstrap
without globals, and route/SSR-preferences HMR with 96 real browser RPCs plus
216 page/module responses. The browser is unauthenticated and the real
TryGetUserData returns false without contacting a backend. Every RPC batch must
succeed; there are no retries, timing sleeps or worker replacements. Fixture
revision files, optimizer output and Nitro output are temporary and separate
from the developer's server and data.

Other verification:

- Formatting, lint and typecheck pass.
- Affected API, cookie, CSRF, User and preferences tests: 9 suites / 305 tests.
- Installed Nitro worker integration: 8 tests pass with loopback permission.
- Development Apollo, same-origin server functions and public navigation: 5 pass.
- Node SSR build passes (10.0 seconds), production navigation smoke: 2 pass.
- Cloudflare Worker build passes (11.6 seconds). No deployment was performed.

Exact local commands and retained logs:

```sh
npm run test:e2e -- --config=/private/tmp/notegic-vite-regression.config.mjs viteStartup.spec.ts --workers=1
PLAYWRIGHT_CHANNEL=chrome npm run test:unit -- apps/web/test/integration/userProvider.test.ts apps/web/test/integration/userSettingsLifecycle.test.ts apps/web/test/integration/sidebarHoverPreferences.test.ts apps/web/test/integration/sidebarHoverCard.test.ts apps/web/src/providers/LocalPreferencesProvider.test.ts apps/web/src/api/adapters/apiResponse.adapter.test.ts apps/web/src/api/adapters/exceptionSerialization.adapter.test.ts apps/web/src/api/bridges/cookie.bridge.test.ts apps/web/test/integration/csrfTransport.test.ts
npm run test:unit -- apps/web/test/integration/nitroWorker.test.ts
npm run test:e2e -- --config=/private/tmp/notegic-ui-followup.config.mjs csrf.spec.ts apolloSession.spec.ts publicNavigation.spec.ts --grep 'server functions enforce|Apollo|@environment' --workers=1
npm run format:check
npm run lint
npm run typecheck
npm run build:web
E2E_PRODUCTION=true npm run test:e2e -- --config=/private/tmp/notegic-ui-followup-production.config.mjs publicNavigation.spec.ts --workers=1
npm run build:web:cloudflare
git diff --check
```

The temporary startup config omits Playwright's redundant outer webServer; the
suite owns its Vite fixture. Chrome is used because bundled Playwright Chromium
is not installed. An initial sandbox worker run failed with EPERM and was rerun
with permission. No browser installation or user database cleanup was performed.
The final evidence is retained as `/private/tmp/notegic-vite-fix-startup-contexts.log`,
`notegic-vite-fix-unit-final.log`, `notegic-vite-fix-nitro.log`,
`notegic-vite-fix-transport-e2e.log` and the format/lint/typecheck/build logs with
the same prefix. The original failing regression is retained in
`/private/tmp/notegic-vite-regression-before.log`.

An intermediate run also emitted trimPathRight while other development/build
work was occurring. Its exact parent-route identity/invalidation cause remains
unconfirmed; final passing coverage does not justify claiming that original
route failure fixed. Earlier failed logs remain intact. No real-backend session
or deletion tests were repeated for this module-boundary repair, and no
production deployment is implied. Local data and drafts are preserved; this
follow-up is left uncommitted for review.


### Provider ownership review correction

The initial HMR repair extracted LocalPreferencesContext and UserContext into
separate files. User review rejected that ownership boundary. Both context
objects and their value types are now back in their Providers; hooks and fixtures
import those owners directly. Only the context objects are retained through
Vite's native module-local hot data, not account values, preferences, database
connections or drafts. No standalone context helper or global registry remains.
The prior six-case pass describes the earlier split-module implementation;
verification of this ownership correction is recorded separately below.

Ownership correction verification passed: the same 6 startup/RPC/HMR cases
(29.0 seconds), 5 affected Provider/preferences suites / 35 tests, format, lint,
typecheck, Node SSR build (13.5 seconds), production public-navigation smoke
(2 cases), and Cloudflare Worker build (12.3 seconds). Retained logs use the
`/private/tmp/notegic-context-owner-` prefix. No context files or imports to them
remain, and no retry, delay, user storage reset, commit or push was introduced.

### Frontend delivery gate — 2026-11-05

The owner authorized frontend-only GitHub delivery after the Provider ownership
correction. The complete Jest suite passed 107 suites / 1,507 tests, and the
pre-commit format, lint and typecheck checks passed. The targeted HMR, Provider,
production SSR and Cloudflare results above remain the applicable browser and
build evidence for these unchanged product sources. No generated GraphQL source
changed, no backend commit/push is included, and no data reset, tag or deployment
is authorized by this delivery. Full Jest output is retained in
`/private/tmp/notegic-delivery-unit.log`.
