import { queryFnGetMyRoutineTasksByRoutineId } from "@shared/api/invokers/routineTask.invoker";
import { queryFnGetRoutineTaskDependenciesByRoutineId } from "@shared/api/invokers/routineTaskDependency.invoker";
import { getQueryClient } from "@shared/api/queryClient";
import { PrefetchQueryDefaultOptions } from "@shared/api/queryHookOptions";
import { queryKeys } from "@shared/api/queryKeys";
import type { QueryClient } from "@tanstack/react-query";
import type { UUID } from "crypto";
import { getClientRequestHeaders } from "@/api/functions/headers/clientHeaders";
import { GetMyRoutineTasksByRoutineId } from "@/api/functions/routineTask.serverFn";
import { GetRoutineTaskDependenciesByRoutineId } from "@/api/functions/routineTaskDependency.serverFn";
import { RoutineTaskLocalSynchronizer } from "@/api/local/synchronizers/routineTask.synchronizer";
import { RoutineTaskDependencyLocalSynchronizer } from "@/api/local/synchronizers/routineTaskDependency.synchronizer";

export const prefetchRoutineTaskDependencyGraph = async (
  routineId: UUID,
  initialQueryClient?: QueryClient
): Promise<void> => {
  const queryClient = initialQueryClient ?? getQueryClient();
  const header = getClientRequestHeaders();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: queryKeys.routineTask.manyByRoutineId(routineId),
      queryFn: async () => {
        const response = await queryFnGetMyRoutineTasksByRoutineId(
          {
            header,
            param: { routineId },
          },
          GetMyRoutineTasksByRoutineId
        );
        await RoutineTaskLocalSynchronizer.syncGetMyRoutineTasksByRoutineId(
          response
        );
        return response;
      },
      staleTime: PrefetchQueryDefaultOptions.staleTime as number,
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.routineTaskDependency.byRoutineId(routineId),
      queryFn: async () => {
        const request = {
          header,
          param: { routineId },
        };
        const response = await queryFnGetRoutineTaskDependenciesByRoutineId(
          request,
          GetRoutineTaskDependenciesByRoutineId
        );
        await RoutineTaskDependencyLocalSynchronizer.syncGetRoutineTaskDependenciesByRoutineId(
          request,
          response
        );
        return response;
      },
      staleTime: PrefetchQueryDefaultOptions.staleTime as number,
    }),
  ]);
};
