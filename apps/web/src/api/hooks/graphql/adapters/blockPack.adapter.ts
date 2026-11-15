import { BlockPackLocalSimulator } from "@/api/local/simulators/blockPack.simulator";
import type { SearchLocalAdapter } from "./adapter.type";

export const searchBlockPacksLocalAdapter = {
  fieldName: "searchBlockPacks",
  syncErrorMessage: "failed to synchronize searched block packs to local db",
  simulateErrorMessage: "failed to simulate searched block packs from local db",
  simulate: BlockPackLocalSimulator.simulateSearchBlockPacks,
  signature: (data?: any): string =>
    JSON.stringify({
      totalCount: data?.searchBlockPacks.totalCount ?? 0,
      endCursor: data?.searchBlockPacks.searchPageInfo.endEncodedSearchCursor,
      edges:
        data?.searchBlockPacks.searchEdges.map((edge: any) => ({
          cursor: edge.encodedSearchCursor,
          id: edge.node.id,
          parentSubShelfId: edge.node.parentSubShelfId,
          name: edge.node.name,
          blockCount: edge.node.blockCount,
          updatedAt: new Date(edge.node.updatedAt ?? 0).getTime(),
        })) ?? [],
    }),
  sync: async () => {},
} satisfies SearchLocalAdapter;
