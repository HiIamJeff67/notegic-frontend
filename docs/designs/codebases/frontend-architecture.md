# Frontend Architecture and Ownership

This document describes the current Web application and the frontend monorepo. The Web workspace migration is implemented. `apps/desktop` is a Tauri 2 shell. It composes `packages/` and its own screens. It does not import `apps/web`. The current `@/` alias to `apps/web/src` violates that rule; [NOT-153](https://linear.app/notegic/issue/NOT-153/initialize-the-tauri-desktop-shell) removes it. Mobile remains a planned boundary without an implementation.

Which code may move into `packages/`, and which call sites stay inside one app, is decided in [Shared application boundaries](../systems/shared-application-boundaries.md).

## Current repository

The repository currently contains the Web workspace, a Tauri 2 desktop shell,
and the shared portable code used by future applications:

```text
apps/web/
  src/              routes, pages, providers, UI, Web API/runtime adapters
  assets/           Web-owned images and icons
  public/           browser metadata and immutable public files
  vite.config.ts    Web build, TanStack Start, and Nitro configuration
apps/desktop/       Tauri 2 shell. Its window uses `packages/` and desktop-owned screens, not `apps/web`.
packages/
  api/              contracts, GraphQL inputs, generated client, codegen
  hooks/            DOM hooks and providers
  i18n/             translation resources and language checks
  lib/              libraries, shared types, and reducers
  ui/               components, shadcn primitives, and theme CSS
```

`apps/web/src/api/` owns the current Web runtime adapters: TanStack Start
server functions, React hooks/invokers, browser local persistence, Apollo
client setup, WebSocket lifecycle, and browser request headers/cookies.
`packages/api/` keeps the portable request, query, contract, GraphQL, and
runtime-neutral WebSocket pieces. Its current tree and the not-yet-created
`local/` schema live in [packages/api/README.md](../../../packages/api/README.md).

## Target monorepo

The approved target structure is:

```text
apps/
  web/              Web routes, UI, browser adapters, and Web deployment entrypoint
  desktop/          Desktop application shell and platform adapters
  mobile/           Mobile application shell and platform adapters
packages/
  api/              portable request, query, GraphQL, realtime, and domain boundaries
  hooks/            DOM hooks and providers
  i18n/             resources and framework-neutral language checks
  lib/              libraries, shared types, and reducers
  ui/               components, shadcn primitives, and theme CSS
```

This is a Turborepo workspace boundary, not a requirement to create a package
for every directory. Code belongs in `packages/` when it has multiple real
consumers, represents a public/generated contract, or encodes an invariant that
must be identical across applications. App-specific code remains in the owning
app.

## Ownership

| Area | Owns | Must not own |
| --- | --- | --- |
| `apps/web` | Web routes, pages, providers, Web UI, browser storage, Web assets, CSS, and Web server adapters | Portable API contracts and cross-platform domain rules |
| `apps/desktop` | Desktop app shell and desktop adapters | Assumptions that every consumer has the desktop runtime |
| `apps/mobile` | Mobile app shell and mobile adapters | Assumptions that every consumer has a mobile runtime |
| `packages/api` | Request semantics, endpoint payloads, query configuration, cache policy, GraphQL, realtime contracts, and portable domain logic | Required browser APIs, DOM, Web CSS, or a mandatory TanStack Start runtime |
| `packages/api` contracts | Public API types and generated contract artifacts | Backend implementation or database access |
| `packages/api/graphql` | GraphQL schema/document inputs and frontend codegen configuration | Server resolvers and hand-edited generated output |
| `packages/i18n` | Translation resources, language types, pure helpers, and the explicit React translation adapter | `localStorage`, `window`, `document`, or app initialization/persistence side effects |
| `packages/lib/reducers` | Portable state transitions, actions, and reducer tests | Browser/native lifecycle and platform persistence |
| Theme CSS in `packages/ui/styles` | Colors, spacing, and typography used by both DOM apps | App-specific screen CSS |
| App asset directories | Asset imports and packaging for the owning application | A shared asset import contract in the initial migration |
| App style directories | CSS, Tailwind, BlockNote/editor styles, and native styling setup | Platform-specific styling assumptions in shared logic |

## Internationalization and state

`packages/i18n/language.ts` owns `supportedLanguages`, `SupportedLanguage`, and `isSupportedLanguage`. `packages/i18n/index.ts` owns shared translation resources and pure i18n setup that does not require a platform global. Each app owns its `syncStoredLanguage` flow and supplies its own persistence/lifecycle integration. The shared i18n core must not read or write browser or native storage.

React consumers use `packages/hooks/useTranslation.ts`, an explicit adapter around
the vendor hook with current-language translators for retained async callbacks.
It does not initialize an instance or import the Web i18n singleton, and is not re-exported
from the resource index. See [Translation entry points](../../conventions/10-translations.md)
for imports, presentation examples, dependencies, and verification.

Reducers may move to `packages/lib/reducers/` when their state and actions are platform-neutral. Reducers that depend on editor-specific types remain behind an explicit editor boundary until those types are intentionally made shared.

## Assets and styles

There is no shared asset directory. The current Web assets are owned by
`apps/web/assets/`; Desktop and Mobile will keep their own copies and
packaging rules. Web favicon, manifest, and browser metadata remain
Web-owned.

Theme and editor CSS that both DOM apps load live in `packages/ui/styles/`. Screen CSS stays with the owning app. Shared business logic must not import Web CSS or assume a specific styling framework.

## Not found

TanStack Router does not publish a separate not-found URL. Web's root route
sets `notFoundComponent` to `RootNotFoundPage`, and `apps/web/src/routes/$.tsx`
throws `notFound()` for every unmatched path. Desktop registers the same page
on `/$`. The reusable path is `not-found`, under the app base path when one is
set (`/not-found`, or `/development/v1/not-found` in local Web). `WebURLPathDictionary.notFound`
is that path. Do not add a second not-found page for a missing API origin or
realtime URL.

## API, query, and server boundaries

The lowest common API boundary is an HTTP request/response contract:

```text
packages/api/                         contracts, payloads, queries, mappings, domain rules
packages/api/local/                   shared sqlite-core schema and ordered migrations
        │
        ├── apps/web/src/api/functions/      TanStack Start server functions
        ├── apps/desktop/src/api/functions/  desktop API callers
        └── apps/mobile/src/api/functions/   mobile API callers, when that app exists
```

Only Web uses TanStack Start server functions. Desktop and Mobile keep their own `api/functions/` implementations and do not import Web's. No application should use a server function as an implicit database connection or write path for another client. Authentication, headers, cookies, CSRF, retries, storage, focus, online state, and lifecycle belong to runtime adapters. TanStack Query configuration can be shared when it remains runtime-neutral; focus/online managers and persistence are supplied by each app. The local schema version cap is in [Shared application boundaries](../systems/shared-application-boundaries.md).

## Dependency direction

```text
apps/*  →  packages/*  →  external libraries and backend contracts
```

Shared code must not import from `apps/*`, Web-only globals, DOM APIs, or platform-specific storage. Backend repositories remain the source of truth for public API contracts. The frontend consumes those contracts and generates its client artifacts; it does not reproduce backend implementation.

## Deployment boundary

The applications remain in one GitHub repository. Turborepo runs the root
`build:web` and `build:web:cloudflare` commands against `apps/web` while retaining the shared
workspace, root manifests, lockfile, and code generation inputs in the build
context. The Cloudflare command uses Nitro's `cloudflare_module` preset and
generates `apps/web/.output/server/wrangler.json`; deploy with
`npm run deploy:web:cloudflare`. Cloudflare Workers/Workers Builds is the
default for the current SSR/server-capable application. Cloudflare Pages
remains a static-output option only when SSR/server functions are not required.
The repository CI gates and Workers Builds monorepo settings are documented in
the [Cloudflare Workers deployment runbook](../../runbooks/cloudflare-workers-builds.md).

The detailed contract, codegen, API, query, storage, and deployment decisions are documented in:

- [Frontend contracts and codegen](../routes/frontend-contracts-and-codegen.md)
- [API, query, storage, and platform boundaries](../systems/api-query-storage-platform-boundaries.md)
