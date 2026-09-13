---
name: coding-style-and-abstractions
description: Apply this repository's frontend UI, styling, naming, React hook, helper, and abstraction conventions before changing code. Use when implementing, refactoring, reviewing, or deciding whether to introduce a component, hook, helper, wrapper, or dependency.
---

# Coding style and abstractions

Use the repository documentation as the source of truth. Before editing, read only the relevant sections of:

- `docs/conventions/01-ui.md`
- `docs/conventions/02-styles.md`
- `docs/conventions/03-icons-and-images.md`
- `docs/conventions/04-file-and-folder-naming.md`
- `docs/conventions/05-helpers-and-abstractions.md`
- `docs/conventions/06-react-hooks.md`
- `docs/conventions/08-testing.md`

Inspect nearby components, tokens, helpers, hooks, and tests before creating anything new.

## Rules

- Reuse existing shadcn primitives, Tailwind v4 semantic tokens, canonical icons, and established components.
- Prefer concise names in pure algorithm/data-structure and runtime-neutral library code when package context is clear; use complete, non-sentence-like domain names for business workflows and primary components. Treat `...For...` and `...And...` as warning signs: avoid `For` except for established external/protocol vocabulary, and split independent responsibilities instead of naming them with `And`. Use `...With...` only for established options/configuration or similar APIs, and keep it restrained.
- Keep feature logic close to its route/component. Extract only for real reuse, a meaningful concept, a stable boundary, or a test seam.
- Do not add one-use style helpers, generic hooks, pass-through wrappers, speculative abstraction layers, or a dependency for a small local need.
- Follow PascalCase component files, documented kebab-case generic files, role suffixes, route boundaries, and local type/constant placement.
- Keep responsive layouts safe with `min-w-0`; preserve accessibility, keyboard behavior, focus states, and reduced-motion expectations.
- Prefer CSS and existing platform/library primitives before custom JavaScript behavior.

## Check

For every proposed abstraction, identify existing callers, ownership, why local code is insufficient, and why its name is more informative than the inline code. If the name describes obvious mechanics or multiple unrelated actions, inline it or split the responsibilities. Keep the smallest correct diff and run the narrowest relevant formatter/test after editing.
