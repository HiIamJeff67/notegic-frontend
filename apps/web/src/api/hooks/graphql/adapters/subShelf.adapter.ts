import { SubShelfLocalSimulator } from "@/api/local/simulators/subShelf.simulator";
import { SubShelfLocalSynchronizer } from "@/api/local/synchronizers/subShelf.synchronizer";
import type { SearchLocalAdapter } from "./adapter.type";

export const searchSubShelvesLocalAdapter = {
  fieldName: "searchSubShelves",
  syncErrorMessage: "failed to synchronize searched sub shelves to local db",
  simulateErrorMessage: "failed to simulate searched sub shelves from local db",
  simulate: SubShelfLocalSimulator.simulateSearchSubShelves,
  signature: (data?: any): string =>
    JSON.stringify({
      totalCount: data?.searchSubShelves.totalCount ?? 0,
      endCursor: data?.searchSubShelves.searchPageInfo.endEncodedSearchCursor,
      edges:
        data?.searchSubShelves.searchEdges.map((edge: any) => ({
          cursor: edge.encodedSearchCursor,
          id: edge.node.id,
          rootShelfId: edge.node.rootShelfId,
          prevSubShelfId: edge.node.prevSubShelfId,
          updatedAt: new Date(edge.node.updatedAt ?? 0).getTime(),
        })) ?? [],
    }),
  sync: (data?: any): Promise<void> =>
    SubShelfLocalSynchronizer.syncSearchSubShelves(
      data?.searchSubShelves.searchEdges.map((edge: any) => ({
        id: edge.node.id,
        name: edge.node.name,
        rootShelfId: edge.node.rootShelfId,
        prevSubShelfId: edge.node.prevSubShelfId,
        path: edge.node.path ?? [],
        deletedAt:
          edge.node.deletedAt === null
            ? null
            : new Date(edge.node.deletedAt ?? 0),
        updatedAt: new Date(edge.node.updatedAt ?? 0),
        createdAt: new Date(edge.node.createdAt ?? 0),
      })) ?? []
    ),
} satisfies SearchLocalAdapter;
