# Frontend File and Folder Naming

The frontend does not use the backend's `snake_case.go` convention. Naming is
owned by the TypeScript or framework layer in which a file lives. The rules
below reflect the current repository and are the default for new files.

## General rules

- Use `PascalCase` for React components, pages, providers, and component-owned
  companion files.
- Use lowercase kebab-case for generic libraries, utilities, scripts, CSS
  files, documentation files, and conventional infrastructure folders.
- Use the existing dotted role suffix for API, type, enum, schema, reducer,
  hook, and test files.
- Use the framework's required syntax for route files; route files are an
  intentional exception to ordinary TypeScript naming.
- Keep acronyms consistent with the surrounding directory. Existing names such
  as `ApiKeysTab` and `LRUCache` are preserved; do not rename unrelated legacy
  files during a feature change.

## Source file rules

| Area | New file pattern | Examples from the repository |
| --- | --- | --- |
| React components | `BigCamelCase.tsx` | `BlockPackEditor.tsx`, `NotificationDialog.tsx` |
| Component folders | `BigCamelCase/` | `BlockPackEditor/`, `StationRoutineDialog/` |
| UI primitives | `some-thing.tsx` | `button.tsx`, `dropdown-menu.tsx` |
| Pages | `BigCamelCasePage.tsx` | `DashboardPage.tsx`, `PrivacyPolicyPage.tsx` |
| Page folders | `some-thing/` | `material-viewer/`, `privacy-policy/` |
| Providers | `BigCamelCaseProvider.tsx` or `BigCamelCaseProvider/` | `ThemeProvider.tsx`, `TransactionSynchronizerProvider/` |
| Generic libraries/utilities | `some-thing.ts` | New files under `shared/lib/` and `shared/util/` |
| API modules | `domain.role.ts` | `blockPack.hook.ts`, `userInfo.invoker.ts` |
| Types/interfaces | `domain.type.ts` or `domain.interface.ts` | `byte.type.ts`, `material.interface.ts` |
| Enums | `domain.enum.ts` | `routineStatus.enum.ts` |
| Constants | `domain.constant.ts` | `url.constant.ts`, `defaultThemes.constant.ts` |
| Reducers | `domain.reducer.ts` | `blockPackMeta.reducer.ts` |
| GraphQL documents | `some_thing.graphql` | `block_pack_fragment.graphql` |
| Stylesheets | `some-thing.css` | `globals.css`, `panel.css` |
| Unit/performance tests | `name.unit.test.ts` or `name.performance.test.ts` | `i18n.unit.test.ts` |

Generic library and utility files should use kebab-case going forward. Some
older files under `shared/lib/` and `shared/util/` use PascalCase or camelCase;
those are compatibility-preserving legacy names, not a reason for a broad
rename.

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

- Do not use backend Go naming rules for TypeScript files.
- Do not use PascalCase for generic utility or API files just because a domain
  type is exported from the file.
- Do not use a generic name such as `data.ts`, `helpers.ts`, or `common.ts`
  when a domain or responsibility can be named precisely.
- Do not create a new top-level folder when the responsibility belongs to an
  existing category.
- Do not rename existing files solely to make the repository uniform; document
  and track a rename as a separate migration when import churn is justified.
