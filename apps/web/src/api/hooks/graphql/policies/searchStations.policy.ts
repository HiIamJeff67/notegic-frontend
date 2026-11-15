import { searchPaginationPolicy } from "./searchPagination.policy";

export const searchStationsPolicy = searchPaginationPolicy;

export const clearSearchStations = (cache: {
  evict: (options: { fieldName: string }) => void;
}) => {
  cache.evict({ fieldName: "searchStations" });
};
