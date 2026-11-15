import {
  fromGraphQLRoutinePeriod,
  fromGraphQLRoutinePhase,
} from "@shared/api/graphql/conversions";
import { RoutineLocalSimulator } from "@/api/local/simulators/routine.simulator";
import { RoutineLocalSynchronizer } from "@/api/local/synchronizers/routine.synchronizer";
import type { SearchLocalAdapter } from "./adapter.type";

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
          isActive: edge.node.isActive,
          hasCustomSchedule: edge.node.hasCustomSchedule,
          definitionVersion: edge.node.definitionVersion,
          admissionState: edge.node.admissionState,
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
        phase: fromGraphQLRoutinePhase(edge.node.phase),
        timeoutSeconds: edge.node.timeoutSeconds,
        isActive: edge.node.isActive,
        hasCustomSchedule: edge.node.hasCustomSchedule,
        definitionVersion: edge.node.definitionVersion,
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
} satisfies SearchLocalAdapter;
