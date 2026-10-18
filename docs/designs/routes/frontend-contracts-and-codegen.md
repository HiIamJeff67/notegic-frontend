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
helpers remain under `shared/api/graphql/` and must stay portable: they must
not import TanStack Start, browser globals, Cloudflare bindings, Web CSS, or
app-specific storage. Web Apollo and local-search adapters live under
`apps/web/src/api/`.

## Public API documentation snapshot

The documentation generator reads only the checked-in snapshot under
`apps/web/src/pages/document/api-reference/contracts/`. It does not read a
sibling backend checkout or fetch contracts over the network.

After the backend runs `make -C contracts public-api-gen`, use the public
artifacts under `contracts/gateway/public/`. Manually copy its
public `openapi/openapi.json` to `contracts/openapi.json` and these five public
rule files to `contracts/rules/`:

- `authentication.md`
- `http-contract.md`
- `origins-and-security.md`
- `rate-limits-and-retries.md`
- `versioning.md`

Run `npm run generate:public-api` from the frontend repository. Only that
command checks that all six inputs are readable regular files; missing inputs
are listed together and generation stops without changing the previous output.
Application startup, builds, and page rendering do not perform this check.
The generator consumes only these six files and writes
`apps/web/src/pages/document/api-reference/generated/publicAPIData.ts`.
The imported snapshot retains the backend's formatting and is excluded from
Biome. Review and commit the snapshot together with its regenerated output.

Run `node --test scripts/generatePublicApiData.test.mjs` for the isolated
generation and missing-file checks.

The snapshot must declare an HTTPS `Production` server and API-key header
security for every published operation. Generation preserves the previous
module when this publication check fails. All external operations are included;
frontend resource lists do not silently remove unfamiliar OpenAPI tags.
Each operation must provide a stable `operationId`, a BigCamelCase `summary`
public name, and a non-empty brief `description`. Explicit generation maps
these to `operationId`, `operation`, and `description` respectively; no duplicate
endpoint `summary` field is emitted. Invalid metadata reports the method/path
and leaves the previous generated output unchanged. The UI uses the published
name directly and keeps the original ID for search and navigation.
Request examples include authentication and omit optional query values by
default. Schema values are not rewritten for display. Field constraints and
nested array item definitions are retained.

Rules are tokenized with the existing Markdown dependency and rendered as
escaped React content, without raw HTML. Public paragraphs, lists and code
blocks keep source order. A temporary generator policy excludes known internal
notes from the current imported rules; it is not a secret scanner. The backend
must publish reviewed public-only sources before this policy can be removed.
The public pages must not expose local service setup, contributor commands,
private protocols or implementation diagnostics. Temporary handoff reports
are disposable notes, not a canonical source or application dependency.
Website guidance lives within Document; the separate Tutorial route and its
navigation entries are removed without a redirect. Editorial copy currently
stays in English beside its owning section; translating that evolving content
is deferred. Existing shared UI and privacy-policy translations remain unchanged.

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
