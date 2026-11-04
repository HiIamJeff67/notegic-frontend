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
