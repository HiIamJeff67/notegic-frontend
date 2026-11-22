import {
  queryFnGetMyRoutineTaskRecordsByRoutineTaskId,
  queryFnVisualizeMyRoutineTaskRecordActualEndedAtCount,
  queryFnVisualizeMyRoutineTaskRecordActualStartedAtCount,
  queryFnVisualizeMyRoutineTaskRecordPurposeCount,
  queryFnVisualizeMyRoutineTaskRecordScheduledAtCount,
  queryFnVisualizeMyRoutineTaskRecordStatusCount,
} from "@shared/api/invokers/routineTaskRecord.invoker";
import { UseQueryDefaultOptions } from "@shared/api/queryHookOptions";
import { queryKeys } from "@shared/api/queryKeys";
import { useQuery } from "@tanstack/react-query";
import type { UUID } from "crypto";

const queryOptions = {
  staleTime: UseQueryDefaultOptions.staleTime,
  refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
  refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
};

export const useVisualizeMyRoutineTaskRecordStatusCount = (
  func: Parameters<typeof queryFnVisualizeMyRoutineTaskRecordStatusCount>[1],
  request?: Parameters<typeof queryFnVisualizeMyRoutineTaskRecordStatusCount>[0]
) =>
  useQuery({
    queryKey: queryKeys.routineTaskRecord.visualizeMyStatusCount(
      request?.param.permission
    ),
    enabled: request !== undefined,
    queryFn: () =>
      queryFnVisualizeMyRoutineTaskRecordStatusCount(
        request as Parameters<
          typeof queryFnVisualizeMyRoutineTaskRecordStatusCount
        >[0],
        func
      ),
    ...queryOptions,
  });

export const useVisualizeMyRoutineTaskRecordPurposeCount = (
  func: Parameters<typeof queryFnVisualizeMyRoutineTaskRecordPurposeCount>[1],
  request?: Parameters<
    typeof queryFnVisualizeMyRoutineTaskRecordPurposeCount
  >[0]
) =>
  useQuery({
    queryKey: queryKeys.routineTaskRecord.visualizeMyPurposeCount(
      request?.param.permission
    ),
    enabled: request !== undefined,
    queryFn: () =>
      queryFnVisualizeMyRoutineTaskRecordPurposeCount(
        request as Parameters<
          typeof queryFnVisualizeMyRoutineTaskRecordPurposeCount
        >[0],
        func
      ),
    ...queryOptions,
  });

export const useVisualizeMyRoutineTaskRecordScheduledAtCount = (
  func: Parameters<
    typeof queryFnVisualizeMyRoutineTaskRecordScheduledAtCount
  >[1],
  request?: Parameters<
    typeof queryFnVisualizeMyRoutineTaskRecordScheduledAtCount
  >[0]
) =>
  useQuery({
    queryKey: queryKeys.routineTaskRecord.visualizeMyScheduledAtCount(
      request?.param.permission,
      request?.param.timeHourUnit,
      request?.param.queryRangeStartedAt,
      request?.param.queryRangeEndedAt
    ),
    enabled: request !== undefined,
    queryFn: () =>
      queryFnVisualizeMyRoutineTaskRecordScheduledAtCount(
        request as Parameters<
          typeof queryFnVisualizeMyRoutineTaskRecordScheduledAtCount
        >[0],
        func
      ),
    ...queryOptions,
  });

export const useVisualizeMyRoutineTaskRecordActualStartedAtCount = (
  func: Parameters<
    typeof queryFnVisualizeMyRoutineTaskRecordActualStartedAtCount
  >[1],
  request?: Parameters<
    typeof queryFnVisualizeMyRoutineTaskRecordActualStartedAtCount
  >[0]
) =>
  useQuery({
    queryKey: queryKeys.routineTaskRecord.visualizeMyActualStartedAtCount(
      request?.param.permission,
      request?.param.timeHourUnit,
      request?.param.queryRangeStartedAt,
      request?.param.queryRangeEndedAt
    ),
    enabled: request !== undefined,
    queryFn: () =>
      queryFnVisualizeMyRoutineTaskRecordActualStartedAtCount(
        request as Parameters<
          typeof queryFnVisualizeMyRoutineTaskRecordActualStartedAtCount
        >[0],
        func
      ),
    ...queryOptions,
  });

export const useVisualizeMyRoutineTaskRecordActualEndedAtCount = (
  func: Parameters<
    typeof queryFnVisualizeMyRoutineTaskRecordActualEndedAtCount
  >[1],
  request?: Parameters<
    typeof queryFnVisualizeMyRoutineTaskRecordActualEndedAtCount
  >[0]
) =>
  useQuery({
    queryKey: queryKeys.routineTaskRecord.visualizeMyActualEndedAtCount(
      request?.param.permission,
      request?.param.timeHourUnit,
      request?.param.queryRangeStartedAt,
      request?.param.queryRangeEndedAt
    ),
    enabled: request !== undefined,
    queryFn: () =>
      queryFnVisualizeMyRoutineTaskRecordActualEndedAtCount(
        request as Parameters<
          typeof queryFnVisualizeMyRoutineTaskRecordActualEndedAtCount
        >[0],
        func
      ),
    ...queryOptions,
  });

export const useGetMyRoutineTaskRecordsByRoutineTaskId = (
  func: Parameters<typeof queryFnGetMyRoutineTaskRecordsByRoutineTaskId>[1],
  request?: Parameters<typeof queryFnGetMyRoutineTaskRecordsByRoutineTaskId>[0]
) =>
  useQuery({
    queryKey: queryKeys.routineTaskRecord.recentByRoutineTaskId(
      request?.param.routineTaskId as UUID | undefined,
      request?.param.limit
    ),
    enabled: Boolean(request?.param.routineTaskId),
    queryFn: () =>
      queryFnGetMyRoutineTaskRecordsByRoutineTaskId(
        request as Parameters<
          typeof queryFnGetMyRoutineTaskRecordsByRoutineTaskId
        >[0],
        func
      ),
    ...queryOptions,
  });
