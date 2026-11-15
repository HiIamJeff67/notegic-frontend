import { fromGraphQLSupportedIcon } from "@shared/api/graphql/conversions";
import { RoutineTagLocalSimulator } from "@/api/local/simulators/routineTag.simulator";
import { RoutineTagLocalSynchronizer } from "@/api/local/synchronizers/routineTag.synchronizer";
import type { SearchLocalAdapter } from "./adapter.type";

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
} satisfies SearchLocalAdapter;
