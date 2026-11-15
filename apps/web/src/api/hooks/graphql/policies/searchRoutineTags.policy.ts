import { searchPaginationPolicy } from "./searchPagination.policy";

export const searchRoutineTagsPolicy = searchPaginationPolicy;

export const clearSearchRoutineTags = (cache: {
  evict: (options: { fieldName: string }) => void;
}) => {
  cache.evict({ fieldName: "searchRoutineTags" });
};
