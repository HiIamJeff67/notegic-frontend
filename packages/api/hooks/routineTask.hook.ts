import {
  mutationFnCreateRoutineTaskByRoutineId,
  mutationFnHardDeleteMyRoutineTaskById,
  mutationFnHardDeleteMyRoutineTasksByIds,
  mutationFnUpdateMyRoutineTaskById,
  queryFnGetAllMyRoutineTasks,
  queryFnGetMyRoutineTaskById,
  queryFnGetMyRoutineTasksByRoutineId,
  queryFnVisualizeMyRoutineTaskPurposeCount,
} from "@shared/api/invokers/routineTask.invoker";
import { getQueryClient } from "@shared/api/queryClient";
import { UseQueryDefaultOptions } from "@shared/api/queryHookOptions";
import { queryKeys } from "@shared/api/queryKeys";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { UUID } from "crypto";

const queryOptions = {
  staleTime: UseQueryDefaultOptions.staleTime,
  refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
  refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
};

const invalidateTasks = () => {
  void getQueryClient().invalidateQueries({
    queryKey: queryKeys.routineTask.all(),
  });
};

export const useVisualizeMyRoutineTaskPurposeCount = (
  func: Parameters<typeof queryFnVisualizeMyRoutineTaskPurposeCount>[1],
  request?: Parameters<typeof queryFnVisualizeMyRoutineTaskPurposeCount>[0]
) =>
  useQuery({
    queryKey: queryKeys.routineTask.visualizeMyPurposeCount(
      request?.param.permission
    ),
    enabled: request !== undefined,
    queryFn: () =>
      queryFnVisualizeMyRoutineTaskPurposeCount(
        request as Parameters<
          typeof queryFnVisualizeMyRoutineTaskPurposeCount
        >[0],
        func
      ),
    ...queryOptions,
  });

export const useGetMyRoutineTaskById = (
  func: Parameters<typeof queryFnGetMyRoutineTaskById>[1],
  request?: Parameters<typeof queryFnGetMyRoutineTaskById>[0]
) =>
  useQuery({
    queryKey: queryKeys.routineTask.oneById(
      request?.param.routineTaskId as UUID | undefined,
      request?.param.isDeleted ?? false
    ),
    enabled: Boolean(request?.param.routineTaskId),
    queryFn: () =>
      queryFnGetMyRoutineTaskById(
        request as Parameters<typeof queryFnGetMyRoutineTaskById>[0],
        func
      ),
    ...queryOptions,
  });

export const useGetMyRoutineTasksByRoutineId = (
  func: Parameters<typeof queryFnGetMyRoutineTasksByRoutineId>[1],
  request?: Parameters<typeof queryFnGetMyRoutineTasksByRoutineId>[0]
) =>
  useQuery({
    queryKey: queryKeys.routineTask.manyByRoutineId(
      request?.param.routineId as UUID | undefined,
      request?.param.areDeleted ?? false
    ),
    enabled: Boolean(request?.param.routineId),
    queryFn: () =>
      queryFnGetMyRoutineTasksByRoutineId(
        request as Parameters<typeof queryFnGetMyRoutineTasksByRoutineId>[0],
        func
      ),
    ...queryOptions,
  });

export const useGetAllMyRoutineTasks = (
  func: Parameters<typeof queryFnGetAllMyRoutineTasks>[1],
  request?: Parameters<typeof queryFnGetAllMyRoutineTasks>[0]
) =>
  useQuery({
    queryKey: queryKeys.routineTask.myAll(request?.param?.areDeleted ?? false),
    enabled: request !== undefined,
    queryFn: () =>
      queryFnGetAllMyRoutineTasks(
        request as Parameters<typeof queryFnGetAllMyRoutineTasks>[0],
        func
      ),
    ...queryOptions,
  });

export const useCreateRoutineTaskByRoutineId = (
  func: Parameters<typeof mutationFnCreateRoutineTaskByRoutineId>[1]
) =>
  useMutation({
    mutationFn: (
      request: Parameters<typeof mutationFnCreateRoutineTaskByRoutineId>[0]
    ) => mutationFnCreateRoutineTaskByRoutineId(request, func),
    onSuccess: invalidateTasks,
  });

export const useUpdateMyRoutineTaskById = (
  func: Parameters<typeof mutationFnUpdateMyRoutineTaskById>[1]
) =>
  useMutation({
    mutationFn: (
      request: Parameters<typeof mutationFnUpdateMyRoutineTaskById>[0]
    ) => mutationFnUpdateMyRoutineTaskById(request, func),
    onSuccess: invalidateTasks,
  });

export const useHardDeleteMyRoutineTaskById = (
  func: Parameters<typeof mutationFnHardDeleteMyRoutineTaskById>[1]
) =>
  useMutation({
    mutationFn: (
      request: Parameters<typeof mutationFnHardDeleteMyRoutineTaskById>[0]
    ) => mutationFnHardDeleteMyRoutineTaskById(request, func),
    onSuccess: invalidateTasks,
  });

export const useHardDeleteMyRoutineTasksByIds = (
  func: Parameters<typeof mutationFnHardDeleteMyRoutineTasksByIds>[1]
) =>
  useMutation({
    mutationFn: (
      request: Parameters<typeof mutationFnHardDeleteMyRoutineTasksByIds>[0]
    ) => mutationFnHardDeleteMyRoutineTasksByIds(request, func),
    onSuccess: invalidateTasks,
  });
