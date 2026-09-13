---
name: cross-repo-integration
description: Validate and implement frontend/backend contract changes across the sibling repositories. Use when GraphQL/API, authentication, cookies, error payloads, generated clients, realtime, or end-to-end behavior crosses the repo boundary.
---

# Cross-repository integration

Treat both repositories as one user-visible system. Locate the sibling checkout at `../notegic-backend` when needed; if it is unavailable, report that limitation instead of guessing.

## Workflow

- Read the backend integration documents when relevant: `../notegic-backend/docs/integrations/client-api-gateway-split.md`, `frontend-contract-migration.md`, and `public-api-documentation.md`.
- Inspect the frontend caller, generated types, query/mutation, request headers/cookies, cache/update behavior, loading/error states, and tests.
- Inspect the backend route/schema, DTO, exception/status behavior, auth or realtime boundary, generated artifacts, and compatibility assumptions.
- Compare names, nullability, optionality, pagination, enum values, status/error payloads, auth requirements, and versioning—not just successful response shapes.
- Follow each repository's conventions and regenerate artifacts from source. Never hand-edit generated output.
- Prefer a backward-compatible transition when both checkouts are changing; identify deployment order and compatibility window.

## Verification

Run targeted frontend and backend tests plus the narrowest contract/codegen checks. For browser, persistence, or realtime changes include the documented E2E/integration path. Report both repositories' diffs, commands, results, compatibility assumptions, and any required coordinated release.

Do not commit or push either repository unless the user explicitly asks for delivery.
