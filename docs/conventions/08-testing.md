# Test location conventions

- Put a unit test beside the source file it verifies. Use `*.test.ts` or
  `*.test.tsx`, retaining the source basename and capitalization, for example
  `ScreenProvider.tsx` → `ScreenProvider.test.ts` and
  `routine.search.ts` → `routine.search.test.ts`. Do not add a `unit` suffix.
- Put Web-only integration tests in `apps/web/test/integration/`.
- Put integration tests that span shared packages or future applications in
  `test/integration/` at the repository root.
- Integration tests use descriptive smallCamelCase names followed by
  `.test.ts(x)`; their directory already expresses the category. Do not add an
  `integration` suffix. Classify tests by the actual boundary, not the runner:
  browser-mounted Provider/context/session flows belong in Web integration;
  isolated pure functions remain beside their owner.
- Put Web browser E2E suites in `apps/web/test/e2e/`; run them with
  `npm run test:e2e`. Keep them independent of live user credentials.

Performance tests retain `.performance.test.ts` under `test/performance/`.
BlockNote's production `specs/*.spec.ts(x)` are block specifications, not tests;
keep their Jest exclusion. The existing `test:unit` script runs Jest unit and
integration suites; its command name does not classify individual files.

## Local entry point and CI split

Use Node from `.nvmrc`, install dependencies with `npm ci`, then install the
test browser once with `npx playwright install chromium --only-shell`.
Run `npm run test` before pushing: formatting, lint, typecheck, generated
GraphQL drift, Jest unit/integration tests, development browser E2E, then the
production dependency audit.
The command stops on the first failure; it never formats or installs packages
automatically. `codegen:check` regenerates artifacts, so inspect any resulting
diff. Use `npm run test:unit -- <path>` for targeted Jest arguments, not
`npm test -- <path>` now that `test` is the aggregate.

Generated local migration metadata under
`apps/web/src/api/local/migrations/meta/` is excluded from Biome formatting;
Drizzle owns its serialization. Generated GraphQL output remains checked by
`codegen:check`.

Authenticated E2E remains explicit opt-in (`E2E_RUN_AUTHENTICATED=true`) and
must target an isolated backend: it creates/deletes its fixed test account.
Normal local tests use isolated Playwright browser storage, not your profile.

For CSRF changes, run the API unit tests and
`apps/web/test/integration/csrfTransport.test.ts`, then
`npm run test:e2e -- apolloSession.spec.ts csrf.spec.ts --grep 'Apollo|same-origin metadata' --workers=1`.
The source guard covers every protected upstream and prevents feature-owned
CSRF storage writers. A mocked hook response is not a transport renewal test;
publish fixture renewal at the replaced RPC/invoker boundary.
`sessionTabs.spec.ts` additionally exercises real isolated Core/Gateway login,
an empty new tab, access renewal, rejected missing/invalid tokens, and two-page
graph conflicts without losing drafts. Use the isolated acceptance variables
documented in [Local database up/down](../runbooks/local-database-updown.md)
and a fixture-only `E2E_ROUTINE_ACCESS_TOKEN_SECRET`. It never uses a real
account's credentials or signing keys. Preserve explicit review and Save
steps; do not make a conflict test pass by replacing the expected version and
automatically retrying the mutation.
Playwright defaults to two workers to leave CPU capacity for Vite and
SQLite/WASM startup. Use `--workers` explicitly for concurrency experiments.
The two-tab startup, reload and row-retention scenario has a 60-second total
test budget; individual database worker connections retain their 15-second
deadline and startup-error assertions.
The temporary Vite server's cold startup and prefixed documentation round trip
also have a 60-second total budget because they compile route trees from fresh
optimizer and Nitro output. They retain successful hydration, isolation, player,
startup-error, and browser-script assertions; this does not extend the database
worker connection deadline.

CI runs one job and one `npm ci`: `npm run test:environment` selects the four
`@environment` public-navigation and worker startup/reload smoke tests against
development and production Node SSR, Node and Cloudflare Workers builds. The
dependency audit is local-only via `npm run test:security`; local checks are no
longer duplicated in CI.

The same smoke tests run with `E2E_PRODUCTION=true` after `npm run build:web`;
this uses the built server, not Vite dev. Both test environments use base path
`/`, port 4173 and never reuse an unrelated running server. Source-importing
local database row-preservation E2E remains development-only in the local gate.
Startup smoke tests inspect errors and page availability, not a full database
schema/version assertion; they are not a substitute for persistence tests.
Cloudflare build success does not prove deployed Workers runtime behavior.

Pull requests and pushes to `main` trigger CI; feature-branch pushes no longer
duplicate PR runs. Concurrency cancels superseded runs. If branch protection
requires the removed quality/build/E2E/audit job names, update the required
check to `Frontend environment parity` when adopting this workflow. Local
quality checks now rely on contributors running the local gate.

## Nitro development worker readiness

Use the default `node-worker` when verifying Nitro upgrades. The pinned
`3.0.260903-beta` release includes the upstream serialized reload/readiness
fix and the HTTP error boundary. Do not replace it with a process runner,
increase Playwright's 120-second webServer deadline, add retries or clear user
storage to make startup checks pass.

Run `npm run test:unit -- apps/web/test/integration/nitroWorker.test.ts`.
The integration fixture uses the installed Nitro runtime, Vite ModuleRunner
and Nitro's own env-runner dependency in a real Node worker. Only Vite's module
responses are controlled; the fixture does not copy the readiness algorithm
or replace the worker's fetch/error handlers. It covers the first request
during a 4.5-second entry import, overlapping reloads, rejected imports,
throwing handlers, missing fetch handlers and an entry that never resolves.
The stuck-entry case waits for Nitro's unchanged native 30-second deadline
and requires an actual HTTP 503 response. Its test-only outer deadline allows
that behavior to be observed; it does not modify runtime or browser budgets.
Every case closes its own worker and uses no normal database or credentials.

Then run `npm run test:environment`, affected server-function/browser suites,
`npm run build:web`, the environment smoke tests with `E2E_PRODUCTION=true`,
and `npm run build:web:cloudflare`. A later successful request does not prove
that an earlier readiness request completed: retain the original response and
assert that it resolves. A dev build or retry passing is not proof that the
Cloudflare deployment is healthy.

Upstream context: [Nitro #4541](https://github.com/nitrojs/nitro/pull/4541).

## Vite dependency cache isolation

The development Playwright server must not share its dependency optimizer cache
with a running developer server. Vite replaces the cache when its optimization
inputs change; another server can retain URLs to chunks removed by that
replacement. A successful retry can hide this missing-file failure.

Nitro build directories must also be separate: generated service entries and
runtime files belong to one server. Playwright sets the Node-only
`NOTEGIC_NITRO_BUILD_DIR` to `node_modules/.nitro-playwright`; development keeps
Nitro's default. Fixtures that create additional real Vite servers provide a
temporary `nitro.buildDir` alongside their temporary optimizer cache. Sharing
these files can break hydration when differently based servers run concurrently.

`playwright.config.ts` sets the Node-only `NOTEGIC_VITE_CACHE_DIR` override to
`node_modules/.vite-playwright`, resolved against `apps/web/`. Normal development
leaves the override unset and retains Vite's default
`apps/web/node_modules/.vite` cache. Both caches remain reusable across sequential
runs. This is not a public `VITE_*` value or a Cloudflare runtime binding. Other
concurrently running Vite profiles must also use distinct cache directories.

Run `npm run test:unit -- apps/web/test/integration/viteCache.test.ts`.
The fixture loads the owning Vite and Playwright configurations, starts two real
optimizers with different dependency sets in a temporary workspace, then checks
the first server's on-disk chunk bytes, metadata and JavaScript response after the
second server starts and forcibly re-optimizes. A shared-cache negative control
must reproduce the missing file and HTTP 404; the configured isolated caches must
preserve the file and HTTP 200. It closes only its own servers and removes only
its temporary workspace. Then run the affected development browser
suites while the normal developer server remains running. Do not clear its cache
or user database, switch Nitro runners, add retries or extend startup deadlines
to make these checks pass. Node SSR and Cloudflare builds still require their
normal validation; cache isolation does not establish deployed runtime health.

## Vite cold startup and HMR recovery

Keep the explicit `optimizeDeps.include` entries in `apps/web/vite.config.ts`
aligned with dependencies actually missed by the initial TanStack client scan.
Apollo streaming/invariant, TanStack router internals, ProseMirror input rules,
KaTeX and Seroval were repeatedly discovered after the initial optimization.
Pre-bundling these entry points prevents the observed cold-start chunk version
replacement without disabling discovery or changing `holdUntilCrawlEnd: false`.
Preserve the framework plugins' include/exclude configuration; do not pre-bundle
SQLocal/WASM or every installed package indiscriminately.

Run `npm run test:e2e -- viteStartup.spec.ts --workers=1 --retries=0`.
The development-only suite creates a separate real Vite server from the owning
application config with a new temporary cache. Its first browser visit must
hydrate, initialize SQLite and reach Login without optimized-dependency HTTP
errors, uncaught browser errors or an automatic full reload. A warm retry cannot
make the cold-start assertion pass. Existing browser and server deadlines remain
unchanged; the suite has no CI environment-smoke marker.

The second case edits a temporary self-accepting module through Vite's real file
watcher and verifies HMR acceptance without reloading or losing the form value.
It then deliberately sends one full-reload event to exercise the application's
`vite:beforeFullReload` SQLocal teardown. SQLite must reconnect and retain the
fixture row. This explicit adverse event is not a retry or startup workaround.
Only the suite's own server, temporary workspace and isolated browser storage
are used; it never edits application source to trigger HMR or clears a normal
developer cache/database.

When dependencies or plugin versions change, inspect newly discovered entry
points before extending the list and rerun the cold fixture. Vite can still
legitimately re-optimize previously unseen routes or dependencies. Do not hide
504 responses with `ignoreOutdatedRequests`, disable HMR, add reload loops or
increase timeouts to satisfy the checks. Run the cache-isolation regression,
affected browser/auth/graph suites, Node SSR and Cloudflare build checks too.

## Realtime worker recovery

`worker_unavailable` keeps the existing Y.Doc, cached document and pending edits.
The client obtains fresh tickets with 1/2/4/8/10-second capped backoff; a root
reconnect replaces pending retries, while unmount, reset and stop cancel them.
Authentication and permission failures must not become endless retries. Genuine
`resync_required` and `channel_backpressure` retain explicit recovery behavior.
On disconnect, locally edited document state is queued for idempotent replay,
including deletions that do not advance a state vector. No cache is cleared by
temporary worker recovery.

Run `npm run test:e2e -- realtimeClient.spec.ts --workers=1` and
`npm run test:unit -- shared/lib/blockpack/blockPackYjsCoordinator.test.ts shared/lib/blockpack/localYjsDocumentStore.test.ts`
locally. These cover the production client/provider with isolated browser
storage and controlled worker failures, plus document retention, replay and
read-only boundaries. They do not stop the normal development worker and are
not hosted CI environment smoke tests.

## Apollo GraphQL session renewal

`apps/web/src/api/apolloClient.ts` reads the current session CSRF token for each
request and stores a nonempty string from `refreshableTokens.newCSRFToken` on a
successful HTTP response before Apollo applies GraphQL error policy. HTTP 200
field errors and partial results must retain both renewal and their original
data/errors. Missing or malformed metadata, authentication/HTTP failures and
network failures must not clear the stored token or be retried silently.

Read the body metadata rather than relying on `X-CSRF-Token`: cross-origin
response headers are not currently CORS-exposed. Use the existing session
storage boundary, keep access/refresh credentials in HttpOnly cookies, and do
not add backend validation exceptions. SSR must not write browser storage.

Run `npm run test:e2e -- apolloSession.spec.ts --workers=1` for the actual
production Apollo factory with controlled HTTP responses. It covers consecutive
renewals, GraphQL rejection followed by a successful query, partial data, bad
metadata, HTTP 401/403/500, malformed JSON and network failure. It uses isolated
browser storage and is local-only, without an `@environment` CI marker.

## Routine record search verification

The Routine and task-record tables and shared dialog use actual start time
descending by default, with unstarted records last. Search, status, purpose and
start-time interval filters are server-side, applied before cursor pagination.
Intervals include the lower boundary and exclude the upper boundary. Changing
conditions starts a new first page; cache keys must retain Date filter values.
The input/result previews are distinct; an empty result displays no detailed
output, independently of execution status.

Run `npm run test:e2e -- routineRecords.spec.ts --workers=1` locally for the
three real components' ordering, filter/reset and pagination interactions. To
include real login, Core/Gateway GraphQL, retained history fixtures, invalid
cursor/range rejection and access-token renewal, use the isolated acceptance
backend. Set `E2E_ROUTINE_ACCESS_TOKEN_SECRET` to the matching isolated Core and
Gateway access-signing key; it must start with `routine-refresh-fixture-` and
must never be a normal development or production credential:

```sh
E2E_RUN_RECORD_BACKEND=true \
E2E_ROUTINE_API_URL=http://127.0.0.1:38081 \
E2E_ROUTINE_DATABASE=notegic_routine_acceptance_20261020 \
E2E_ROUTINE_ACCESS_TOKEN_SECRET="$RECORDS_FIXTURE_ACCESS_SECRET" \
npm run test:e2e -- apolloSession.spec.ts routineRecords.spec.ts --workers=1
```

The live test retains a unique fixture account, inactive Routine and execution
records in that database. It expires only that fixture account's Redis DB 14
cache entry to verify renewal on a cache miss, then expires only its fixture
access cookie twice more to verify a cursor error and another successful
renewal. These queries use the production Apollo factory without manually
writing the returned CSRF token; each follow-up must send the token Apollo
stored. Assertions cover the dedicated GraphQL envelope, error paths/locations,
CSRF rotation and HttpOnly cookie replacement without exposing credentials.
It does not migrate or clear
existing data. All cases use isolated browser storage and have no CI
environment-smoke marker.
Deploy the compatible backend query fields before the frontend; no browser
database migration is required.

On 2026-10-21, the two Apollo session cases and four records cases passed against
the isolated live backend (49.2s). The session regression first failed without
the response link and passed with it. The live case verified three successive
access-token expirations, including a cache miss and a business HTTP 400 cursor
error transported as a GraphQL HTTP 200 response. Expiration is simulated using
the isolated fixture signing key; this is not a multi-hour browser soak.

The same local verification passed `npm run format:check`, `npm run lint`,
`npm run typecheck` and the 22 tests selected by
`npm run test:unit -- apps/web/src/api/clientHeaders.test.ts apps/web/src/api/policies/searchPagination.policy.test.ts`.
No schemas or generated sources changed for the Apollo fix; code generation
and deployment builds were not rerun. Original development record counts and
the retained manual development server were checked separately after E2E.

## Routine graph layout and API error transport

Routine activation persists `hasCustomSchedule`. Run
`npm run test:e2e -- routineActivation.spec.ts --workers=1` for the actual
Routine settings UI with controlled reads: default activation omits fixed
dates, legacy custom schedules can opt out, and recurrence keeps calendar
scheduling. Run the adjacent Routine contract tests and
`apps/web/test/integration/routineMigration.test.ts` for explicit false values,
server-selected activation windows and SQLite 4→5→4→5 row/queue/draft retention.
`localDatabaseStartup.spec.ts` verifies SQLocal's actual version-5 down/up path;
the graph's populated round trip walks every down to its legacy version rather
than assuming that graph version 4 remains the latest schema.

Dragging and Realign update only the local graph draft. The toolbar Save
button submits the layout captured at that click; later drags remain unsaved.
It shows Saving with a spinner and stays disabled until all responses and local
synchronization finish. Success and failure both release the busy state.
Reload and unmount never submit a layout. Dirty positions survive reload in
the existing draft JSON; they are not offline transactions until Save is used.
Creating nodes, editing node content and changing dependencies keep their
existing explicit operations and conflict boundaries. A rejected layout stays
editable and requires another Save rather than an automatic retry.

The graph toolbar's Active icon button reuses the workspace Routine update flow,
including its busy state and rollback after rejection. It switches Power icons,
exposes `aria-pressed`, and keeps the existing Pause/Resume tooltip. Disable
activation while the graph is saving. Its container owns the outline so disabled controls cannot
fade one side. Verify larger handles/arrowheads, a concise save confirmation,
and Routine details without storage or backend-synchronization messages.

Run `npm run test:e2e -- routineGraph.spec.ts --workers=1` for the real editor
with isolated browser storage and controlled RPC responses. For actual Start
request/response serialization, run:

```sh
E2E_ROUTINE_API_URL=http://127.0.0.1:38919 \
npm run test:e2e -- serverFunctionErrors.spec.ts --workers=1
```

The latter suite owns a synthetic upstream on that loopback port; never point
it at a real backend. It verifies restored API errors, translated conflict,
quota and `RescheduleRequired` activation errors, and the no-retry policy,
independently of the graph response mocks. Unit coverage also reloads the
exception module and creates an error in another JavaScript realm to verify
that neither HMR nor runtime isolation can make a branded API error fall through
to Start's shallow Error serializer. An expired schedule must remain inactive
and prompt the user to choose a future schedule, not silently reschedule it.
No schema up/down or data reset is required by the optional dirty marker in the
existing draft JSON.

## Server-function CSRF verification

`src/start.ts` explicitly installs the official `createCsrfMiddleware` for
server functions. A custom Start entry replaces the framework's automatic
installation; serialization adapters do not replace CSRF protection. Keep the
default same-origin policy and the backend's independent session-token checks.

Run `npm run test:e2e -- csrf.spec.ts --workers=1` locally for same-origin,
cross-site, same-site/different-origin, Origin/Referer fallback and missing
metadata cases. This suite has no CI environment-smoke marker.

The real login/write/API-key case requires the retained isolated Routine
acceptance database, cache, broker, Core, ClientGateway and APIGateway:

```sh
E2E_RUN_CSRF_BACKEND=true \
E2E_ROUTINE_API_URL=http://127.0.0.1:38081 \
E2E_CSRF_API_KEY_URL=http://127.0.0.1:38082 \
E2E_ROUTINE_DATABASE=notegic_routine_acceptance_20261018 \
npm run test:e2e -- csrf.spec.ts --workers=1
```

Never target the original development DB or a user's browser profile. The live
case retains unique test accounts and objects; it neither migrates nor clears
data. It is development-only because it imports actual client RPC modules.
The metadata-only case also runs against built production SSR. The live case
checks HTTP 400/401 at the Gateway and the restored API error in the browser.
Public exceptions deliberately omit status; Web HTTP adapters must use
`readAPIResponse` from `api/adapters/apiResponse.adapter.ts` to retain the
Response's error status before server-function serialization. Legacy domain
codes remain distinct from HTTP status. Non-JSON, malformed JSON and missing
error envelopes receive a safe error without exposing upstream diagnostics.
Run intentional browser authentication failures last: they must still signal
session expiry. The unit suites cover the full 400–599 range, legacy status
fallbacks, serialization/redaction and query/mutation retry classification.

### Routine statistics session headers

The shared statistics hook builds session headers when each request executes,
not when the chart renders. All eleven statistics queries must use the current
CSRF token on initial load, refetch and imperative fetch; successful token
refresh metadata remains stored through the existing session-storage boundary.
Do not disable backend CSRF checks or suppress authentication failures to keep
Overview open.

Run `npm run test:e2e -- routineCharts.spec.ts --workers=1` for the real chart
components and all eleven query hooks with controlled RPC responses. To include
real login, Overview navigation, token rotation and missing/incorrect-token
rejection for every statistics route, use the retained isolated backend:

```sh
E2E_RUN_VISUALIZE_BACKEND=true \
E2E_ROUTINE_API_URL=http://127.0.0.1:38081 \
E2E_ROUTINE_DATABASE=notegic_routine_acceptance_20261020 \
npm run test:e2e -- routineCharts.spec.ts --workers=1
```

The live case retains unique fixture accounts and uses isolated browser
storage. It does not migrate or clear data. Repeated query rounds run serially
to respect the existing Gateway burst limit. Both browser cases are local-only
and have no CI environment-smoke marker. Hook/header/error-boundary unit tests
also cover response-token renewal and clearing stale request tokens.

With the same isolated endpoints, run the opt-in authenticated page tour:

```sh
E2E_RUN_PAGE_BACKEND=true \
E2E_ROUTINE_API_URL=http://127.0.0.1:38081 \
E2E_ROUTINE_DATABASE=notegic_routine_acceptance_20261020 \
npm run test:e2e -- authenticatedPages.spec.ts --workers=1
```

It retains a unique test account and an inactive Routine with a Start node.
The nine authenticated routes cover Dashboard, Routine overview and Station,
the dependency graph editor, account/preferences settings, Trash and the
empty Material/BlockPack editor entry pages. It checks session retention,
authentication-error events and HTTP/RPC authentication failures; it is not
full material editing, Yjs synchronization, OAuth-provider or destructive
account-operation acceptance. It has no CI environment-smoke marker.

### Server-function response injection

Keep TanStack Start at or above the patched versions in
[GHSA-qx66-fv34-fjm8](https://github.com/advisories/GHSA-qx66-fv34-fjm8).
The lockfile uses React Start 1.168.60 and start-server-core 1.169.39, with
compatible Router packages. The same local CSRF suite injects response-shaped
`result`/`error` fields through the real serialized server-function transport,
both with and without the RPC header. Status and content type must match the
legitimate baseline, with no attacker-supplied header or script reflected.
The ordinary RPC must still succeed with JSON. Run this regression in
development and built Node SSR when upgrading Start; it is not a CI smoke test.
