import { searchItemsPolicy } from "./searchItems.policy";
import { searchPaginationPolicy } from "./searchPagination.policy";
import { searchRootShelvesPolicy } from "./searchRootShelves.policy";
import { searchRoutinesPolicy } from "./searchRoutines.policy";
import { searchRoutineTagsPolicy } from "./searchRoutineTags.policy";
import { searchRoutineTasksPolicy } from "./searchRoutineTasks.policy";
import { searchStationsPolicy } from "./searchStations.policy";

export const searchQueryFieldPolicies = {
  searchRootShelves: searchRootShelvesPolicy,
  searchSubShelves: searchPaginationPolicy,
  searchItems: searchItemsPolicy,
  searchBlockPacks: searchPaginationPolicy,
  searchBlocks: searchPaginationPolicy,
  searchMaterials: searchPaginationPolicy,
  searchStations: searchStationsPolicy,
  searchRoutines: searchRoutinesPolicy,
  searchRoutineTasks: searchRoutineTasksPolicy,
  searchRoutineTags: searchRoutineTagsPolicy,
  searchRoutineRecords: searchPaginationPolicy,
  searchRoutineTaskRecords: searchPaginationPolicy,
  searchUsers: searchPaginationPolicy,
  searchThemes: searchPaginationPolicy,
};
