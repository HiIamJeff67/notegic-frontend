# Helpers and Abstraction Boundaries

Frontend code should stay direct and close to the feature that owns it. A
helper function is useful when it gives a repeated or complex concept a clear
name; it is harmful when it only hides a few obvious lines or anticipates a
future consumer.

## Default rule

- Do not create a helper, hook, wrapper, utility module, interface, adapter, or
  dependency for a single anticipated future use.
- Do not create a new file only to hold a helper used by one component, hook,
  page, or feature module. Keep it local unless the file boundary itself is a
  real ownership or testing boundary.
- Keep simple one-use logic inline when the surrounding function remains easy
  to read.
- Extract a helper only when at least one of these conditions is true:
  - two or more functions or components reuse the same named concept;
  - the inline logic would hide the primary workflow;
  - the logic has an independent domain meaning and deserves an isolated test;
  - the helper is a real boundary for an external API, browser capability, or
    application lifecycle concern.
- Prefer a concrete function with a real caller over a speculative interface or
  generic abstraction.

## Keep one-use operations inline

The following should normally remain in the calling function when they happen
once and are easy to understand in context:

- a single response or API-result mapping;
- one-off validation or normalization;
- a temporary object used for one handoff;
- a short event payload transformation;
- a wrapper variable whose name does not add domain meaning;
- a one-time formatting or display decision owned by one component.

Do not extract a function merely because a block has more than one line. The
question is whether the extracted name communicates a reusable concept or
whether it only replaces readable code with a jump to another file.

## Name the concept, not the mechanics

When extraction is justified, name the helper after the domain or UI concept it
owns:

```text
resolve-visible-shelf-items.ts
build-routine-task-payload.ts
is-editable-material.ts
```

Avoid vague names and catch-all modules such as:

```text
helpers.ts
common.ts
misc.ts
process-data.ts
handle-everything.ts
```

The helper name should make its input, output, and responsibility apparent
without opening the implementation.

### Naming economy and compound names

- Prefer the shortest name that is unambiguous in its owning feature and call
  site. Pure algorithms, data structures, and runtime-neutral libraries may
  use compact names when package context supplies meaning; business workflows,
  public API modules, services, and primary components need complete domain
  names, but not sentence-like names.
- Do not use `...For...` merely to append context or a consumer. Prefer the
  actual concept (`cropImage` or `pendingCropImage`) or keep the operation
  inline. Reserve `...For...` for established external vocabulary, protocol
  names, or proper nouns. Names such as `imageForCrop` and
  `clearImageForCrop` are warning signs: check whether a clearer concept name,
  an inline operation, or a separate lifecycle operation is appropriate.
- Treat `...And...` as a design warning. If the two actions are independent,
  split them and let the caller coordinate their order. Keep `And` only when
  the actions are inseparable, strongly related, and should be treated as one
  operation with one success/failure boundary.
- `...With...` is acceptable for established options, configuration, variants,
  or fluent APIs, but use it sparingly. Do not add flags or options to a helper
  just to make unrelated behaviors share one implementation.
- If the helper name itself tells a reviewer that the code is obvious and
  should be expanded, do not extract it. A name is not a reason to hide a
  readable block.

## Placement and ownership

Use the narrowest ownership boundary that satisfies the real callers:

1. Keep a helper inside the component or file when only that owner uses it.
2. Keep it in the nearest feature folder when multiple modules in one feature
   use it.
3. Move it to a category-level module only when multiple neighboring features
   use the same concept.
4. Use `shared/lib/` only for genuinely cross-feature, runtime-neutral logic.
5. Use `shared/util/` for application-facing utilities only when their broader
   ownership is explicit and justified.

Do not move feature business rules into `shared/lib/` or `shared/util/` just to
make a file appear reusable. Existing modules that do not yet match this
boundary are preserved unless a scoped migration explicitly owns the change.

## Reuse before creating

Before writing a helper:

- search the nearest feature and its adjacent modules for an existing concept;
- check `shared/lib/`, `shared/util/`, and the relevant API modules;
- prefer the existing implementation when its behavior and ownership match;
- extend an existing utility with the smallest domain-neutral capability when
  the need is truly shared;
- keep a domain-specific variation local instead of adding flags or options to
  a generic helper.

Do not create a second formatter, storage wrapper, query wrapper, or validation
helper when an existing frontend boundary already owns that behavior.

## Types and constants stay with their owner

- Keep one-consumer types, interfaces, enums, and constants in the owning file
  or nearest feature folder.
- Do not split a local definition into `types/`, `constants/`, `models/`, or a
  helper file merely because its category has a familiar name.
- Move a definition to `shared/types/` or `shared/constants/` only when it has
  multiple real consumers, is generated/public contract data, or expresses a
  cross-feature invariant.
- A type or constant should move with an explicit ownership reason, not as a
  speculative preparation for future reuse.

## Layer boundaries

Each function should work at one layer:

- components render and coordinate interaction;
- pages compose screens and page-level state;
- hooks coordinate React lifecycle or query behavior;
- API modules handle client-facing transport and data access;
- storage modules handle persistence concerns;
- pure libraries and utilities transform values without reaching into React,
  route state, or unrelated application services.

Do not hide a layer change inside a convenience helper. A component helper must
not silently perform API calls, a formatter must not mutate storage, and a
shared utility must not import a feature component to avoid passing an explicit
value.

## Review checklist

Before adding or approving a helper, ask:

- Does it have a real caller today?
- Is the concept used more than once, or does inline code genuinely obscure the
  main workflow?
- Is the name more informative than the code it replaces?
- Does the name avoid an unnecessary `For` or `And`, and use `With` only for an
  established option/configuration concept?
- Does the name match the responsibility count, or is it hiding two actions
  that should be coordinated by the caller?
- Does it belong to the narrowest reasonable feature or module?
- Did we check for an existing implementation first?
- Would a local function or inline expression be clearer?
- Does it introduce flags, generics, or dependencies only to support a possible
  future use?

If the answers do not justify the boundary, keep the code direct.
