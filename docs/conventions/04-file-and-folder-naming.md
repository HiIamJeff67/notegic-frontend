# Frontend File and Folder Naming

The frontend does not use the backend's `snake_case.go` convention. Naming is
owned by the TypeScript or framework layer in which a file lives. The rules
below reflect the current repository and are the default for new files.

## General rules

- Use `PascalCase` for React components, pages, providers, and component-owned
  companion files.
- Use `smallCamelCase` for project-owned TypeScript/JavaScript modules,
  libraries, utilities and scripts. Colocated tests retain their source's exact
  basename and capitalization; standalone integration tests use smallCamelCase.
- Keep kebab-case where a separate convention owns it: Markdown documents,
  stylesheets, shadcn UI primitives, and conventional infrastructure folders.
- Use the existing dotted role suffix for API, type, enum, schema, reducer,
  hook, and test files.
- Use the framework's required syntax for route files; route files are an
  intentional exception to ordinary TypeScript naming.
- Keep acronyms consistent with the surrounding directory. Existing names such
  as `ApiKeysTab` and `LRUCache` are preserved; do not rename unrelated legacy
  files during a feature change.

## Naming economy and compound names

- Prefer the shortest name that remains unambiguous in its owning module and
  call site. Pure algorithms, data structures, and runtime-neutral libraries
  may use compact Unix-like names when the package boundary supplies context;
  business workflows, public API modules, services, and primary components
  must state the complete domain meaning, but must not become sentence-like.
- Do not use `...For...` merely to append context, ownership, or a consumer to
  a name. Prefer the actual concept (`cropImage`, `pendingCropImage`, or
  another domain term) or keep the operation inline. `...For...` is reserved
  for established external vocabulary, protocol names, or proper nouns.
- Treat `...And...` as a design warning. Two independent actions should be
  separate functions coordinated by the caller. Keep `And` only when the
  operations are inseparable, have one coherent responsibility, and should
  succeed or fail together as one named operation.
- `...With...` is acceptable for established options, configuration, variants,
  or fluent APIs, but use it sparingly. Do not turn unrelated behavior into a
  configurable helper with flags or options merely to share a name.
- If a helper name is long because it describes obvious mechanics, or reading
  the name makes the code look clearer when expanded at the call site, keep the
  logic local or split genuinely separate responsibilities before naming them.

## Source file rules

| Area | New file pattern | Examples from the repository |
| --- | --- | --- |
| React components | `BigCamelCase.tsx` | `BlockPackEditor.tsx`, `NotificationDialog.tsx` |
| Component folders | `BigCamelCase/` | `BlockPackEditor/`, `StationRoutineDialog/` |
| UI primitives | `some-thing.tsx` | `button.tsx`, `dropdown-menu.tsx` |
| Pages | `BigCamelCasePage.tsx` | `DashboardPage.tsx`, `PrivacyPolicyPage.tsx` |
| Page folders | `some-thing/` | `material-viewer/`, `privacy-policy/` |
| Providers | `BigCamelCaseProvider.tsx` or `BigCamelCaseProvider/` | `ThemeProvider.tsx`, `TransactionSynchronizerProvider/` |
| Generic libraries/utilities | `someThing.ts` | `searchPage.ts`, `string/compare.ts`, `math/clamp.ts` |
| API modules | `domain.role.ts` | `blockPack.hook.ts`, `userInfo.invoker.ts` |
| GraphQL query hooks | `useSearchSomething.ts` | `useSearchRoutineRecords.ts` |
| UI hooks | `useSomething.ts` | `useDebounce.ts`, `useRealtime.ts` |
| Types/interfaces | `domain.type.ts` or `domain.interface.ts` | `byte.type.ts`, `material.interface.ts` |
| General shared types, including enums | `domain.type.ts` in `shared/types/` | `range.type.ts` |
| Constants | `domain.constant.ts` | `url.constant.ts`, `defaultThemes.constant.ts` |
| Reducers | `domain.reducer.ts` | `blockPackMeta.reducer.ts` |
| GraphQL documents | `some_thing.graphql` | `block_pack_fragment.graphql` |
| Stylesheets | `some-thing.css` | `globals.css`, `panel.css` |
| Unit tests beside their source | `<source basename>.test.ts(x)` | `ScreenProvider.test.ts`, `routine.search.test.ts` |
| Integration tests in the integration directory | `name.test.ts(x)` | `userProvider.test.ts` |
| Browser E2E tests | `name.spec.ts` | `articleNavigation.spec.ts` |
| Performance tests | `name.performance.test.ts` | `shelfNode.performance.test.ts` |

Keep established API role suffixes where they describe the module, such as
`routine.hook.ts` and `searchLocal.adapter.ts`. Do not invent a suffix or rename
`useSearchSomething.ts` merely to make every hook filename alike. Shared API
infrastructure uses smallCamelCase, such as `apolloClient.ts`,
`clientHeaders.ts`, `websocketClient.ts`, `queryClient.ts`, and `queryKeys.ts`.

TanStack Start reserves `*.client.*` and `*.server.*` for import protection.
Do not use `.client.ts` merely to label an API client: a factory imported by
the SSR router must remain usable on the server. Keep framework-reserved
suffixes only for actual environment restrictions, never disable protection
to satisfy an ordinary filename convention.

Do not infer a repository-wide rename from a style correction. Preserve
established hook and class/component names, including `LRUCache.ts`, unless
their rename is explicitly requested. A scoped filename change includes
imports, tests, dynamic source paths and documentation references, without
compatibility re-exports. Preserve separately governed documentation, folders,
framework routes, language tags, generated output and migration filenames.

## Manipulator module names

For new modules and explicitly scoped naming migrations, use the concrete
domain name rather than a redundant `Manipulator` suffix. The current owners
are:

| Responsibility | Module and exported class |
| --- | --- |
| Local storage | `shared/lib/storage/localStorage.ts` — `LocalStorage` |
| Session storage | `shared/lib/storage/sessionStorage.ts` — `SessionStorage` |
| IndexedDB | `shared/lib/storage/indexedDB.ts` — `IndexedDB` |
| Root-shelf operations | `shared/lib/shelf/rootShelf.ts` — `RootShelf` |
| Sub-shelf operations | `shared/lib/shelf/subShelf.ts` — `SubShelf` |

Rename matching test files in the same scope, such as
`indexedDBManipulator.test.ts` to `indexedDB.test.ts`. Update imports, dynamic
module paths, mocks, source guards and current documentation together. Do not
leave compatibility re-exports that preserve the obsolete module path.

This rule applies only to the actual `Manipulator` naming being migrated. Keep
meaningful `Provider`, `Page`, `Tab`, `Store` and other role suffixes. Moving a
provider-owned type never requires removing `Provider` from its component or
file. Do not replace native `window.localStorage`, `sessionStorage` or
`indexedDB` identifiers when updating project symbols, change stored key bytes,
or redesign a class API merely to rename its file. Scope exported-symbol
renames explicitly rather than applying a repository-wide text substitution.

Keep other existing filenames until a naming migration is requested. An audit
or documentation-only update does not authorize additional renames.

## Library folders and models

Shared conversion operations live in `shared/lib/conversions/`; entity
comparators and their owned input types live in `shared/lib/comparisons/`.
Keep their tests beside the implementation, without splitting a comparator's
private input shape into a general shared type file.
BlockPack import/export file types live directly in
`shared/lib/blockpack/conversions.ts` with the conversion operations. A current Web-only caller does not make a
portable package's file-format contract a Web UI type.

Reusable editor and chart packages live under `shared/lib/blockpack/` and
`shared/lib/charts/`. Independent shared type definitions without a dedicated
owner have one root home:
`shared/types/`. Use `<name>.type.ts` there for enums, interfaces, structural
types and aliases alike; do not recreate a root `shared/enums/` directory.
Keep intrinsic validation, constructors and conversions beside their type.
This root-directory rule does not relocate owner-specific or generated API
types from their existing package boundaries. When multiple independent owners
jointly define and use a contract without a narrower common owner, put it in
`shared/types/`. Multiple callers within one domain do not create multiple
owners. For example, Web drag-and-drop types
and their intrinsic operations live in
`apps/web/src/components/commons/DNDable/dnd.type.ts`, not `shared/types/`.
Shelf analysis status belongs with the summary it describes in
`shared/lib/shelf/summary.type.ts`. Prefer concise concept names such as
`summary.type.ts` and `dnd.type.ts` over repeating the folder or the word
`Type`. Cohesive types and their intrinsic operations may share that file;
reuse an existing concept file before adding one, without merging unrelated
models or creating placeholders for hypothetical types.

BlockNote block specifications live in `shared/lib/blockpack/specs/`, such as
`codeBlock.spec.tsx`. Use `.spec.tsx` for every block specification, including
specs that currently contain no JSX. Here the suffix identifies a production block specification;
Jest excludes this directory, and its behavior is verified through editor tests.

Group `shared/lib/` by the responsibility that owns the implementation. Keep
the implementation, its tests and its intrinsic types/operations together;
import the owner directly instead of keeping a compatibility file at the old
root path. Use an existing group before adding another folder.

```text
shared/lib/
  queue/deque.ts
  queue/deque.test.ts
  url/getURL.ts
  storage/localStorage.ts
  storage/sessionStorage.ts
  storage/indexedDB.ts
  storage/indexedDB.test.ts
  storage/materialAttachmentCache.type.ts
  shelf/rootShelf.ts
  shelf/subShelf.ts
  shelf/itemNodes.type.ts
  shelf/shelfNodes.type.ts
  shelf/summary.type.ts
  auth/redirectState.type.ts
  auth/tokenGenerator.ts
  byte/byte.type.ts
  uuid/uuidv4.type.ts
```

Other existing groups are `browser`, `cache`, `code`, `list`, `search`, `set`,
`text` and `toast`. Preserve meaningful module/class names such as `LRUCache`,
`LocalYjsDocumentStore` and `CSRFTokenGenerator`; grouping is not permission to
remove their role suffixes. Do not recreate the removed OAuth storage helper:
the login, registration, binding and callback components own those operations.

Complete API object models and their schemas live under
`shared/api/interfaces/types/`, including `user.type.ts` and
`userQuota.type.ts`. This is part of the API contract owner, distinct from
`interfaces/enums/` and from the general-purpose `shared/types/` directory.
Keep their validation and pure operations together when moving them.

The Shelf node/summary types remain separate files beside the tree operations.
Station/Routine UI node models and their factories belong in
`apps/web/src/providers/StationRoutineProvider/`; screen types and breakpoint
conversion belong to `ScreenProvider.tsx`. Provider filenames retain their
`Provider` suffix. Do not make shared libraries depend on these Web models.

Storage key catalogs live with their storage modules. Yjs persisted document
types live with `shared/lib/blockpack/localYjsDocumentStore.ts`; attachment payload
types live in `storage/materialAttachmentCache.type.ts`. The storage catalog
uses type-only imports for these payloads, without importing a Web Provider.
Retain `shared/types/cord.ts` and `range.type.ts` as general concepts, and keep
`imageInfo.type.ts` and `theme.type.ts` in place until their dependency boundaries
are explicitly migrated.

## Local types and constants

- If a type, interface, enum, or constant is used by one component, hook, page,
  or feature module, keep it in that module's file or nearest feature folder.
- Do not create a new `types/`, `constants/`, or similarly generic folder for a
  single consumer.
- Export reusable component, library, utility and provider types from their
  owner even when they have multiple real consumers. Use `shared/types/` only
  when there is no narrower owner or a deliberately shared domain contract
  requires that boundary. See
  [Types and constants stay with their owner](05-helpers-and-abstractions.md#types-and-constants-stay-with-their-owner).
- Keep local definitions close to the code that owns their behavior. A type or
  constant's category does not by itself justify a new file.
- A `.type.ts` file can also own the type's validation, construction, defaults
  and pure conversions/formatting. Do not move these operations away merely
  because they execute at runtime; follow the ownership boundary in the
  [type conventions](05-helpers-and-abstractions.md#types-and-constants-stay-with-their-owner).
- Existing shared type and constant folders are retained for their current
  consumers; this rule does not require a broad relocation during unrelated
  changes.

## Folder rules

### `apps/web/src/components/`

Use lowercase category folders such as `commons/`, `dialogs/`, `menus/`,
`panels/`, and `widgets/`. A component or feature group under those categories
uses a PascalCase folder and normally keeps its main component beside its
PascalCase companion files:

```text
apps/web/src/components/dialogs/NotificationDialog/NotificationDialog.tsx
apps/web/src/components/dialogs/NotificationDialog/NotificationDialogContent.tsx
```

The `apps/web/src/components/ui/` directory is a shadcn-style primitive collection and
uses kebab-case files. Do not make a new primitive there PascalCase merely to
match feature components.

### `apps/web/src/api/`

Group cross-feature API modules by responsibility and retain the
`domain.role.ts` filename pattern:

- `adapters/`: transport serialization and local search adaptation, such as
  `exceptionSerialization.adapter.ts` and `searchLocal.adapter.ts`.
- `policies/`: Apollo cache policies, such as `searchPagination.policy.ts`.
- `bridges/`: coordination between API/runtime boundaries, such as
  `cookie.bridge.ts` and `searchLocal.bridge.ts`.

Keep unit tests beside their owner as `domain.role.test.ts`. Import the
owning module directly; do not leave compatibility re-export files at the API
root. Storage-specific policies remain under `api/local/`; these categories
do not override narrower ownership or server/client runtime boundaries.

### `apps/web/src/pages/`

Use lowercase kebab-case for route-oriented folders, such as
`block-pack-editor/`, `material-viewer/`, and `privacy-policy/`. Use
PascalCase for page modules and add a role suffix such as `Page`, `Layout`, or
`Tab` when the module has that role.

### `apps/web/src/routes/`

TanStack Router owns the route-file grammar. Use dot-delimited route segments,
underscores for pathless segments, `$` for parameters, and `.index` for index
routes:

```text
app.dashboard.tsx
app.dashboard.index.tsx
app.block-pack-editor.$blockPackId.tsx
_auth.login.tsx
```

Do not apply the component or generic-library naming rule to route filenames.

### `shared/`

Use lowercase category folders such as `api/`, `graphql/`, `constants/`,
`enums/`, `lib/`, `types/`, and `util/`. Keep domain and role information in
the filename when the folder contains multiple responsibilities. GraphQL
fragments, queries, and schema files retain snake_case because that is the
existing GraphQL convention and is shared with the backend schema vocabulary.

## Naming boundaries

Public Document tabs live under `apps/web/src/pages/document/<tab>/`, with
`DocumentPage.tsx` at the page root. Each tab keeps these roles directly inside
its folder:

- `<Tab>.tsx`: the owning tab component.
- `<Tab>Content.tsx`: generated JSX inserted into the tab, when needed.
- `generated.ts`: generated data, types and navigation metadata, when needed.
- Necessary PascalCase subcomponents, such as `EndpointTable.tsx`.
- `sources/`: all Markdown/JSON generation inputs, whether authored here or
  copied from upstream. Keep source files flat; do not add nested reference,
  rule, content or generated folders.

API keys belong to the `api` tab, not a separate tab or `api-reference` folder.
Keep tests in the existing integration/E2E test directories so these tab
folders contain only the approved roles. README files belong only inside
`sources/`, not at the page or tab root. Obtain explicit user agreement before
introducing another file role or folder level in this page.

Copied backend inputs use `@` on the filename, such as
`api/sources/@openapi.json` and `api/sources/@authentication.md`; first-party
Markdown keeps its ordinary filename. Preserve upstream bytes and record
provenance in the source README. Review the complete source snapshot with
generated output. Page content sources do not belong in a parallel folder in
the contributor handbook. Never reference an external checkout directly from
application imports, generation or build inputs.
Relative paths between `apps/web` and `shared` remain valid because both are
inside the same frontend repository. Check local import targets and configured
aliases with
`npm run test:unit -- apps/web/test/integration/importBoundaries.test.ts`.
Use `apps/web/test/integration/documentStructure.test.ts` to verify the approved
Document tab structure.

For a scoped filename cleanup, run the local filename guard with
`npm run test:unit -- apps/web/test/integration/fileNaming.test.ts`, then
typecheck and exercise affected dynamic imports in browser E2E. API clients
shared with the router also need SSR/build verification: a TypeScript-valid
rename can still introduce a framework-reserved environment restriction.
Keep these checks local; a cleanup does not require adding hosted CI jobs.

- Do not use backend Go naming rules for TypeScript files.
- Do not use PascalCase for generic utility or API files just because a domain
  type is exported from the file.
- Do not use a generic name such as `data.ts`, `helpers.ts`, or `common.ts`
  when a domain or responsibility can be named precisely.
- Do not create a new top-level folder when the responsibility belongs to an
  existing category.
- Do not rename existing files solely to make the repository uniform; document
  and track a rename as a separate migration when import churn is justified.
