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

## Web user-settings synchronization

`UserSettingsProvider` loads cached settings before one remote read per mounted
user/connectivity lifecycle. Preference callbacks have stable identities;
hydration and same-value events never write settings back. A local edit makes
an outstanding snapshot obsolete. Cleanup aborts the read and ignores late
results; the server-function adapter forwards the request's abort signal to
the gateway. Language hydration tracks pending changes so asynchronous
`languageChanged` events are not mistaken for user edits.

Settings mutations explicitly disable automatic retries. Both gateway and web
adapters use the domain-neutral `apps/web/src/api/retry.ts` entry point
`getRetryAt(retryAfter, now?)` to calculate the retry deadline. Other API domains
can reuse this calculation; cooldown state and scheduling remain caller-owned.
Both gateway and web
HTTP 429 responses pause settings GET and PUT in the current browser runtime
for at least 60 seconds, or longer when `Retry-After` specifies a later time
(delta-seconds or HTTP date). The cooldown survives provider remounts, but is
not persisted across page reloads or shared between tabs. It is not global
server state and cannot pause another SSR user's requests. No timer replays
failed reads or writes when the cooldown expires. Local preferences remain
available; a failed/cooldown-blocked save must not be interpreted as a remote
save or queued for replay.

The shared query retry policy also rejects explicit non-retryable API errors,
HTTP 4xx errors and aborts. Its bounded retry/backoff for other failures remains
unchanged; unrelated endpoints do not share the settings cooldown.

Regression checks: `npm run test:unit`. The settings lifecycle integration
suite bundles the real React providers with mocked network/storage boundaries
and runs in headless Chromium, including StrictMode. Install its browser once
with `npx playwright install chromium --only-shell`; no live account is used.

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

The Web app's local SQLite schema has two migration artifacts: immutable
incremental migrations generated by Drizzle and a generated full-schema
bootstrap export for fresh databases. Existing databases advance by the
SQLite `user_version` flag. Every migration updates its schema and version flag
atomically in one transaction and verifies the written flag before commit;
incomplete or mismatched migrations must leave the previous version intact. A
cross-tab browser lock serializes startup migration work.
