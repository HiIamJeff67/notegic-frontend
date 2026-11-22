import {
  mutationFnCreateRoutineByStationId,
  mutationFnCreateRoutinesByStationIds,
  mutationFnDeleteMyRoutineById,
  mutationFnDeleteMyRoutinesByIds,
  mutationFnHardDeleteMyRoutineById,
  mutationFnHardDeleteMyRoutinesByIds,
  mutationFnLinkRoutineItemById,
  mutationFnLinkRoutineItemsByIds,
  mutationFnLinkRoutineTagById,
  mutationFnLinkRoutineTagsByIds,
  mutationFnLinkRoutineTaskById,
  mutationFnLinkRoutineTasksByIds,
  mutationFnRestoreMyRoutineById,
  mutationFnRestoreMyRoutinesByIds,
  mutationFnUpdateMyRoutineById,
  mutationFnUpdateMyRoutinesByIds,
  queryFnGetMyRoutineById,
  queryFnGetMyRoutinesByStationId,
  queryFnGetMyRoutinesByTimeRange,
  queryFnVisualizeMyRoutinePeriodCount,
  queryFnVisualizeMyRoutineScheduledEndAtCount,
  queryFnVisualizeMyRoutineScheduledStartAtCount,
  queryFnVisualizeMyRoutineStatusCount,
} from "@shared/api/invokers/routine.invoker";
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

const invalidateRoutines = () => {
  void getQueryClient().invalidateQueries({
    queryKey: queryKeys.routine.all(),
  });
};

export const useVisualizeMyRoutineStatusCount = (
  func: Parameters<typeof queryFnVisualizeMyRoutineStatusCount>[1],
  request?: Parameters<typeof queryFnVisualizeMyRoutineStatusCount>[0]
) =>
  useQuery({
    queryKey: queryKeys.routine.visualizeMyStatusCount(
      request?.param.permission
    ),
    enabled: request !== undefined,
    queryFn: () =>
      queryFnVisualizeMyRoutineStatusCount(
        request as Parameters<typeof queryFnVisualizeMyRoutineStatusCount>[0],
        func
      ),
    ...queryOptions,
  });

export const useVisualizeMyRoutinePeriodCount = (
  func: Parameters<typeof queryFnVisualizeMyRoutinePeriodCount>[1],
  request?: Parameters<typeof queryFnVisualizeMyRoutinePeriodCount>[0]
) =>
  useQuery({
    queryKey: queryKeys.routine.visualizeMyPeriodCount(
      request?.param.permission
    ),
    enabled: request !== undefined,
    queryFn: () =>
      queryFnVisualizeMyRoutinePeriodCount(
        request as Parameters<typeof queryFnVisualizeMyRoutinePeriodCount>[0],
        func
      ),
    ...queryOptions,
  });

export const useVisualizeMyRoutineScheduledStartAtCount = (
  func: Parameters<typeof queryFnVisualizeMyRoutineScheduledStartAtCount>[1],
  request?: Parameters<typeof queryFnVisualizeMyRoutineScheduledStartAtCount>[0]
) =>
  useQuery({
    queryKey: queryKeys.routine.visualizeMyScheduledStartAtCount(
      request?.param.permission,
      request?.param.timeHourUnit,
      request?.param.queryRangeStartedAt,
      request?.param.queryRangeEndedAt
    ),
    enabled: request !== undefined,
    queryFn: () =>
      queryFnVisualizeMyRoutineScheduledStartAtCount(
        request as Parameters<
          typeof queryFnVisualizeMyRoutineScheduledStartAtCount
        >[0],
        func
      ),
    ...queryOptions,
  });

export const useVisualizeMyRoutineScheduledEndAtCount = (
  func: Parameters<typeof queryFnVisualizeMyRoutineScheduledEndAtCount>[1],
  request?: Parameters<typeof queryFnVisualizeMyRoutineScheduledEndAtCount>[0]
) =>
  useQuery({
    queryKey: queryKeys.routine.visualizeMyScheduledEndAtCount(
      request?.param.permission,
      request?.param.timeHourUnit,
      request?.param.queryRangeStartedAt,
      request?.param.queryRangeEndedAt
    ),
    enabled: request !== undefined,
    queryFn: () =>
      queryFnVisualizeMyRoutineScheduledEndAtCount(
        request as Parameters<
          typeof queryFnVisualizeMyRoutineScheduledEndAtCount
        >[0],
        func
      ),
    ...queryOptions,
  });

export const useGetMyRoutineById = (
  func: Parameters<typeof queryFnGetMyRoutineById>[1],
  request?: Parameters<typeof queryFnGetMyRoutineById>[0]
) =>
  useQuery({
    queryKey: queryKeys.routine.oneById(
      request?.param.routineId as UUID | undefined,
      request?.param.isDeleted ?? false
    ),
    enabled: Boolean(request?.param.routineId),
    queryFn: () =>
      queryFnGetMyRoutineById(
        request as Parameters<typeof queryFnGetMyRoutineById>[0],
        func
      ),
    ...queryOptions,
  });

export const useGetMyRoutinesByStationId = (
  func: Parameters<typeof queryFnGetMyRoutinesByStationId>[1],
  request?: Parameters<typeof queryFnGetMyRoutinesByStationId>[0]
) =>
  useQuery({
    queryKey: queryKeys.routine.manyByStationId(
      request?.param.stationId as UUID | undefined,
      request?.param.areDeleted ?? false
    ),
    enabled: Boolean(request?.param.stationId),
    queryFn: () =>
      queryFnGetMyRoutinesByStationId(
        request as Parameters<typeof queryFnGetMyRoutinesByStationId>[0],
        func
      ),
    ...queryOptions,
  });

export const useGetMyRoutinesByTimeRange = (
  func: Parameters<typeof queryFnGetMyRoutinesByTimeRange>[1],
  request?: Parameters<typeof queryFnGetMyRoutinesByTimeRange>[0]
) =>
  useQuery({
    queryKey: queryKeys.routine.manyByTimeRange(
      request?.param.from as Date | undefined,
      request?.param.to as Date | undefined,
      undefined,
      request?.param.areDeleted ?? false
    ),
    enabled: Boolean(request?.param.from && request?.param.to),
    queryFn: () =>
      queryFnGetMyRoutinesByTimeRange(
        request as Parameters<typeof queryFnGetMyRoutinesByTimeRange>[0],
        func
      ),
    ...queryOptions,
  });

export const useCreateRoutineByStationId = (
  func: Parameters<typeof mutationFnCreateRoutineByStationId>[1]
) =>
  useMutation({
    mutationFn: (
      request: Parameters<typeof mutationFnCreateRoutineByStationId>[0]
    ) => mutationFnCreateRoutineByStationId(request, func),
    onSuccess: invalidateRoutines,
  });

export const useCreateRoutinesByStationIds = (
  func: Parameters<typeof mutationFnCreateRoutinesByStationIds>[1]
) =>
  useMutation({
    mutationFn: (
      request: Parameters<typeof mutationFnCreateRoutinesByStationIds>[0]
    ) => mutationFnCreateRoutinesByStationIds(request, func),
    onSuccess: invalidateRoutines,
  });

export const useUpdateMyRoutineById = (
  func: Parameters<typeof mutationFnUpdateMyRoutineById>[1]
) =>
  useMutation({
    mutationFn: (
      request: Parameters<typeof mutationFnUpdateMyRoutineById>[0]
    ) => mutationFnUpdateMyRoutineById(request, func),
    onSuccess: invalidateRoutines,
  });

export const useUpdateMyRoutinesByIds = (
  func: Parameters<typeof mutationFnUpdateMyRoutinesByIds>[1]
) =>
  useMutation({
    mutationFn: (
      request: Parameters<typeof mutationFnUpdateMyRoutinesByIds>[0]
    ) => mutationFnUpdateMyRoutinesByIds(request, func),
    onSuccess: invalidateRoutines,
  });

export const useLinkRoutineTagById = (
  func: Parameters<typeof mutationFnLinkRoutineTagById>[1]
) =>
  useMutation({
    mutationFn: (request: Parameters<typeof mutationFnLinkRoutineTagById>[0]) =>
      mutationFnLinkRoutineTagById(request, func),
    onSuccess: invalidateRoutines,
  });

export const useLinkRoutineTagsByIds = (
  func: Parameters<typeof mutationFnLinkRoutineTagsByIds>[1]
) =>
  useMutation({
    mutationFn: (
      request: Parameters<typeof mutationFnLinkRoutineTagsByIds>[0]
    ) => mutationFnLinkRoutineTagsByIds(request, func),
    onSuccess: invalidateRoutines,
  });

export const useLinkRoutineTaskById = (
  func: Parameters<typeof mutationFnLinkRoutineTaskById>[1]
) =>
  useMutation({
    mutationFn: (
      request: Parameters<typeof mutationFnLinkRoutineTaskById>[0]
    ) => mutationFnLinkRoutineTaskById(request, func),
    onSuccess: invalidateRoutines,
  });

export const useLinkRoutineTasksByIds = (
  func: Parameters<typeof mutationFnLinkRoutineTasksByIds>[1]
) =>
  useMutation({
    mutationFn: (
      request: Parameters<typeof mutationFnLinkRoutineTasksByIds>[0]
    ) => mutationFnLinkRoutineTasksByIds(request, func),
    onSuccess: invalidateRoutines,
  });

export const useLinkRoutineItemById = (
  func: Parameters<typeof mutationFnLinkRoutineItemById>[1]
) =>
  useMutation({
    mutationFn: (
      request: Parameters<typeof mutationFnLinkRoutineItemById>[0]
    ) => mutationFnLinkRoutineItemById(request, func),
    onSuccess: invalidateRoutines,
  });

export const useLinkRoutineItemsByIds = (
  func: Parameters<typeof mutationFnLinkRoutineItemsByIds>[1]
) =>
  useMutation({
    mutationFn: (
      request: Parameters<typeof mutationFnLinkRoutineItemsByIds>[0]
    ) => mutationFnLinkRoutineItemsByIds(request, func),
    onSuccess: invalidateRoutines,
  });

export const useRestoreMyRoutineById = (
  func: Parameters<typeof mutationFnRestoreMyRoutineById>[1]
) =>
  useMutation({
    mutationFn: (
      request: Parameters<typeof mutationFnRestoreMyRoutineById>[0]
    ) => mutationFnRestoreMyRoutineById(request, func),
    onSuccess: invalidateRoutines,
  });

export const useRestoreMyRoutinesByIds = (
  func: Parameters<typeof mutationFnRestoreMyRoutinesByIds>[1]
) =>
  useMutation({
    mutationFn: (
      request: Parameters<typeof mutationFnRestoreMyRoutinesByIds>[0]
    ) => mutationFnRestoreMyRoutinesByIds(request, func),
    onSuccess: invalidateRoutines,
  });

export const useDeleteMyRoutineById = (
  func: Parameters<typeof mutationFnDeleteMyRoutineById>[1]
) =>
  useMutation({
    mutationFn: (
      request: Parameters<typeof mutationFnDeleteMyRoutineById>[0]
    ) => mutationFnDeleteMyRoutineById(request, func),
    onSuccess: invalidateRoutines,
  });

export const useDeleteMyRoutinesByIds = (
  func: Parameters<typeof mutationFnDeleteMyRoutinesByIds>[1]
) =>
  useMutation({
    mutationFn: (
      request: Parameters<typeof mutationFnDeleteMyRoutinesByIds>[0]
    ) => mutationFnDeleteMyRoutinesByIds(request, func),
    onSuccess: invalidateRoutines,
  });

export const useHardDeleteMyRoutineById = (
  func: Parameters<typeof mutationFnHardDeleteMyRoutineById>[1]
) =>
  useMutation({
    mutationFn: (
      request: Parameters<typeof mutationFnHardDeleteMyRoutineById>[0]
    ) => mutationFnHardDeleteMyRoutineById(request, func),
    onSuccess: invalidateRoutines,
  });

export const useHardDeleteMyRoutinesByIds = (
  func: Parameters<typeof mutationFnHardDeleteMyRoutinesByIds>[1]
) =>
  useMutation({
    mutationFn: (
      request: Parameters<typeof mutationFnHardDeleteMyRoutinesByIds>[0]
    ) => mutationFnHardDeleteMyRoutinesByIds(request, func),
    onSuccess: invalidateRoutines,
  });
