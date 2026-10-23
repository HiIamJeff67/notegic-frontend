---
name: coding-style-and-abstractions
description: Apply this repository's frontend UI, styling, icon reuse, naming, React hook, helper, and abstraction conventions before changing code. Use when implementing, refactoring, reviewing, or deciding whether to introduce a component, hook, helper, wrapper, or dependency.
---

# Coding style and abstractions

Use the repository documentation as the source of truth. Before editing, read only the relevant sections of:

- `docs/conventions/01-ui.md`
- `docs/conventions/02-styles.md`
- `docs/conventions/03-icons-and-images.md`
- [Icon map](../../../docs/conventions/icon-map.md) — required whenever selecting, using, reusing, adding, replacing, or removing an icon.
- `docs/conventions/04-file-and-folder-naming.md`
- `docs/conventions/05-helpers-and-abstractions.md`
- `docs/conventions/06-react-hooks.md`
- `docs/conventions/08-testing.md`

Inspect nearby components, tokens, helpers, hooks, and tests before creating anything new.

Before creating or reshaping a component, inspect adjacent files in its parent
directory for the closest responsibility and usage pattern. Treat those
neighbors as repository conventions alongside these rules; reuse their naming,
composition, prop/type shape, hook usage, and test structure unless the
documented architecture requires a deliberate deviation.

## Rules

- Reuse existing shadcn primitives, Tailwind v4 semantic tokens, canonical icons, and established components.
- Before adding or duplicating a UI, helper, hook, provider, API/storage boundary or interaction, follow [Reuse before creating](../../../docs/conventions/05-helpers-and-abstractions.md#reuse-before-creating) and [Reuse the owning interaction](../../../docs/conventions/01-ui.md#reuse-the-owning-interaction): inspect the existing owner, callers and tests, then reuse it or make a minimal justified extension. A separate entry point is not a reason to fork behavior or create a pass-through wrapper.
- Before implementing loading feedback, follow [Loading feedback](../../../docs/conventions/01-ui.md#loading-feedback). Evaluate the existing LoadingCover/LoadingProvider flow (historically StrictLoadingCover) for heavy blocking work; do not invent a feature-specific loading UI when it fits. Preserve mounted state, cover readiness through the required stages, release on error/unmount, avoid stacked covers, and do not block routine editing or background work.
- Before any icon use or change, read the relevant entries in the [Icon map](../../../docs/conventions/icon-map.md) and inspect their source references; do not choose from memory or assume a familiar Lucide name is the established choice. Reuse the mapped glyph for the same meaning and import workspace entities through `WorkspaceEntityIcons.ts`. Only when no suitable entry exists, select an installed Lucide glyph first and register its meaning, exact export, source/first consumer, and scope in the map in the same change. Update the map for replacements/removals too; do not duplicate its catalog in this skill or introduce an icon registry/wrapper just to centralize names.
- Trace existing entry points before changing an interaction. The same action must share one owning UI component; pass entry-specific context or completion callbacks instead of copying its markup or state flow.
- Prefer concise names in pure algorithm/data-structure and runtime-neutral library code when package context is clear; use complete, non-sentence-like domain names for business workflows and primary components. Treat `...For...` and `...And...` as warning signs: avoid `For` except for established external/protocol vocabulary, and split independent responsibilities instead of naming them with `And`. Use `...With...` only for established options/configuration or similar APIs, and keep it restrained.
- Keep feature logic close to its route/component. Extract only for real reuse, a meaningful concept, a stable boundary, or a test seam.
- Follow [Operation verbs](../../../docs/conventions/05-helpers-and-abstractions.md#operation-verbs): inspect comparable operations and reuse their vocabulary. Prefer existing `get`, `create`, `update`, `delete` and genuine `upsert` operations; an ordinary object/payload is created, not built, and a plain update is not saved. Keep `save`, `build`, parsing, rendering and execution verbs only when their actual semantics justify them. Preserve API stems, external APIs and event-handler conventions; do not mechanically rename contracts or files.
- Follow [Specific transformation names](../../../docs/conventions/05-helpers-and-abstractions.md#specific-transformation-names): avoid catch-all `normalize*` names; inline unnecessary one-use transformations and name retained helpers after their concrete responsibility. Preserve validation and compatibility behavior; do not mechanically rename standard algorithms or external APIs.
- Do not add one-use style helpers, generic hooks, pass-through wrappers, speculative abstraction layers, or a dependency for a small local need.
- Follow PascalCase component files and smallCamelCase project-owned module/test basenames, preserving established role suffixes, hook names, route boundaries, and local type/constant placement. Keep imports before declarations; keep identity and ownership fields first, lifecycle fields near the end of persisted data, and computed/UI-only fields in their own trailing group. Do not reorder applied migration SQL or generated metadata for declaration style.
- Check filenames against [File and folder naming](../../../docs/conventions/04-file-and-folder-naming.md#source-file-rules): retain `useSearchSomething.ts` and `useSomething.ts`; use `apolloClient.ts` and `clientHeaders.ts` rather than inventing role suffixes. Keep kebab-case where separately required, including Markdown, stylesheets and shadcn primitives. TanStack reserves `*.client.*`/`*.server.*` for environment restrictions. Do not infer broad hook or folder renames from a naming correction. A scoped rename includes imports, dynamic paths, tests and docs, without compatibility re-exports; framework, language-tag, generated and migration names remain untouched.
- Follow [Feature-local status labels](../../../docs/conventions/10-translations.md#feature-local-status-labels): inline direct literal translation calls for short local branches; do not add translation-key helper functions, key-building wrappers or one-use lookup maps.
- Keep responsive layouts safe with `min-w-0`; preserve accessibility, keyboard behavior, focus states, and reduced-motion expectations.
- Prefer CSS and existing platform/library primitives before custom JavaScript behavior.

## Check

For every proposed abstraction, identify existing callers, ownership, why local code is insufficient, and why its name is more informative than the inline code. If the name describes obvious mechanics or multiple unrelated actions, inline it or split the responsibilities. Keep the smallest correct diff and run the narrowest relevant formatter/test after editing.

For icon changes, run `npm run test:unit -- apps/web/test/integration/iconConventions.test.ts` to check semantic choices, entity aliases, inventory drift, map links, and obsolete custom components. This source/contract check does not replace browser checks when the interaction also changes.

For filename cleanup, follow [Naming boundaries](../../../docs/conventions/04-file-and-folder-naming.md#naming-boundaries): run the local filename guard, typecheck and affected browser/SSR checks, including dynamic import and test-fixture paths. Do not add hosted CI jobs solely for the cleanup.
