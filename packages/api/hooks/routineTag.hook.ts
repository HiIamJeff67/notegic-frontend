import {
  mutationFnCreateRoutineTag,
  mutationFnCreateRoutineTags,
  mutationFnHardDeleteMyRoutineTagById,
  mutationFnHardDeleteMyRoutineTagsByIds,
  mutationFnUpdateMyRoutineTagById,
  mutationFnUpdateMyRoutineTagsByIds,
  queryFnGetAllMyRoutineTags,
  queryFnGetMyRoutineTagById,
} from "@shared/api/invokers/routineTag.invoker";
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

const invalidateTags = () => {
  void getQueryClient().invalidateQueries({
    queryKey: queryKeys.routineTag.all(),
  });
};

export const useGetMyRoutineTagById = (
  func: Parameters<typeof queryFnGetMyRoutineTagById>[1],
  request?: Parameters<typeof queryFnGetMyRoutineTagById>[0]
) =>
  useQuery({
    queryKey: queryKeys.routineTag.oneById(
      request?.param.routineTagId as UUID | undefined,
      request?.param.isDeleted ?? false
    ),
    enabled: Boolean(request?.param.routineTagId),
    queryFn: () =>
      queryFnGetMyRoutineTagById(
        request as Parameters<typeof queryFnGetMyRoutineTagById>[0],
        func
      ),
    ...queryOptions,
  });

export const useGetAllMyRoutineTags = (
  func: Parameters<typeof queryFnGetAllMyRoutineTags>[1],
  request?: Parameters<typeof queryFnGetAllMyRoutineTags>[0]
) =>
  useQuery({
    queryKey: queryKeys.routineTag.myAll(request?.param?.areDeleted ?? false),
    enabled: request !== undefined,
    queryFn: () =>
      queryFnGetAllMyRoutineTags(
        request as Parameters<typeof queryFnGetAllMyRoutineTags>[0],
        func
      ),
    ...queryOptions,
  });

export const useCreateRoutineTag = (
  func: Parameters<typeof mutationFnCreateRoutineTag>[1]
) =>
  useMutation({
    mutationFn: (request: Parameters<typeof mutationFnCreateRoutineTag>[0]) =>
      mutationFnCreateRoutineTag(request, func),
    onSuccess: invalidateTags,
  });

export const useCreateRoutineTags = (
  func: Parameters<typeof mutationFnCreateRoutineTags>[1]
) =>
  useMutation({
    mutationFn: (request: Parameters<typeof mutationFnCreateRoutineTags>[0]) =>
      mutationFnCreateRoutineTags(request, func),
    onSuccess: invalidateTags,
  });

export const useUpdateMyRoutineTagById = (
  func: Parameters<typeof mutationFnUpdateMyRoutineTagById>[1]
) =>
  useMutation({
    mutationFn: (
      request: Parameters<typeof mutationFnUpdateMyRoutineTagById>[0]
    ) => mutationFnUpdateMyRoutineTagById(request, func),
    onSuccess: invalidateTags,
  });

export const useUpdateMyRoutineTagsByIds = (
  func: Parameters<typeof mutationFnUpdateMyRoutineTagsByIds>[1]
) =>
  useMutation({
    mutationFn: (
      request: Parameters<typeof mutationFnUpdateMyRoutineTagsByIds>[0]
    ) => mutationFnUpdateMyRoutineTagsByIds(request, func),
    onSuccess: invalidateTags,
  });

export const useHardDeleteMyRoutineTagById = (
  func: Parameters<typeof mutationFnHardDeleteMyRoutineTagById>[1]
) =>
  useMutation({
    mutationFn: (
      request: Parameters<typeof mutationFnHardDeleteMyRoutineTagById>[0]
    ) => mutationFnHardDeleteMyRoutineTagById(request, func),
    onSuccess: invalidateTags,
  });

export const useHardDeleteMyRoutineTagsByIds = (
  func: Parameters<typeof mutationFnHardDeleteMyRoutineTagsByIds>[1]
) =>
  useMutation({
    mutationFn: (
      request: Parameters<typeof mutationFnHardDeleteMyRoutineTagsByIds>[0]
    ) => mutationFnHardDeleteMyRoutineTagsByIds(request, func),
    onSuccess: invalidateTags,
  });
