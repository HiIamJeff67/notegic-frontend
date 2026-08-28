# Frontend Architecture and Ownership

This document describes the current Web application and the approved target architecture for the frontend monorepo. The Web workspace migration in NOT-90 is implemented; Desktop and Mobile remain planned boundaries without app implementations.

## Current repository

The repository currently contains one implemented Web workspace and the shared
portable code used by future applications:

```text
apps/web/
  src/              routes, pages, providers, UI, Web API/runtime adapters
  assets/           Web-owned images and icons
  public/           browser metadata and immutable public files
  vite.config.ts    Web build, TanStack Start, and Nitro configuration
shared/
  api/              portable API/query contracts and generated client artifacts
  graphql/          GraphQL schemas, documents, and codegen inputs
  i18n/             translation resources, language types, and pure helpers
  reducers/         portable metadata reducers
  blockpack/        reusable block-pack logic
  charts/           reusable chart logic
  constants/        shared constants
  enums/            shared enums
  lib/              shared libraries
  types/            shared types
  util/             shared utilities
```

`apps/web/src/api/` owns the current Web runtime adapters: TanStack Start
server functions, React hooks/invokers, browser local persistence, Apollo
client setup, WebSocket lifecycle, and browser request headers/cookies.
`shared/api/` keeps the portable request, query, contract, GraphQL, and
runtime-neutral WebSocket pieces.

## Target monorepo

The approved target structure is:

```text
apps/
  web/              Web routes, UI, browser adapters, and Web deployment entrypoint
  desktop/          Desktop application shell and platform adapters
  mobile/           Mobile application shell and platform adapters
shared/
  api/              portable request, query, GraphQL, realtime, and domain boundaries
  contracts/        public/generated API contract types
  graphql/          GraphQL documents and codegen inputs
  i18n/             translation resources, language types, and pure helpers
  reducers/         portable state reducers and actions
  packages/         reusable TypeScript packages with real multi-app consumers
  types/            shared types
  lib/              shared libraries
  util/             shared utilities
  design-tokens/    platform-neutral design values
```

This is a Turborepo workspace boundary, not a requirement to create a package
for every directory. Code belongs in `shared/` when it has multiple real
consumers, represents a public/generated contract, or encodes an invariant that
must be identical across applications. App-specific code remains in the owning
app.

## Ownership

| Area | Owns | Must not own |
| --- | --- | --- |
| `apps/web` | Web routes, pages, providers, Web UI, browser storage, Web assets, CSS, and Web server adapters | Portable API contracts and cross-platform domain rules |
| `apps/desktop` | Desktop app shell and desktop adapters | Assumptions that every consumer has the desktop runtime |
| `apps/mobile` | Mobile app shell and mobile adapters | Assumptions that every consumer has a mobile runtime |
| `shared/api` | Request semantics, endpoint payloads, query configuration, cache policy, GraphQL, realtime contracts, and portable domain logic | Required browser APIs, DOM, Web CSS, or a mandatory TanStack Start runtime |
| `shared/contracts` | Public API types and generated contract artifacts | Backend implementation or database access |
| `shared/graphql` | GraphQL schema/document inputs and frontend codegen configuration | Server resolvers and hand-edited generated output |
| `shared/i18n` | Translation resources, language types, and pure translation helpers | `localStorage`, `window`, `document`, or app lifecycle side effects |
| `shared/reducers` | Portable state transitions, actions, and reducer tests | Browser/native lifecycle and platform persistence |
| `shared/design-tokens` | Platform-neutral values such as color, spacing, and typography tokens | CSS files or native component styling setup |
| App asset directories | Asset imports and packaging for the owning application | A shared asset import contract in the initial migration |
| App style directories | CSS, Tailwind, BlockNote/editor styles, and native styling setup | Platform-specific styling assumptions in shared logic |

## Internationalization and state

`shared/i18n/language.ts` owns `supportedLanguages`, `SupportedLanguage`, and `isSupportedLanguage`. `shared/i18n/index.ts` owns shared translation resources and pure i18n setup that does not require a platform global. Each app owns its `syncStoredLanguage` flow and supplies its own persistence/lifecycle integration. The shared i18n core must not read or write browser or native storage.

Reducers may move to `shared/reducers/` when their state and actions are platform-neutral. Reducers that depend on editor-specific types remain behind an explicit editor boundary until those types are intentionally made shared.

## Assets and styles

There is no `shared/assets` directory. The current Web assets are owned by
`apps/web/assets/`; Desktop and Mobile will keep their own copies and
packaging rules. Web favicon, manifest, and browser metadata remain
Web-owned.

The current global CSS, Tailwind configuration, and BlockNote/editor styles remain Web-owned. Platform-neutral design values may be extracted into `shared/design-tokens/`, but shared business logic must not import Web CSS or assume a specific styling framework.

## API, query, and server boundaries

The lowest common API boundary is an HTTP request/response contract:

```text
shared/api/              request contracts, payloads, queries, mappings, domain rules
        │
        ├── apps/web/src/api/     TanStack Start and browser runtime adapters
        ├── apps/desktop/server/  optional server-function adapter where integration is sound
        └── apps/mobile/client/   direct HTTP client and mobile runtime adapters
```

Web and Desktop may use TanStack Start `serverFn` where their runtime integration is appropriate. Mobile is not required to support `serverFn`; direct requests are valid. No application should use a server function as an implicit database connection or write path for another client. Authentication, headers, cookies, CSRF, retries, storage, focus, online state, and lifecycle belong to runtime adapters. TanStack Query configuration can be shared when it remains runtime-neutral; focus/online managers and persistence are supplied by each app.

## Dependency direction

```text
apps/*  →  shared/*  →  external libraries and backend contracts
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
the [Cloudflare Workers deployment runbook](../runbooks/cloudflare-workers-builds.md).

The detailed contract, codegen, API, query, storage, and deployment decisions are documented in:

- [Frontend contracts and codegen](../api-route-design/frontend-contracts-and-codegen.md)
- [API, query, storage, and platform boundaries](../system-design/api-query-storage-platform-boundaries.md)
