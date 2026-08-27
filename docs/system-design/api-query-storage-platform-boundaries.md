# API, Query, Storage, and Platform Boundaries

Phase 1 establishes a portable shared core with application-owned runtime
adapters. The lowest common API boundary is an HTTP request/response contract.
TanStack Start server functions are optional for Web and Desktop where the
integration is sound; Mobile may use direct requests and has no server-function
requirement.

## Boundary map

```text
shared/
  contracts, request schemas, GraphQL, query/cache definitions,
  realtime frames/channels, mappings, portable domain rules
        │
        ├── apps/web       browser lifecycle, serverFn adapter, Web storage,
        │                  local database, WebSocket lifecycle, Web UI/styles
        ├── apps/desktop   app lifecycle, optional serverFn/direct HTTP,
        │                  desktop persistence, desktop UI/assets
        └── apps/mobile    app lifecycle, direct HTTP, mobile persistence,
                           mobile UI/assets
```

## Shared responsibilities

Shared modules may own endpoint and payload contracts, schemas, generated
types, query keys and cache policy, GraphQL operations and conversions,
realtime frame/channel definitions, data mapping, and domain logic that does
not need a runtime. Shared modules must not import app code, DOM APIs, Web
CSS, browser/native storage, or a mandatory TanStack Start runtime.

TanStack Query configuration can be shared when it remains runtime-neutral.
Focus/online managers, persistence, hydration, and app lifecycle integration
are supplied by each application.

## Current Web responsibilities

The current Web implementation owns the following runtime responsibilities
under `apps/web/src/api/` and `apps/web/src/`:

- TanStack Start server functions, cookies, headers, CSRF, and request forwarding.
- `localStorage`, `sessionStorage`, `document`, and browser lifecycle behavior.
- SQLocal/OPFS, SQLite WASM, local migrations, recovery, and synchronization.
- WebSocket connection lifecycle and browser reconnect behavior.
- CSS, Tailwind, BlockNote/editor styles, browser metadata, and Web assets.

These are not a prescription for the future Desktop or Mobile runtime. They
are the explicit current Web ownership boundary.

## Future application responsibilities

Each app owns its framework/runtime integration, request and authentication
adapters, lifecycle and focus/online state, persistence, assets, and styles.
Desktop may optionally use a server-function adapter; Mobile may use direct
HTTP. No app should depend on a server function to open a database connection
or write database state for another runtime.

## i18n and reducers

`shared/i18n/language.ts` owns supported-language types and checks.
`shared/i18n/index.ts` owns shared resources and pure helpers. Each app owns
stored-language synchronization and supplies its own storage/lifecycle adapter.
Portable reducers can move to `shared/reducers/`; reducers that depend on an
editor-specific type remain behind an explicit editor boundary until that
dependency is intentionally shared.

## Migration rule

Phase 2 has created the `apps/web` and shared workspace boundaries. New code
should follow the target boundary now; Desktop and Mobile directories remain
planned and are intentionally not created by NOT-90.
