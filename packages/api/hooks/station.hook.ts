import {
  mutationFnCreateStation,
  mutationFnCreateStations,
  mutationFnDeleteMyStationById,
  mutationFnDeleteMyStationsByIds,
  mutationFnHardDeleteMyStationById,
  mutationFnHardDeleteMyStationsByIds,
  mutationFnLeaveMyStation,
  mutationFnRestoreMyStationById,
  mutationFnRestoreMyStationsByIds,
  mutationFnTransferMyStationOwnership,
  mutationFnUpdateMyStationById,
  mutationFnUpdateMyStationsByIds,
  queryFnGetAllMyStations,
  queryFnGetMyStationById,
  queryFnVisualizeMyTotalCount,
} from "@shared/api/invokers/station.invoker";
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

const invalidateStations = () => {
  void getQueryClient().invalidateQueries({
    queryKey: queryKeys.station.all(),
  });
};

export const useVisualizeMyTotalCount = (
  func: Parameters<typeof queryFnVisualizeMyTotalCount>[1],
  request?: Parameters<typeof queryFnVisualizeMyTotalCount>[0]
) =>
  useQuery({
    queryKey: queryKeys.station.visualizeMyTotalCount(
      request?.param.permission
    ),
    enabled: request !== undefined,
    queryFn: () =>
      queryFnVisualizeMyTotalCount(
        request as Parameters<typeof queryFnVisualizeMyTotalCount>[0],
        func
      ),
    ...queryOptions,
  });

export const useGetMyStationById = (
  func: Parameters<typeof queryFnGetMyStationById>[1],
  request?: Parameters<typeof queryFnGetMyStationById>[0]
) =>
  useQuery({
    queryKey: queryKeys.station.oneById(
      request?.param.stationId as UUID | undefined,
      request?.param.isDeleted ?? false
    ),
    enabled: Boolean(request?.param.stationId),
    queryFn: () =>
      queryFnGetMyStationById(
        request as Parameters<typeof queryFnGetMyStationById>[0],
        func
      ),
    ...queryOptions,
  });

export const useGetAllMyStations = (
  func: Parameters<typeof queryFnGetAllMyStations>[1],
  request?: Parameters<typeof queryFnGetAllMyStations>[0]
) =>
  useQuery({
    queryKey: queryKeys.station.myAll(request?.param?.areDeleted ?? false),
    enabled: request !== undefined,
    queryFn: () =>
      queryFnGetAllMyStations(
        request as Parameters<typeof queryFnGetAllMyStations>[0],
        func
      ),
    ...queryOptions,
  });

export const useCreateStation = (
  func: Parameters<typeof mutationFnCreateStation>[1]
) =>
  useMutation({
    mutationFn: (request: Parameters<typeof mutationFnCreateStation>[0]) =>
      mutationFnCreateStation(request, func),
    onSuccess: invalidateStations,
  });

export const useCreateStations = (
  func: Parameters<typeof mutationFnCreateStations>[1]
) =>
  useMutation({
    mutationFn: (request: Parameters<typeof mutationFnCreateStations>[0]) =>
      mutationFnCreateStations(request, func),
    onSuccess: invalidateStations,
  });

export const useUpdateMyStationById = (
  func: Parameters<typeof mutationFnUpdateMyStationById>[1]
) =>
  useMutation({
    mutationFn: (
      request: Parameters<typeof mutationFnUpdateMyStationById>[0]
    ) => mutationFnUpdateMyStationById(request, func),
    onSuccess: invalidateStations,
  });

export const useUpdateMyStationsByIds = (
  func: Parameters<typeof mutationFnUpdateMyStationsByIds>[1]
) =>
  useMutation({
    mutationFn: (
      request: Parameters<typeof mutationFnUpdateMyStationsByIds>[0]
    ) => mutationFnUpdateMyStationsByIds(request, func),
    onSuccess: invalidateStations,
  });

export const useRestoreMyStationById = (
  func: Parameters<typeof mutationFnRestoreMyStationById>[1]
) =>
  useMutation({
    mutationFn: (
      request: Parameters<typeof mutationFnRestoreMyStationById>[0]
    ) => mutationFnRestoreMyStationById(request, func),
    onSuccess: invalidateStations,
  });

export const useRestoreMyStationsByIds = (
  func: Parameters<typeof mutationFnRestoreMyStationsByIds>[1]
) =>
  useMutation({
    mutationFn: (
      request: Parameters<typeof mutationFnRestoreMyStationsByIds>[0]
    ) => mutationFnRestoreMyStationsByIds(request, func),
    onSuccess: invalidateStations,
  });

export const useDeleteMyStationById = (
  func: Parameters<typeof mutationFnDeleteMyStationById>[1]
) =>
  useMutation({
    mutationFn: (
      request: Parameters<typeof mutationFnDeleteMyStationById>[0]
    ) => mutationFnDeleteMyStationById(request, func),
    onSuccess: invalidateStations,
  });

export const useDeleteMyStationsByIds = (
  func: Parameters<typeof mutationFnDeleteMyStationsByIds>[1]
) =>
  useMutation({
    mutationFn: (
      request: Parameters<typeof mutationFnDeleteMyStationsByIds>[0]
    ) => mutationFnDeleteMyStationsByIds(request, func),
    onSuccess: invalidateStations,
  });

export const useHardDeleteMyStationById = (
  func: Parameters<typeof mutationFnHardDeleteMyStationById>[1]
) =>
  useMutation({
    mutationFn: (
      request: Parameters<typeof mutationFnHardDeleteMyStationById>[0]
    ) => mutationFnHardDeleteMyStationById(request, func),
    onSuccess: invalidateStations,
  });

export const useHardDeleteMyStationsByIds = (
  func: Parameters<typeof mutationFnHardDeleteMyStationsByIds>[1]
) =>
  useMutation({
    mutationFn: (
      request: Parameters<typeof mutationFnHardDeleteMyStationsByIds>[0]
    ) => mutationFnHardDeleteMyStationsByIds(request, func),
    onSuccess: invalidateStations,
  });

export const useTransferMyStationOwnership = (
  func: Parameters<typeof mutationFnTransferMyStationOwnership>[1]
) =>
  useMutation({
    mutationFn: (
      request: Parameters<typeof mutationFnTransferMyStationOwnership>[0]
    ) => mutationFnTransferMyStationOwnership(request, func),
    onSuccess: invalidateStations,
  });

export const useLeaveMyStation = (
  func: Parameters<typeof mutationFnLeaveMyStation>[1]
) =>
  useMutation({
    mutationFn: (request: Parameters<typeof mutationFnLeaveMyStation>[0]) =>
      mutationFnLeaveMyStation(request, func),
    onSuccess: invalidateStations,
  });
