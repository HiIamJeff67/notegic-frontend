# Web Frontend Architecture and Ownership

## Current repository shape

The current repository is a Web application with reusable TypeScript modules
already grouped under `src/` and `shared/`:

```text
src/
  components/       # Web React components and UI primitives
  pages/            # Page-level composition and feature screens
  routes/           # TanStack Router file-based route definitions
  providers/        # React context and application lifecycle providers
  hooks/            # Web React hooks
  reducers/         # Web state reducers
  global/           # Global CSS and styling entrypoints
  assets/           # Web-owned static and branded assets

shared/
  api/              # API, query, local data, realtime, and client boundaries
  graphql/          # GraphQL documents shared by frontend tooling
  blockpack/        # Block-pack collaboration/editor primitives
  charts/           # Reusable chart components and types
  constants/        # Application constants
  enums/            # Cross-module enums
  lib/              # Reusable implementation helpers
  types/            # Reusable type definitions
  util/             # Reusable utility functions
```

This is a description of the current Web codebase. Existing `shared/api`
contains both request-facing code and Web runtime concerns such as local
database integration; keep that ownership explicit while the local database
work is being developed.

## Ownership rules

| Area | Owns | Must not own |
| --- | --- | --- |
| `src/components/` | Web React presentation and interaction | Backend requests or database policy as hidden component behavior |
| `src/pages/` | Page composition, screen-level loading, and feature layout | Reusable transport or storage implementations |
| `src/routes/` | Route registration, route parameters, and route-level loaders | Domain workflows unrelated to navigation |
| `src/providers/` | React lifecycle, context, and app-wide Web state | A second API client or platform abstraction |
| `shared/api/` | Current frontend API, query, local data, and realtime modules | Backend implementation or microservice source |
| `shared/graphql/` | GraphQL documents and frontend schema inputs | Server resolver implementation |
| `shared/lib/`, `shared/types/`, `shared/util/` | Reusable frontend TypeScript capabilities | Web UI or business workflows owned by one feature |

## Colocation rule

Definitions belong with the code that owns their behavior. A type, interface,
enum, constant, or helper used by only one component, hook, page, or feature
module should remain in that file or the nearest feature folder. Do not create
or expand `types/`, `constants/`, `helpers/`, or `utils/` boundaries for a
single consumer.

Promote a definition into `shared/types/`, `shared/constants/`, `shared/lib/`,
or `shared/util/` only when it has multiple real consumers, is a public or
generated contract, or expresses a cross-feature invariant. Existing shared
directories are preserved for current consumers; this rule is for new code and
scoped migrations.

## Dependency direction

```text
routes -> pages -> components
  |        |         |
  +------ providers/hooks/state ------+
                         |
                 client/API boundaries
                         |
              backend public contracts
```

Presentation code should consume hooks or explicit client boundaries rather
than reaching into transport details. API and storage modules should not import
page components. Shared code must remain genuinely reusable and must not depend
on a future platform merely because that platform may exist later.

## Backend boundary

The Web frontend consumes backend public REST, GraphQL, WebSocket, and generated
contract surfaces. It does not import backend services, repositories, database
models, Docker configuration, or business logic. If a public contract changes,
the frontend documentation and generated-client workflow should reference the
corresponding backend contract change rather than copying backend internals
into this repository.
