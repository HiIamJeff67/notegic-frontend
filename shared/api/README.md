# Shared API Boundary

`shared/api/` is the transitional home for reusable frontend API code. It
currently contains both portable code and Web-specific adapters; Phase 1
defines the boundary and Phase 2 moves files into the workspace layout.

## Portable responsibilities

| Area | Shared responsibility |
| --- | --- |
| Contracts | Request/response types, endpoint semantics, and validation schemas |
| Requests | HTTP method, URL/payload, headers required by the public contract |
| Queries | Query keys, cache policy, invalidation, and runtime-neutral query configuration |
| Domain | Data mapping and business rules that do not require a platform |
| GraphQL | Documents, generated types, conversions, and client-neutral operation definitions |
| Realtime | Frame/channel contracts and runtime-neutral message mapping |

HTTP request/response is the lowest common boundary for all applications.
Mobile may use direct HTTP. Desktop may use direct HTTP or a server-function
adapter. Web and Desktop may use TanStack Start `serverFn` where their runtime
integration is sound, but shared code must not require TanStack Start.

## Runtime-specific code

| Current area | Ownership during migration |
| --- | --- |
| `functions/*.serverFn.ts` | Current TanStack Start Web server/client adapter; Desktop is optional |
| cookies, headers, CSRF, and request forwarding | Web/server request adapter |
| SQLocal, OPFS, browser database, and local migrations | Current Web local-runtime code until the real shared/runtime split |
| local/session storage | App-specific storage adapter and lifecycle |
| focus and online managers | App lifecycle adapter |
| WebSocket connection lifecycle | App runtime adapter around shared frame/channel contracts |

No server function is a requirement for Mobile, and no server function should
be used as an implicit database connection or database write path for another
client.

## Transitional import rule

Existing import paths remain valid until Phase 2. New portable code should be
placed under the shared boundary and must not import Web-only globals, CSS,
DOM APIs, or platform storage. New adapters should be introduced only when a
real application consumer needs them; do not add speculative runtime
abstractions.
