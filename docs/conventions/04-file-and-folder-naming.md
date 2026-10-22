# Frontend File and Folder Naming

The frontend does not use the backend's `snake_case.go` convention. Naming is
owned by the TypeScript or framework layer in which a file lives. The rules
below reflect the current repository and are the default for new files.

## General rules

- Use `PascalCase` for React components, pages, providers, and component-owned
  companion files.
- Use `smallCamelCase` for project-owned TypeScript/JavaScript modules,
  libraries, utilities, scripts, and their test basenames.
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
| Generic libraries/utilities | `someThing.ts` | `searchPage.ts`, `compareText.ts` |
| API modules | `domain.role.ts` | `blockPack.hook.ts`, `userInfo.invoker.ts` |
| GraphQL query hooks | `useSearchSomething.ts` | `useSearchRoutineRecords.ts` |
| UI hooks | `useSomething.ts` | `useDebounce.ts`, `useRealtime.ts`; shadcn's `use-toast.ts` retains its convention |
| Types/interfaces | `domain.type.ts` or `domain.interface.ts` | `byte.type.ts`, `material.interface.ts` |
| Enums | `domain.enum.ts` | `routineStatus.enum.ts` |
| Constants | `domain.constant.ts` | `url.constant.ts`, `defaultThemes.constant.ts` |
| Reducers | `domain.reducer.ts` | `blockPackMeta.reducer.ts` |
| GraphQL documents | `some_thing.graphql` | `block_pack_fragment.graphql` |
| Stylesheets | `some-thing.css` | `globals.css`, `panel.css` |
| Unit/performance tests | `name.unit.test.ts` or `name.performance.test.ts` | `i18n.unit.test.ts` |

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

## Local types and constants

- If a type, interface, enum, or constant is used by one component, hook, page,
  or feature module, keep it in that module's file or nearest feature folder.
- Do not create a new `types/`, `constants/`, or similarly generic folder for a
  single consumer.
- Promote a definition into `shared/types/`, `shared/constants/`, or another
  shared module only when it has multiple real consumers, is a public contract,
  or defines a cross-feature invariant.
- Keep local definitions close to the code that owns their behavior. A type or
  constant's category does not by itself justify a new file.
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

Keep unit tests beside their owner as `domain.role.unit.test.ts`. Import the
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
