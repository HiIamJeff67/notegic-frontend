---
name: failure-diagnosis
description: Diagnose frontend test, build, browser, local database, Cloudflare, GraphQL, authentication, realtime, or CI failures from evidence before editing code. Use when behavior is failing, flaky, inconsistent, or unexpectedly different across environments.
---

# Failure diagnosis

Diagnose first; do not patch from the symptom. Preserve existing user changes and keep the first pass read-only.

## Workflow

1. Capture the exact command, browser/runtime, failure, environment, recent diff, network/console output, and first meaningful stack boundary.
2. Read the relevant stable guidance before interpreting the failure:
   - UI/style/component issue: `docs/conventions/01-ui.md`, `02-styles.md`, `03-icons-and-images.md`.
   - helper/hook/structure issue: `04-file-and-folder-naming.md`, `05-helpers-and-abstractions.md`, `06-react-hooks.md`.
   - test issue: `docs/conventions/08-testing.md` and the matching runbook.
   - local DB/build/deploy issue: `docs/runbooks/local-database-diagnosis-2026-09-11.md`, `local-database-recovery.md`, or `cloudflare-workers-builds.md`.
3. Trace the complete path from route/component through query/mutation, generated client types, request boundary, response/error state, cache, and rendered output.
4. Separate code defects from stale generated code, wrong environment variables, local DB state, browser timing, dependency drift, and service availability.
5. Reproduce with the smallest deterministic command. Change one variable at a time.

## Output

Report evidence, likely root cause, ruled-out hypotheses, minimal reproduction, and the smallest safe fix. Include exact file/command locations. Do not expose credentials, cookies, tokens, or credential-bearing browser output.

Do not implement a fix, reset local data, or remove generated/migration files unless the user explicitly asks for that action.
