import { searchPaginationPolicy } from "./searchPagination.policy";

export const searchItemsPolicy = searchPaginationPolicy;

export const clearSearchItems = (cache: {
  evict: (options: { fieldName: string }) => void;
}) => {
  cache.evict({ fieldName: "searchItems" });
};
