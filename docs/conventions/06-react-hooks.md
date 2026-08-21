# React Hook Conventions

Hooks are application boundaries, not a default place to hide ordinary helper
functions. Keep hook code direct and close to the state, lifecycle, or query
behavior it owns.

## When to create a hook

- Create a hook when the logic genuinely coordinates React state, effects,
  memoization, subscriptions, context, or query lifecycle.
- Keep component-local state and derived values in the component when only one
  component needs them and the component remains readable.
- Do not create a hook merely to move a few lines out of a component.
- Do not create a hook for a pure transformation that does not use React
  behavior; use a local expression or a clearly named pure function instead.
- Do not create a hook for a single anticipated future consumer.

## Avoid helper functions inside hooks

- Keep one-use validation, mapping, event payload construction, and dependency
  preparation inline in the hook.
- Do not create a separate helper file for a function used by only one hook.
- A local function inside the hook is acceptable when it gives a meaningful
  domain name or keeps the primary effect/query flow readable.
- Extract a hook helper only when two or more hook operations share the same
  named concept, the logic has an independent testable meaning, or the helper
  is an explicit browser/API/storage boundary.
- Do not hide lifecycle behavior, subscriptions, or data fetching inside a
  generic helper with an unclear name.

## Hook ownership and dependencies

- Feature hooks belong near the feature or API boundary that owns them.
- Query hooks should reuse the existing query client, query keys, and invoker
  conventions instead of creating a second query wrapper.
- Browser listeners, timers, subscriptions, and cleanup must remain visible in
  the hook that owns their lifecycle.
- A hook must not silently perform unrelated storage writes or API calls merely
  because it is convenient to share a helper.
- Keep hook-specific types and constants in the hook file when there is one
  consumer. Promote them only for multiple real consumers or a public contract.

## Shared hook rule

Before adding a hook under a shared or common location, verify that it has a
real cross-feature consumer. A shared hook must have a clear responsibility and
stable dependencies; it must not become a dumping ground for component logic.

Prefer a small, explicit hook over a configurable hook with many flags. If two
callers need different behavior, keep separate feature-local hooks until the
shared concept is proven.

## Review checklist

- Does the hook use React lifecycle, state, context, or query behavior?
- Could this remain as local component logic?
- Is a helper file being created for only one consumer?
- Are one-use mappings, validation, and temporary values still visible?
- Are types and constants colocated with their only consumer?
- Are effects, subscriptions, and cleanup owned by the correct hook?
- Does the hook have a real shared consumer, or is it speculative?
