---
name: architecture-and-data-integrity-check
description: Check frontend changes for correct route/component ownership, API and generated-contract integrity, cache and persistence consistency, async race safety, optimistic-update recovery, and cross-runtime assumptions. Use for architecture reviews or changes touching data flow, storage, realtime, or deployment boundaries.
---

# Architecture and data integrity check

Read the relevant `docs/conventions/01-ui.md`, `04-file-and-folder-naming.md`, `05-helpers-and-abstractions.md`, `06-react-hooks.md`, `08-testing.md`, then the applicable runbook or sibling backend integration document.

Inspect:

- route/page/component ownership and dependency direction;
- query/mutation variables, generated types, cache invalidation, pagination, nullability, and error handling;
- local database/bootstrap/migration ownership, persistence versioning, reset/recovery behavior, and stale-state risks;
- loading, cancellation, retry, duplicate submission, optimistic update, reconnect, and unmount paths;
- WebSocket/Yjs/realtime ordering, reconnect, conflict, and cleanup behavior when relevant;
- build/deployment boundary, environment configuration, and generated artifacts.

Trace success, validation failure, network failure, timeout, duplicate delivery, refresh/reconnect, and partial-update paths. Check callers and tests, not only the edited component.

## Output

Give findings ordered by data-loss, corruption, compatibility, and operational risk, with file locations and concrete evidence. Say “no finding” only after checking the relevant path. This is a review/check skill by default; do not rewrite architecture without an explicit implementation request.
