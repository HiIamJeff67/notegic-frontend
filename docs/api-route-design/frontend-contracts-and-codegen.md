# Frontend Contracts and Codegen

The backend public contracts are the source of truth. The backend repository
currently keeps those contracts under
`/Users/jeff/Desktop/Projects/notegic-backend/contracts/`, including the public
API gateway, client gateway, realtime gateway, and GraphQL contract areas. The
frontend consumes those contracts and generated artifacts; it does not own
backend resolvers, services, or database implementation.

## Frontend inputs and generated output

The current frontend paths are:

```text
shared/graphql/
  schemas/                 GraphQL schema inputs and enums
  fragments/               reusable fragments
  queries/                 operation documents
shared/api/graphql/generated/  generated client types and operations
```

During Phase 2, public generated API types may be grouped under
`shared/contracts/`; the current paths remain the source-compatible locations
until that migration. GraphQL documents and generated output remain shared
because they describe a client-facing contract rather than a Web-only view.

## Code generation workflow

The root `codegen.ts` currently reads the frontend schema inputs and documents
and writes to `shared/api/graphql/generated/`.

1. Change or synchronize the relevant backend public contract.
2. Update the frontend schema mirror or operation document.
3. Run `npm run codegen`.
4. Review the generated diff and update consumers/conversions when needed.
5. Run the relevant typecheck, tests, and Web verification.
6. Commit generated output together with the input change.

`npm run codegen:watch` is available for local iteration. Generated files are
consumer artifacts and must never be edited by hand. Phase 3 adds CI checks
for drift and reproducible generation.

Generated GraphQL types, operation definitions, conversions, and schema
helpers must remain portable: they must not import TanStack Start, browser
globals, Cloudflare bindings, Web CSS, or app-specific storage.

## Runtime boundary

```text
backend public contracts
          │
          ▼
shared contracts / GraphQL / request semantics / query definitions
          │
          ├── Web: optional TanStack Start serverFn adapter, or direct HTTP
          ├── Desktop: optional serverFn adapter, or direct HTTP
          └── Mobile: direct HTTP client
```

The HTTP contract is the lowest common denominator. Server functions are an
adapter choice for Web and Desktop, not a requirement for all TypeScript
applications and not a mechanism for opening a database on behalf of clients.
