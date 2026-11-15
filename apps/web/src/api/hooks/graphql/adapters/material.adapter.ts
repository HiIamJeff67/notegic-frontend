import { MaterialLocalSimulator } from "@/api/local/simulators/material.simulator";
import type { SearchLocalAdapter } from "./adapter.type";

export const searchMaterialsLocalAdapter = {
  fieldName: "searchMaterials",
  syncErrorMessage: "failed to synchronize searched materials to local db",
  simulateErrorMessage: "failed to simulate searched materials from local db",
  simulate: MaterialLocalSimulator.simulateSearchMaterials,
  signature: (data?: any): string =>
    JSON.stringify({
      totalCount: data?.searchMaterials.totalCount ?? 0,
      endCursor: data?.searchMaterials.searchPageInfo.endEncodedSearchCursor,
      edges:
        data?.searchMaterials.searchEdges.map((edge: any) => ({
          cursor: edge.encodedSearchCursor,
          id: edge.node.id,
          parentSubShelfId: edge.node.parentSubShelfId,
          name: edge.node.name,
          updatedAt: new Date(edge.node.updatedAt ?? 0).getTime(),
        })) ?? [],
    }),
  sync: async () => {},
} satisfies SearchLocalAdapter;
