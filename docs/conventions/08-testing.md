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
