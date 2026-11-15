import { RoutineTaskLocalSimulator } from "@/api/local/simulators/routineTask.simulator";
import type { SearchLocalAdapter } from "./adapter.type";

export const searchRoutineTasksLocalAdapter = {
  fieldName: "searchRoutineTasks",
  syncErrorMessage: "failed to synchronize searched routine tasks to local db",
  simulateErrorMessage:
    "failed to simulate searched routine tasks from local db",
  simulate: RoutineTaskLocalSimulator.simulateSearchRoutineTasks,
  signature: (data?: any): string =>
    JSON.stringify({
      totalCount: data?.searchRoutineTasks.totalCount ?? 0,
      endCursor: data?.searchRoutineTasks.searchPageInfo.endEncodedSearchCursor,
      edges:
        data?.searchRoutineTasks.searchEdges.map((edge: any) => ({
          cursor: edge.encodedSearchCursor,
          id: edge.node.id,
          routineId: edge.node.routineId,
          title: edge.node.title,
          updatedAt: new Date(edge.node.updatedAt ?? 0).getTime(),
        })) ?? [],
    }),
  sync: async () => {},
} satisfies SearchLocalAdapter;
