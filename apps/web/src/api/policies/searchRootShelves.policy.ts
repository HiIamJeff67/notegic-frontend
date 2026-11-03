import { searchPaginationPolicy } from "./searchPagination.policy";

export const searchRootShelvesPolicy = searchPaginationPolicy;

export const prependSearchRootShelves = (existing: any, edges: any[]) => {
  if (!existing) return existing;
  return {
    ...existing,
    searchEdges: [...edges, ...(existing.searchEdges ?? [])],
  };
};

export const prependMissingSearchRootShelves = (
  existing: any,
  readField: (fieldName: string, from?: any) => unknown,
  edges: any[]
) => {
  if (!existing?.searchEdges) return existing;
  const additions = edges.filter(
    edge =>
      !existing.searchEdges.some(
        (current: any) => readField("id", current.node) === edge.node.id
      )
  );
  if (additions.length === 0) return existing;
  return prependSearchRootShelves(existing, additions);
};

export const removeSearchRootShelves = (
  existing: any,
  readField: (fieldName: string, from?: any) => unknown,
  rootShelfIds: readonly string[]
) => {
  if (!existing?.searchEdges) return existing;
  const removed = new Set(rootShelfIds);
  return {
    ...existing,
    searchEdges: existing.searchEdges.filter(
      (edge: any) => !removed.has(readField("id", edge.node) as string)
    ),
  };
};

export const clearSearchRootShelves = (cache: {
  evict: (options: { fieldName: string }) => void;
}) => {
  cache.evict({ fieldName: "searchRootShelves" });
};
