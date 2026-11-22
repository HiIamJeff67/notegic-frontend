import {
  mutationFnCreateRoutineTaskDependencyByRoutineId,
  mutationFnDeleteRoutineTaskDependencyByRoutineId,
  mutationFnUpdateRoutineTaskDependencyByRoutineId,
  mutationFnUpdateRoutineTaskGraphByRoutineId,
  queryFnGetRoutineTaskDependenciesByRoutineId,
} from "@shared/api/invokers/routineTaskDependency.invoker";
import { getQueryClient } from "@shared/api/queryClient";
import { UseQueryDefaultOptions } from "@shared/api/queryHookOptions";
import { queryKeys } from "@shared/api/queryKeys";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { UUID } from "crypto";

const invalidateDependencies = () => {
  void getQueryClient().invalidateQueries({
    queryKey: queryKeys.routineTaskDependency.all(),
  });
};

export const useGetRoutineTaskDependenciesByRoutineId = (
  func: Parameters<typeof queryFnGetRoutineTaskDependenciesByRoutineId>[1],
  request?: Parameters<typeof queryFnGetRoutineTaskDependenciesByRoutineId>[0]
) =>
  useQuery({
    queryKey: queryKeys.routineTaskDependency.byRoutineId(
      request?.param.routineId as UUID | undefined
    ),
    enabled: Boolean(request?.param.routineId),
    queryFn: () =>
      queryFnGetRoutineTaskDependenciesByRoutineId(
        request as Parameters<
          typeof queryFnGetRoutineTaskDependenciesByRoutineId
        >[0],
        func
      ),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
  });

export const useCreateRoutineTaskDependencyByRoutineId = (
  func: Parameters<typeof mutationFnCreateRoutineTaskDependencyByRoutineId>[1]
) =>
  useMutation({
    mutationFn: (
      request: Parameters<
        typeof mutationFnCreateRoutineTaskDependencyByRoutineId
      >[0]
    ) => mutationFnCreateRoutineTaskDependencyByRoutineId(request, func),
    onSuccess: invalidateDependencies,
  });

export const useUpdateRoutineTaskGraphByRoutineId = (
  func: Parameters<typeof mutationFnUpdateRoutineTaskGraphByRoutineId>[1]
) =>
  useMutation({
    mutationFn: (
      request: Parameters<typeof mutationFnUpdateRoutineTaskGraphByRoutineId>[0]
    ) => mutationFnUpdateRoutineTaskGraphByRoutineId(request, func),
    onSuccess: invalidateDependencies,
  });

export const useUpdateRoutineTaskDependencyByRoutineId = (
  func: Parameters<typeof mutationFnUpdateRoutineTaskDependencyByRoutineId>[1]
) =>
  useMutation({
    mutationFn: (
      request: Parameters<
        typeof mutationFnUpdateRoutineTaskDependencyByRoutineId
      >[0]
    ) => mutationFnUpdateRoutineTaskDependencyByRoutineId(request, func),
    onSuccess: invalidateDependencies,
  });

export const useDeleteRoutineTaskDependencyByRoutineId = (
  func: Parameters<typeof mutationFnDeleteRoutineTaskDependencyByRoutineId>[1]
) =>
  useMutation({
    mutationFn: (
      request: Parameters<
        typeof mutationFnDeleteRoutineTaskDependencyByRoutineId
      >[0]
    ) => mutationFnDeleteRoutineTaskDependencyByRoutineId(request, func),
    onSuccess: invalidateDependencies,
  });
