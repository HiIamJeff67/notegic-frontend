# Shared API Boundary

`shared/api/` contains reusable frontend API contracts and runtime-neutral
request/query code. Web-only adapters are under `apps/web/src/api/` so future
Desktop and Mobile consumers can use the shared boundary without importing
TanStack Start, browser storage, SQLocal/OPFS, or React lifecycle code.

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
| `apps/web/src/api/functions/*.serverFn.ts` | TanStack Start Web server/client adapter; Desktop is optional |
| cookies, headers, CSRF, and request forwarding | Web/server request adapter |
| SQLocal, OPFS, browser database, and local migrations | Current Web local-runtime code until the real shared/runtime split |
| local/session storage | App-specific storage adapter and lifecycle |
| focus and online managers | App lifecycle adapter |
| WebSocket connection lifecycle | App runtime adapter around shared frame/channel contracts |

No server function is a requirement for Mobile, and no server function should
be used as an implicit database connection or database write path for another
client.

## Import rule

Portable code belongs under the shared boundary and must not import Web-only
globals, CSS, DOM APIs, or platform storage. Runtime adapters belong under
the owning app and should be introduced only when a real application consumer
needs them; do not add speculative runtime abstractions.
