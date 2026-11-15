import { ItemLocalSimulator } from "@/api/local/simulators/item.simulator";
import type { SearchLocalAdapter } from "./adapter.type";

export const searchItemsLocalAdapter = {
  fieldName: "searchItems",
  syncErrorMessage: "failed to synchronize searched items to local db",
  simulateErrorMessage: "failed to simulate searched items from local db",
  simulate: ItemLocalSimulator.simulateSearchItems,
  signature: (data?: any): string =>
    JSON.stringify({
      totalCount: data?.searchItems.totalCount ?? 0,
      endCursor: data?.searchItems.searchPageInfo.endEncodedSearchCursor,
      edges:
        data?.searchItems.searchEdges.map((edge: any) => ({
          cursor: edge.encodedSearchCursor,
          id: edge.node.id,
          type: edge.node.type,
          parentSubShelfId: edge.node.parentSubShelfId,
          rootShelfId: edge.node.rootShelfId,
          updatedAt: new Date(edge.node.updatedAt ?? 0).getTime(),
        })) ?? [],
    }),
  sync: async () => {},
} satisfies SearchLocalAdapter;
