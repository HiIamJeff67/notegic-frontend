import { fromGraphQLSupportedIcon } from "@shared/api/graphql/conversions";
import { AccessControlPermission } from "@shared/api/interfaces/enums";
import { StationLocalSimulator } from "@/api/local/simulators/station.simulator";
import { StationLocalSynchronizer } from "@/api/local/synchronizers/station.synchronizer";
import type { SearchLocalAdapter } from "./adapter.type";

export const searchStationsLocalAdapter = {
  fieldName: "searchStations",
  syncErrorMessage: "failed to synchronize searched stations to local db",
  simulateErrorMessage: "failed to simulate searched stations from local db",
  simulate: StationLocalSimulator.simulateSearchStations,
  signature: (data?: any): string =>
    JSON.stringify({
      totalCount: data?.searchStations.totalCount ?? 0,
      endCursor: data?.searchStations.searchPageInfo.endEncodedSearchCursor,
      edges:
        data?.searchStations.searchEdges.map((edge: any) => ({
          cursor: edge.encodedSearchCursor,
          id: edge.node.id,
          permission: edge.node.permission,
          updatedAt: new Date(edge.node.updatedAt ?? 0).getTime(),
        })) ?? [],
    }),
  sync: (data?: any): Promise<void> =>
    StationLocalSynchronizer.syncSearchStations(
      data?.searchStations.searchEdges.map((edge: any) => ({
        id: edge.node.id,
        name: edge.node.name,
        icon:
          edge.node.icon === null
            ? null
            : fromGraphQLSupportedIcon(edge.node.icon),
        headerBackgroundURL: edge.node.headerBackgroundURL,
        permission: edge.node.permission as AccessControlPermission,
        routineCount: edge.node.routineCount,
        deletedAt:
          edge.node.deletedAt === null
            ? null
            : new Date(edge.node.deletedAt ?? 0),
        updatedAt: new Date(edge.node.updatedAt ?? 0),
        createdAt: new Date(edge.node.createdAt ?? 0),
      })) ?? []
    ),
} satisfies SearchLocalAdapter;
