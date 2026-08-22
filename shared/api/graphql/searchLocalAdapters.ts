import {
  fromGraphQLRoutinePeriod,
  fromGraphQLRoutineStatus,
  fromGraphQLSupportedIcon,
} from "@shared/api/graphql/conversions";
import { AccessControlPermission } from "@shared/api/interfaces/enums";
import { RootShelfLocalSimulator } from "@shared/api/local/simulators/rootShelf.simulator";
import { RoutineLocalSimulator } from "@shared/api/local/simulators/routine.simulator";
import { RoutineTagLocalSimulator } from "@shared/api/local/simulators/routineTag.simulator";
import { StationLocalSimulator } from "@shared/api/local/simulators/station.simulator";
import { RootShelfLocalSynchronizer } from "@shared/api/local/synchronizers/rootShelf.synchronizer";
import { RoutineLocalSynchronizer } from "@shared/api/local/synchronizers/routine.synchronizer";
import { RoutineTagLocalSynchronizer } from "@shared/api/local/synchronizers/routineTag.synchronizer";
import { StationLocalSynchronizer } from "@shared/api/local/synchronizers/station.synchronizer";

export const searchRoutinesLocalAdapter = {
  fieldName: "searchRoutines",
  syncErrorMessage: "failed to synchronize searched routines to local db",
  simulateErrorMessage: "failed to simulate searched routines from local db",
  simulate: RoutineLocalSimulator.simulateSearchRoutines,
  signature: (data?: any): string =>
    JSON.stringify({
      totalCount: data?.searchRoutines.totalCount ?? 0,
      endCursor: data?.searchRoutines.searchPageInfo.endEncodedSearchCursor,
      edges:
        data?.searchRoutines.searchEdges.map((edge: any) => ({
          cursor: edge.encodedSearchCursor,
          id: edge.node.id,
          stationId: edge.node.stationId,
          updatedAt: new Date(edge.node.updatedAt ?? 0).getTime(),
          tagIds: edge.node.tagIds ?? [],
          taskIds: edge.node.taskIds ?? [],
          itemIds: edge.node.itemIds ?? [],
        })) ?? [],
    }),
  sync: (data?: any): Promise<void> =>
    RoutineLocalSynchronizer.syncSearchRoutines(
      data?.searchRoutines.searchEdges.map((edge: any) => ({
        id: edge.node.id,
        stationId: edge.node.stationId,
        title: edge.node.title,
        status: fromGraphQLRoutineStatus(edge.node.status),
        isPinned: edge.node.isPinned,
        scheduledStartAt: new Date(edge.node.scheduledStartAt ?? 0),
        scheduledEndAt: new Date(edge.node.scheduledEndAt ?? 0),
        period: fromGraphQLRoutinePeriod(edge.node.period),
        timezone: edge.node.timezone,
        deletedAt:
          edge.node.deletedAt === null
            ? null
            : new Date(edge.node.deletedAt ?? 0),
        updatedAt: new Date(edge.node.updatedAt ?? 0),
        createdAt: new Date(edge.node.createdAt ?? 0),
        tagIds: edge.node.tagIds ?? [],
        taskIds: edge.node.taskIds ?? [],
        itemIds: edge.node.itemIds ?? [],
      })) ?? []
    ),
};

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
};

export const searchRoutineTagsLocalAdapter = {
  fieldName: "searchRoutineTags",
  syncErrorMessage: "failed to synchronize searched routine tags to local db",
  simulateErrorMessage:
    "failed to simulate searched routine tags from local db",
  simulate: RoutineTagLocalSimulator.simulateSearchRoutineTags,
  signature: (data?: any): string =>
    JSON.stringify({
      totalCount: data?.searchRoutineTags.totalCount ?? 0,
      endCursor: data?.searchRoutineTags.searchPageInfo.endEncodedSearchCursor,
      edges:
        data?.searchRoutineTags.searchEdges.map((edge: any) => ({
          cursor: edge.encodedSearchCursor,
          id: edge.node.id,
          updatedAt: new Date(edge.node.updatedAt ?? 0).getTime(),
        })) ?? [],
    }),
  sync: (data?: any): Promise<void> =>
    RoutineTagLocalSynchronizer.syncSearchRoutineTags(
      data?.searchRoutineTags.searchEdges.map((edge: any) => ({
        id: edge.node.id,
        name: edge.node.name,
        color: edge.node.color,
        icon:
          edge.node.icon === null
            ? null
            : fromGraphQLSupportedIcon(edge.node.icon),
        updatedAt: new Date(edge.node.updatedAt ?? 0),
        createdAt: new Date(edge.node.createdAt ?? 0),
      })) ?? []
    ),
};

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
};
