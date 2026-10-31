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

## Web CSRF transport

`apps/web/src/api/clientHeaders.ts` owns the browser's shared CSRF state.
Authentication cookies remain HttpOnly. The CSRF value is separate, readable
request metadata stored in a host-only `SameSite=Strict; Path=/` cookie:
`__Host-notegic-csrf` with `Secure` over HTTPS, and `notegic_csrf` for HTTP local
development. It expires after seven days, matching the current session window.
Never put access or refresh credentials in this cookie or browser storage.

The cookie, not a tab's sessionStorage, is authoritative. A legacy current-tab
token is migrated only when no shared cookie exists. Logout writes an empty
shared marker, so an older tab cannot restore its previous token. Existing
sessions need an original tab containing its legacy token to perform that
migration, or a fresh login; a new tab cannot recover a token that no open tab
has published. Cookie access restrictions fail closed, not by bypassing CSRF.

The global TanStack Start function middleware supplies the current token in
the RPC's `X-CSRF-Token` header at send time. Protected upstream requests use
that header before the explicit SSR payload fallback. Custom RPC fetchers,
including settings cooldown handling, must delegate to the same session
bridge. Direct multipart uploads and Apollo read the same current state.
External signed object URLs never receive this header.

`readAPIResponse` retains validated renewal metadata before returning or
throwing a business error, including HTTP 204 and settings 429 paths. Server
functions forward renewal in a response header with `Cache-Control: no-store`;
the browser bridge applies it before deserialization. A late response cannot
replace a token changed since its request began. HTTP 401/403 and server
failures cannot rotate this state. Hooks must not replay cached renewal
metadata; only login/register seed a newly authenticated session, and logout
or account deletion clears it. Preserve same-origin RPC checks and backend
token validation; never manufacture a request header from an auth cookie.

Regression coverage includes `clientHeaders.test.ts`, `session.bridge.test.ts`,
`apiResponse.adapter.test.ts`, and the `csrfTransport.test.ts` source guard.
`sessionTabs.spec.ts` additionally requires explicitly isolated local Core and
Gateway processes and an acceptance database. It exercises empty-tab storage,
real access refresh, and two-page graph conflict/draft recovery without using
production credentials or changing a user's development account.

## BlockPack realtime recovery

WebSocket and recoverable channel failures are background work. Retain the
mounted editor and its Y.Doc; do not reset the document, change its identity,
show a recovery toast/animation, or navigate away. Once a channel has subscribed,
temporary ticketing/subscribing/idle states keep its editor ready for local
edits. The existing Yjs cache is in IndexedDB, separately from SQLite metadata;
normal cache failures remain visible errors rather than a durability guarantee.

`BlockPackYjsCoordinator` publishes only its own awareness client ID. Remote
awareness expiry is local cleanup and is never sent as another user's removal.
Each reattachment advances the local awareness clock before its announcement.
The backend retains ownership until the previous connection detaches; presence
may be temporarily absent while document editing continues.

Worker unavailability, channel backpressure, and explicit
`resubscribe_required`/`resync_required` frames with `recoverable: true` use the
existing channel retry lifecycle. Keep pending updates and replay them after
fresh ticket validation. Root reconnects continue at capped exponential delays;
stopping, logout and authentication failure still cancel recovery. Stale
socket, ticket and channel responses cannot revive a replaced attachment.

Missing or invalid recovery metadata is conservative. Permission revocation,
quota rejection and rejected document validation retain their existing separate
handling; do not repeatedly replay rejected content or clear its saved draft.
Backend telemetry remains available for diagnosis while ordinary browser
reconnects remain quiet. Deploy this frontend before the matching gateway/worker
recovery metadata; neither database needs a new up/down step for this change.

Regression coverage is in `blockPackYjsCoordinator.test.ts`,
`error.frame.test.ts` and the browser `realtimeClient.spec.ts` suite. It covers
remote awareness expiry, clock advancement after removal, delayed socket close,
retained editor identity, offline cache writes and automatic resubscription.

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

## Routine graph editing

Graph dragging updates the canvas immediately and coalesces repeated positions
per node behind a 750 ms debounce. The editor serializes the existing node
update requests, keeps newer positions while an older request is in flight,
and flushes remaining writes when the editor unmounts. Background refreshes
must not clear nodes, remount React Flow, or reset its viewport. Local graph
drafts are retained; network-failed writes use the existing durable queue and
show pending synchronization rather than a successful remote save. A draft
indicator before acknowledgement is not a server persistence guarantee.

Nodes share one context-menu and Inspector entry point, without visible
ellipsis buttons. Left-clicking only selects a node; right-clicking or the
context-menu keyboard shortcut opens its menu. Dragging and connection
handles must not open it. Only the menu's Edit action opens the Inspector.
Start uses a circular shape with its title outside,
green/gray activation styling, and an Active menu checkbox.
Its Inspector edits title and description, not Action-only execution fields.
Actions keep their title, operation summary and execution status.

Dependencies are created only by dragging connection handles; the add menu
contains nodes, not a separate dependency action. Left-clicking an edge opens
Edit/Delete options. Edit opens the existing dependency Inspector; Delete
uses the same version-checked mutation and offline draft path as keyboard
edge deletion, without deleting either endpoint.

Execution-progress edge/card coloring is deferred. It must follow captured
execution identities and status events, not infer execution from current live
graph edits or manually entered dependency progress. This UI pass adds no
schema, SQLite migration or general-purpose node upsert endpoint.

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
React consumers use the explicit `shared/i18n/useTranslation.ts` adapter; it
does not initialize i18next or access storage. See
[Translation entry points](../../conventions/10-translations.md).
Portable reducers can move to `shared/reducers/`; reducers that depend on an
editor-specific type remain behind an explicit editor boundary until that
dependency is intentionally shared.

## Migration rule

The workspace migration created the `apps/web` and shared boundaries. New code
should follow the target boundary now; Desktop and Mobile directories remain
planned and are intentionally not created before those applications exist.

The Web app's local SQLite schema has two migration artifacts: immutable
incremental migrations generated by Drizzle and a generated full-schema
bootstrap export for fresh databases. Existing databases advance by the
SQLite `user_version` flag. Every migration updates its schema and version flag
atomically in one transaction and verifies the written flag before commit;
incomplete or mismatched migrations must leave the previous version intact. A
cross-tab browser lock serializes startup migration work.
