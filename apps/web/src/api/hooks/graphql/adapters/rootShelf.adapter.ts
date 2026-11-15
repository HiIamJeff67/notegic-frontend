import { RootShelfLocalSimulator } from "@/api/local/simulators/rootShelf.simulator";
import { RootShelfLocalSynchronizer } from "@/api/local/synchronizers/rootShelf.synchronizer";
import type { SearchLocalAdapter } from "./adapter.type";

export const searchRootShelvesLocalAdapter = {
  fieldName: "searchRootShelves",
  syncErrorMessage: "failed to synchronize searched root shelves to local db",
  simulateErrorMessage:
    "failed to simulate searched root shelves from local db",
  simulate: RootShelfLocalSimulator.simulateSearchRootShelves,
  signature: (data?: any): string =>
    JSON.stringify({
      totalCount: data?.searchRootShelves.totalCount ?? 0,
      endCursor: data?.searchRootShelves.searchPageInfo.endEncodedSearchCursor,
      edges:
        data?.searchRootShelves.searchEdges.map((edge: any) => ({
          cursor: edge.encodedSearchCursor,
          id: edge.node.id,
          permission: edge.node.permission,
          ownerPublicId: edge.node.owner?.publicId,
          ownerDisplayName: edge.node.owner?.displayName,
          ownerAvatarURL: edge.node.owner?.info?.avatarURL ?? null,
          sharers:
            edge.node.sharers?.map((sharer: any) => ({
              publicId: sharer.publicId,
              displayName: sharer.displayName,
              avatarURL: sharer.info?.avatarURL ?? null,
            })) ?? [],
          updatedAt: new Date(edge.node.updatedAt ?? 0).getTime(),
        })) ?? [],
    }),
  sync: (data?: any): Promise<void> =>
    RootShelfLocalSynchronizer.syncSearchRootShelves(
      data?.searchRootShelves.searchEdges.map((edge: any) => ({
        id: edge.node.id,
        name: edge.node.name,
        subShelfCount: edge.node.subShelfCount,
        itemCount: edge.node.itemCount,
        lastAnalyzedAt: new Date(edge.node.lastAnalyzedAt ?? 0),
        deletedAt:
          edge.node.deletedAt === null
            ? null
            : new Date(edge.node.deletedAt ?? 0),
        updatedAt: new Date(edge.node.updatedAt ?? 0),
        createdAt: new Date(edge.node.createdAt ?? 0),
        permission: edge.node.permission,
      })) ?? []
    ),
} satisfies SearchLocalAdapter;
