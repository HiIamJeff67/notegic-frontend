# Test location conventions

- Put a unit test beside the source file it verifies. Use `*.test.ts` or
  `*.test.tsx`.
- Put Web-only integration tests in `apps/web/test/integration/`.
- Put integration tests that span shared packages or future applications in
  `test/integration/` at the repository root.
- Put Web browser E2E suites in `apps/web/test/e2e/`; run them with
  `npm run test:e2e`. Keep them independent of live user credentials.

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
Playwright defaults to two workers to leave CPU capacity for Vite and
SQLite/WASM startup. Use `--workers` explicitly for concurrency experiments.
The two-tab startup, reload and row-retention scenario has a 60-second total
test budget; individual database worker connections retain their 15-second
deadline and startup-error assertions.

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
`npm run test:unit -- shared/blockpack/blockPackYjsCoordinator.test.ts shared/blockpack/localYjsDocumentStore.test.ts`
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
`npm run test:unit -- apps/web/src/api/clientHeaders.test.ts apps/web/src/api/policies/searchPagination.policy.unit.test.ts`.
No schemas or generated sources changed for the Apollo fix; code generation
and deployment builds were not rerun. Original development record counts and
the retained manual development server were checked separately after E2E.

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
