import { getQueryClient } from "@shared/api/queryClient";
import { PrefetchQueryDefaultOptions } from "@shared/api/queryHookOptions";
import { queryKeys } from "@shared/api/queryKeys";
import type { QueryClient } from "@tanstack/react-query";
import type { UUID } from "crypto";
import { getClientRequestHeaders } from "@/api/clientHeaders";
import { queryFnGetMyRoutineTasksByRoutineId } from "@/api/invokers/routineTask.invoker";
import { queryFnGetRoutineTaskDependenciesByRoutineId } from "@/api/invokers/routineTaskDependency.invoker";
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
        const response = await queryFnGetMyRoutineTasksByRoutineId({
          header,
          param: { routineId },
        });
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
        const response =
          await queryFnGetRoutineTaskDependenciesByRoutineId(request);
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
