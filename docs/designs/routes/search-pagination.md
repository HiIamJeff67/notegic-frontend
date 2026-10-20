# Search ordering and offline pagination

The backend owns the GraphQL contract. Its sibling-checkout specification is
`notegic-backend/docs/designs/routes/search-pagination.md` and the source inputs
live under `contracts/core/v1/graphql/schemas/search_*.graphql` there. The public
`after`/`encodedSearchCursor` fields remain opaque strings; no generated type
or SQLite migration is needed for this update.

## Web ownership

- `shared/lib/search-page.ts` owns portable cursor context, keyset continuation,
  bounds, and PageInfo for the existing RootShelf, Station, Routine, and
  RoutineTag offline simulators. They filter authorized cached rows, order
  before slicing, and use the same primary key plus ID as the backend.
- `shared/lib/compare-text.ts` matches PostgreSQL UTF-8 `COLLATE "C"` without
  locale-dependent ordering. The existing `compareEntityNames` UI utility
  reuses it; presentation sorting never reconstructs continuation cursors.
- `apps/web/src/api/policies/searchPagination.policy.ts` separates all 14 Apollo search
  fields by the complete normalized search context, excluding page size and
  `after`. First-page requests replace; continuation pages merge by node
  identity, including Item type, so retries do not append duplicate edges.
  The cache's accumulated count is its accumulated edge count.
- `apps/web/src/api/bridges/searchLocal.bridge.ts` retains base input when falling back during
  `fetchMore` and respects the caller's existing `updateQuery` merger.
  Validation/authentication errors are not treated as network failures.
- `routine.search.ts` provides the same Routine sort-key mapping to offline
  search and mutation-inserted edges. Mutations never substitute a raw ID for
  an opaque cursor. Cache keys retain the input envelope consumed by existing
  Routine modifiers; deleted-result caches are invalidated on those writes.

Defaults match the SDL: RELEVANCE, DESC, first 10; non-positive sizes use 10
and sizes above 100 are capped. Equal names use ID, not updatedAt. NULL sorts
last in either direction. Existing SQLite dates are second-resolution;
ordering keys use whole-second epoch milliseconds on both sides without
rewriting the stored data. Text query wildcard/escape semantics mirror the
server's ILIKE contains pattern.

Version 1 cursors bind scope, ordering and normalized filters to explicit
ordering values. They work even if the anchor is missing from SQLite, but
offline results still include only cached authorized rows. Primary sort-key
edits can move rows between pages; pagination is not a frozen search snapshot.

## Deployment and local checks

Deploy alongside the matching backend search implementation. Legacy ID-only
cursors and cursors from another search context must be discarded and the
search reissued without `after`. They must not silently append the first page.
A page refresh resets the in-memory cache; never clear the user's local data
to resolve a cursor validation error.

Run targeted tests for `search-page`, `compare-text`, `compare-entity-names`,
`routine.search`, `searchPagination.policy`, and `searchLocal.bridge`, then typecheck. Run
`npm run test:e2e -- search-offline.spec.ts --workers=1` for all four simulators
against real SQLite in an isolated Chromium profile. It does not use the user's
browser storage or live backend credentials and is not an `@environment` CI
smoke test. No GitHub Actions configuration is added.
