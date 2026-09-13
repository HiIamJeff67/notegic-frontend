---
name: local-test
description: Run the frontend's cheapest reliable pre-commit tests locally, using package scripts and repository runbooks instead of expensive CI. Use before submitting changes or when browser behavior, local persistence, generated code, API integration, or Cloudflare build parity must be verified.
---

# Local test

Use local evidence before CI. Do not claim that local tests replace CI; choose the smallest set that covers the changed path.

## Read first

- `docs/conventions/08-testing.md`
- relevant UI/helper/hook conventions
- `docs/runbooks/cloudflare-workers-builds.md`
- `docs/runbooks/local-database-diagnosis-2026-09-11.md` and `local-database-recovery.md` when local persistence is involved
- `package.json`, workspace package scripts, and any root `Makefile`
- the matching sibling backend integration document when API/realtime behavior is involved

## Workflow

1. Inspect `git diff` and map changed files to unit, web integration, browser E2E, codegen, local persistence, or production-build coverage.
2. Start with the cheapest applicable checks: `npm run format:check`, `npm run lint`, `npm run typecheck`, and targeted `npm test`/Jest tests.
3. For GraphQL sources, operations, or generated client types run `npm run codegen:check`; regenerate from source, never by hand.
4. For browser, auth, routing, persistence, or cross-boundary behavior run targeted `npm run test:e2e` (use `CI=1 npm run test:e2e` when CI-like behavior matters). Keep tests independent of live credentials.
5. For deployment/runtime/configuration changes run `npm run build:web:cloudflare` and follow the Cloudflare build runbook.
6. If a `make test-local` or other Makefile entry point exists, inspect it and use it as the repository-defined aggregate; never invent a target.

Do not change lockfiles, install packages, delete local databases, or reset migrations as part of a normal test run unless explicitly requested. Preserve local user data and report any cleanup.

## Report

List every command, pass/fail/skip result, environment assumptions, cleanup performed, and residual risk. A skipped browser/build/API check must include why and what remains unproven. This skill does not commit or push.
