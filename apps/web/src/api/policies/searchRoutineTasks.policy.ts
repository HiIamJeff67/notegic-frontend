import { searchPaginationPolicy } from "./searchPagination.policy";

export const searchRoutineTasksPolicy = searchPaginationPolicy;

export const removeSearchRoutineTasks = (
  existing: any,
  readField: (fieldName: string, from?: any) => unknown,
  routineTaskIds: readonly string[]
) => {
  if (!existing?.searchEdges) return existing;
  const removed = new Set(routineTaskIds);
  const searchEdges = existing.searchEdges.filter(
    (edge: any) => !removed.has(readField("id", edge.node) as string)
  );
  return {
    ...existing,
    totalCount: Math.max(
      0,
      (existing.totalCount ?? searchEdges.length) -
        (existing.searchEdges.length - searchEdges.length)
    ),
    searchEdges,
  };
};

export const clearSearchRoutineTasks = (cache: {
  evict: (options: { fieldName: string }) => void;
}) => {
  cache.evict({ fieldName: "searchRoutineTasks" });
};
