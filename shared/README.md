# Frontend Shared Code

`shared/` owns reusable TypeScript code and packages for Web, Desktop, and
Mobile. It is a boundary for code with multiple real consumers, public or
generated contracts, or cross-platform invariants. It is not a reason to move
every directory into a package.

Shared code may contain API request semantics, generated contract types,
schemas, GraphQL documents and conversions, query/domain logic, translation
resources and language types, portable reducers, shared types/utilities, and
platform-neutral design tokens.

Shared code must not require Web CSS, the DOM, browser storage, native storage,
or TanStack Start for every consumer. Runtime-specific behavior belongs to an
app adapter. There is no initial `shared/assets`; each app owns and packages
its own asset copy.

## GraphQL boundary

The GraphQL source and frontend codegen inputs currently live under
`shared/graphql/`. Generated client output currently lives under
`shared/api/graphql/generated/`. The backend public contracts remain the
source of truth; the frontend consumes them and generates client artifacts.
Generated output is never edited by hand. See
[GraphQL conventions](graphql/README.md) and [frontend contracts and codegen](../docs/api-route-design/frontend-contracts-and-codegen.md)
for the workflow.
