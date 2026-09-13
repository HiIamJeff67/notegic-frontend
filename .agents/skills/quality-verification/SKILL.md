---
name: quality-verification
description: Verify frontend changes with the repository's formatting, lint, typecheck, unit, integration, E2E, code generation, and production-build checks. Use when reviewing a change, preparing a handoff, or ensuring a UI/API fix is complete.
---

# Quality verification

Start from `git diff` and the affected user path. Read `docs/conventions/08-testing.md`, the relevant UI conventions, and applicable runbooks before choosing checks.

## Verification ladder

Run the cheapest checks that cover the change, escalating only when scope requires it:

1. Run `npm run format:check` and `npm run lint` for formatting/style changes or broad confidence.
2. Run `npm run typecheck` for TypeScript, route, generated-type, or API changes.
3. Run targeted Jest tests or `npm test` for component, hook, utility, and web integration changes.
4. Run `npm run codegen:check` when GraphQL sources, operations, or generated client types change; regenerate from source, never by hand.
5. Run `npm run test:e2e` (or `CI=1 npm run test:e2e` when CI-like behavior matters) for browser, auth, routing, persistence, or cross-boundary behavior.
6. Run `npm run build:web:cloudflare` for deployment/runtime/configuration changes; consult `docs/runbooks/cloudflare-workers-builds.md`.

Inspect `package.json` and workspace scripts before inventing commands. Do not change lockfiles or install packages as part of verification unless explicitly requested.

## Report

Record every command, result, and skipped check with its reason and residual risk. Distinguish local evidence from CI/staging evidence. A passing component test does not prove browser, API contract, local persistence, or Cloudflare runtime behavior.

This skill verifies by default; edit code only when the user also requests implementation. Do not commit or push as part of verification.
