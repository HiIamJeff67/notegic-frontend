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
