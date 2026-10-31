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
resolveVisibleShelfItems.ts
createRoutineTaskPayload.ts
isEditableMaterial.ts
```

Avoid vague names and catch-all modules such as:

```text
helpers.ts
common.ts
misc.ts
processData.ts
handleEverything.ts
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

### Operation verbs

Choose the verb from the actual operation and the established vocabulary of
its owning module and callers. Inspect comparable operations first; do not
introduce a new synonym to make a name appear more sophisticated. Match the
existing API operation stem across functions, hooks, contracts and consumers.

| Operation | Naming rule |
| --- | --- |
| Read an existing value or resource | Keep the established `get...`/`Get...`; retain `search...` for search and the existing transport-specific fetch vocabulary where it has a distinct role. |
| Create a value, resource, payload, options or result | Prefer `create...` (`Create...` for an established API operation), not `build...`. Creation need not persist anything. |
| Modify an existing resource | Use `update...`/`Update...`; do not call a plain update `save...`. |
| Remove a resource | Use `delete...`/`Delete...`; preserve more specific existing operations such as `restore...` where their behavior differs. |
| Insert or update depending on existence | Use `upsert...` when both paths are supported; use the storage boundary's established `set...` for key/value assignment. |
| Save a document, draft or checkpoint as a distinct workflow | `save...` is appropriate when it describes that workflow rather than hiding a plain update. Additional synchronization, export, deployment or execution must remain explicit; use `deploy...` or `execute...` when that is the primary action. Extra incidental side effects alone do not justify a new CRUD synonym. |
| Compile or build an actual artifact | Reserve `build...` for a genuine build operation or an externally required builder API, not an object literal, filter map, array, payload or client instance. |
| Parse, validate, convert, render or calculate | Use the established verb that matches the real behavior; do not replace every transformation with `create...` or hide validation behind a creation name. |

Keep conventional React event names such as `onSubmit` when they describe an
event boundary, and keep user-facing "Save" labels independent of implementation
method names. External library methods, generated identifiers and versioned wire
names are not private naming errors. A public-operation rename must account for
the backend contract and all consumers; this rule does not authorize broad
filename changes or mechanical verb replacement.

### Specific transformation names

Avoid `normalize` as a catch-all name for project-owned functions, methods,
variables, and files. First decide whether the helper is needed: keep a short,
one-use trim, case conversion, default, or mapping inline. When recursion, real
reuse, validation, or a protocol boundary justifies a helper, name its concrete
result or responsibility, such as `createCursorFilters`,
`parseRoutineTaskDefinition`, or `prepareMigrationStatement`. Do not replace
`normalize` mechanically with equally vague `process`, `handle`, or `sanitize`.

Preserve validation, defaults, legacy payload conversion, cursor bytes, and
storage behavior during naming changes. Established mathematical/Unicode
normalization and third-party API names are not prohibited; retain that
vocabulary only when it describes the actual algorithm or external contract.
Generated output and wire fields are not targets of a private naming cleanup.

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

Reuse is the default for an existing responsibility, not a reason to introduce
more abstractions. This applies equally to UI interactions, loading/error
presentation, React hooks, formatters, conversions, validation, translation,
query keys, API clients and persistence boundaries.

Before creating an alternative, identify the established owner, its callers and
tests. Prefer, in order: direct reuse, passing the existing supported context,
then a minimal compatible extension for a demonstrated need. A new abstraction
is justified only by a concrete ownership/behavior gap; document that gap and
keep error handling and lifecycle guarantees intact. Do not fork a component or
helper just to avoid reading its current contract.

Repeated features must use the same implementation and acceptance tests for the
same behavior. Entry-point-specific tests may verify context and callbacks, but
must not silently encode different formatting, loading, keyboard or error
semantics. Separate implementations increase bundle size and maintenance cost
and may drift despite each passing its own tests. Reuse does not mean moving a
one-use expression to a new helper file or forcing unrelated workflows through
a configurable wrapper.

For UI and heavy loading specifically, follow
[Reuse the owning interaction](01-ui.md#reuse-the-owning-interaction) and
[Loading feedback](01-ui.md#loading-feedback).

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

- Place types, interfaces, enums, schemas and constants by the module that
  defines their meaning, creates/validates their values or controls their
  lifecycle. Count callers to understand impact, not to choose ownership.
- A reusable component, library, utility or provider owns its public types too.
  Export those types from its owning module or nearest feature folder even
  when many external callers use them. For example, `ImageLoadingStatus`
  belongs to `commons/Image/Image.tsx`; `ScreenBreakpoint` belongs with
  `ScreenProvider`. A second consumer does not justify a global type file.
- Keep page/tab-local definitions within that page/tab unless an existing
  reusable owner actually defines the concept. Moving a type does not turn a
  page into a shared package.
- Do not split a local definition into `types/`, `constants/`, `models/`, or a
  helper file merely because its category has a familiar name.
- Reserve `shared/types/` for runtime-neutral concepts without a narrower
  owner, such as general coordinates in `cord.ts`, or deliberately shared
  domain contracts whose boundary spans existing owners. Public visibility or
  multiple imports alone are not reasons to place a definition there.
- A contract jointly owned by several independent domains belongs in
  `shared/types/` when no narrower common owner exists. Distinguish independent
  ownership from multiple callers inside the same feature. Use concise concept
  filenames and group closely related definitions and intrinsic operations in
  an existing concept file rather than requiring one file per declaration.
- Keep API data shapes with their schema/contract owner; using a response in a
  provider does not make that provider the owner of the wire contract. Keep
  generated definitions in their generator-owned location.
- Storage modules own their key/value catalog and persistence API. Domain
  modules can own the individual cached payloads; storing a value does not make
  the storage wrapper the owner of every domain model. Resolve the catalog's
  dependency direction before moving provider-owned payload types.
- Trace producers, consumers and dependencies before relocating a type. Do not
  make `shared/` import Web providers/components, including through type-only
  imports, or introduce runtime cycles when a schema, enum or default factory
  moves alongside a type. If no safe narrower owner exists yet, retain the
  shared contract until the owning boundary is deliberately changed.
- A `.type.ts` module may contain its type's schemas, validators/type guards,
  constructors/default factories, constants and closely related pure
  conversions or formatters. Keep these cohesive operations together rather
  than scattering them across `validation`, `factory` or generic helper files.
  For example, UUID validation/generation may stay in `uuidv4.type.ts`, and
  byte formatting may live alongside `ByteType`. The suffix describes the
  owning concept; it does not promise that every export is erased at runtime.
- Keep side-effectful workflows outside the model: browser subscriptions,
  storage reads/writes, API orchestration, navigation and multi-object tree
  operations still belong to their existing owners. Move intrinsic operations
  without pulling their callers' environment dependencies into a shared type.
- Preserve different request/response validation rules and persisted formats;
  co-location must not silently unify validators with different semantics. Do
  not invent unused per-type wrappers or extract a one-use expression merely
  to populate a type module. Keep already-colocated schemas and factories
  together during later ownership or folder migrations.
- A type or constant should move with an explicit ownership reason, not as a
  speculative preparation for future reuse. An ownership audit or convention
  update does not itself authorize moving definitions or renaming modules.

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
