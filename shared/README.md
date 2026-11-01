# Frontend Shared Code

`shared/` owns reusable TypeScript code and packages for Web, Desktop, and
Mobile. It is a boundary for code with multiple real consumers, public or
generated contracts, or cross-platform invariants. It is not a reason to move
every directory into a package.

Reusable packages live under `lib/`, including `lib/blockpack/`.
Web React charts belong to `apps/web/src/components/charts/`, including their
models, conversions and defaults. Sharing a type between multiple chart kinds
does not give it an owner outside Charts. Independent shared definitions without a dedicated owner use
`types/<name>.type.ts`, whether
they are enums, interfaces, structural types or aliases; there is no separate
root `enums/` directory. Package-owned, component-owned and generated types
retain their owners, even when they have many callers.
Contracts jointly owned by multiple independent domains also belong in
`types/` when they have no narrower common owner. Related definitions may share
a concise concept file; multiple callers within one domain still share that
domain owner.

Shared code may contain API request semantics, generated contract types,
schemas, GraphQL documents and conversions, query/domain logic, translation
resources and language types, portable reducers, shared types/utilities, and
platform-neutral design tokens.

Shared code must not require Web CSS, the DOM, browser storage, native storage,
or TanStack Start for every consumer. Runtime-specific behavior belongs to an
app adapter. There is no initial `shared/assets`; each app owns and packages
its own asset copy.

React translation hooks belong to `apps/web/src/hooks/`. Translation resources
and framework-neutral i18n utilities stay under `i18n/`, with no React adapter
exports or imports from Web hooks. Desktop/mobile runtimes select their own UI
integration instead of inheriting a React requirement.

## GraphQL boundary

The GraphQL source and frontend codegen inputs currently live under
`shared/graphql/`. Generated client output currently lives under
`shared/api/graphql/generated/`. The backend public contracts remain the
source of truth; the frontend consumes them and generates client artifacts.
Generated output is never edited by hand. See
[GraphQL conventions](graphql/README.md) and [frontend contracts and codegen](../docs/designs/routes/frontend-contracts-and-codegen.md)
for the workflow.
