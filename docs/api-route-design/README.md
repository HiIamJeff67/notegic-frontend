# Frontend API and Route Design

This directory documents how the frontend reaches backend public interfaces.
It does not duplicate backend route definitions or server implementation.

## Current client entry points

| Frontend area | Responsibility |
| --- | --- |
| `apps/web/src/api/fetches/` | Web HTTP-facing fetch/query helpers for feature data |
| `apps/web/src/api/functions/` | TanStack Start Web server/client adapter boundaries |
| `apps/web/src/api/invokers/` | Web feature-level invocation wrappers |
| `apps/web/src/api/hooks/` | Web React Query and feature hooks |
| `shared/api/graphql/` | GraphQL documents, generated types, conversions, and client-neutral operations |
| `apps/web/src/api/graphql/` | Web Apollo client, React GraphQL hooks, and local adapters |
| `shared/api/websocket/` | WebSocket frame/type definitions |
| `apps/web/src/api/websocket-client.ts` | WebSocket connection lifecycle |
| `shared/api/interfaces/` | Current frontend request and domain interfaces |

Keep portable contracts, requests, queries, and domain logic under `shared/`
independent from the Web runtime adapters under `apps/web/src/api/`.

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
