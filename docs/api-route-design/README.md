# Frontend API and Route Design

This directory documents how the frontend reaches backend public interfaces.
It does not duplicate backend route definitions or server implementation.

## Current client entry points

| Frontend area | Responsibility |
| --- | --- |
| `shared/api/fetches/` | HTTP-facing fetch helpers for feature data |
| `shared/api/functions/` | Current TanStack Start Web server/client adapter boundaries; transitional until Phase 2 |
| `shared/api/invokers/` | Feature-level invocation wrappers |
| `shared/api/hooks/` | React query and feature hooks |
| `shared/api/graphql/` | Apollo client, generated GraphQL types, hooks, and local adapters |
| `shared/api/websocket/` | WebSocket client and frame/type definitions |
| `shared/api/interfaces/` | Current frontend request and domain interfaces |

These paths are transitional. Keep portable contracts, requests, queries, and
domain logic independent from Web runtime adapters while the workspace
migration is being developed.

## Boundary and codegen decisions

| Document | Scope |
| --- | --- |
| [Frontend contracts and codegen](frontend-contracts-and-codegen.md) | Backend contract ownership, GraphQL inputs, generated output, and codegen workflow |
| [API, query, storage, and platform boundaries](../system-design/api-query-storage-platform-boundaries.md) | Shared responsibilities and app/runtime adapters |

## Contract rule

Public REST, GraphQL, and WebSocket semantics are backend-owned contracts. The
frontend may generate TypeScript clients or types from those contracts, but it
must not treat generated output as a replacement for the backend source of
truth.

When changing client-facing behavior:

1. Identify the backend contract or endpoint affected.
2. Update the frontend consumer and its generated artifacts when required.
3. Link the corresponding backend design or contract issue.
4. Verify Web behavior and document any runtime assumptions that affect the
   current Web application.
