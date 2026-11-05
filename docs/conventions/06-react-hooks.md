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

Search existing hooks/providers and their callers before adding a second
lifecycle, subscription, loading counter, query wrapper or storage boundary.
Use the established owner when its responsibility matches; keep a genuine
feature-specific difference local rather than wrapping the same hook again.
See [Reuse before creating](05-helpers-and-abstractions.md#reuse-before-creating)
and [Loading feedback](01-ui.md#loading-feedback).

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

React translations must use `useTranslation` from
`@/hooks/useTranslation`, not the vendor hook directly. See
[Translation entry points](10-translations.md) for current-language async
translation, memo dependencies, and non-React boundaries.

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

## Browser state during hydration

Keep SSR and the first client snapshot identical. `ScreenProvider` starts at
width/height 0 and updates through its existing mounted resize subscription.
`useNetwork` starts online on both sides, then synchronizes the actual browser
status and online/offline events. The presence of `navigator` alone does not
identify a browser: Node can expose it without an `onLine` property.

Do not render volatile fallback timestamps as account metadata. Until the
actual user/profile data is available, show a stable placeholder instead of a
date created independently during server and client module evaluation. Keep
forms mounted and preserve their existing editing state; do not suppress
hydration warnings or force remounts to hide mismatches.

## Open resource availability

An open viewer/editor observes its actual resource-ID query. An imperative
`.fetch()` followed by copied React state cannot track cache invalidation.
Keep availability in that query and editing values in their existing owner;
background refetches must not remount the editor or reset its draft.

Confirmed single/bulk deletion updates matching detail queries through
`api/policies/availablity.policy.ts`, including in-flight first reads.
Synchronize local deletion before refetching related lists. Material detail
invalidation includes both plain and `withParent` keys. Failed deletion must
leave the resource available. Restore uses the existing query observer.

Read hooks retain local fallback for missing-network errors. Authoritative
missing/denied responses must not fall back to stale editable data; unrelated
server failures remain errors. Render the existing resource's Not Found view
without IDs. Deleting a Routine disables its graph, while deleting one persisted
task disables only its inspector. New tasks absent from the draft baseline
have no remote existence requirement. Keep graph drafts and unsaved form values;
never clear storage, reset migrations or force a remount to handle deletion.
