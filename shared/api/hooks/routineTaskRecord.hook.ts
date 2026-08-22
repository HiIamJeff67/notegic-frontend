import type { UUID } from "node:crypto";
import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import { NotegicAPIError } from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import type {
  GetAllMyRoutineTaskRecordsByRoutineTaskIdRequest,
  GetAllMyRoutineTaskRecordsByRoutineTaskIdResponse,
  VisualizeMyRoutineTaskRecordActualEndedAtCountRequest,
  VisualizeMyRoutineTaskRecordActualEndedAtCountResponse,
  VisualizeMyRoutineTaskRecordActualStartedAtCountRequest,
  VisualizeMyRoutineTaskRecordActualStartedAtCountResponse,
  VisualizeMyRoutineTaskRecordPurposeCountRequest,
  VisualizeMyRoutineTaskRecordPurposeCountResponse,
  VisualizeMyRoutineTaskRecordScheduledAtCountRequest,
  VisualizeMyRoutineTaskRecordScheduledAtCountResponse,
  VisualizeMyRoutineTaskRecordStatusCountRequest,
  VisualizeMyRoutineTaskRecordStatusCountResponse,
} from "@shared/api/interfaces/routineTaskRecord.interface";
import {
  queryFnGetAllMyRoutineTaskRecordsByRoutineTaskId,
  queryFnVisualizeMyRoutineTaskRecordActualEndedAtCount,
  queryFnVisualizeMyRoutineTaskRecordActualStartedAtCount,
  queryFnVisualizeMyRoutineTaskRecordPurposeCount,
  queryFnVisualizeMyRoutineTaskRecordScheduledAtCount,
  queryFnVisualizeMyRoutineTaskRecordStatusCount,
} from "@shared/api/invokers/routineTaskRecord.invoker";
import { getQueryClient } from "@shared/api/queryClient";
import { UseQueryDefaultOptions } from "@shared/api/queryHookOptions";
import { queryKeys } from "@shared/api/queryKeys";

import { SessionStorageManipulator } from "@shared/lib/sessionStorageManipulator";

import { SessionStorageKey } from "@shared/types/sessionStorage.type";
import { type UseQueryOptions, useQuery } from "@tanstack/react-query";
import { useVisualizeQuery } from "./visualize.hook";

export const useVisualizeMyRoutineTaskRecordStatusCount = (
  request?: VisualizeMyRoutineTaskRecordStatusCountRequest,
  options?: Partial<
    UseQueryOptions<VisualizeMyRoutineTaskRecordStatusCountResponse, Error>
  >,
) =>
  useVisualizeQuery(
    request,
    (currentRequest) =>
      queryKeys.routineTaskRecord.visualizeMyStatusCount(
        currentRequest?.param.permission,
        currentRequest?.param.routineTaskIds as UUID[] | undefined,
      ),
    queryFnVisualizeMyRoutineTaskRecordStatusCount,
    options,
  );

export const useVisualizeMyRoutineTaskRecordPurposeCount = (
  request?: VisualizeMyRoutineTaskRecordPurposeCountRequest,
  options?: Partial<
    UseQueryOptions<VisualizeMyRoutineTaskRecordPurposeCountResponse, Error>
  >,
) =>
  useVisualizeQuery(
    request,
    (currentRequest) =>
      queryKeys.routineTaskRecord.visualizeMyPurposeCount(
        currentRequest?.param.permission,
        currentRequest?.param.routineTaskIds as UUID[] | undefined,
      ),
    queryFnVisualizeMyRoutineTaskRecordPurposeCount,
    options,
  );

export const useVisualizeMyRoutineTaskRecordScheduledAtCount = (
  request?: VisualizeMyRoutineTaskRecordScheduledAtCountRequest,
  options?: Partial<
    UseQueryOptions<VisualizeMyRoutineTaskRecordScheduledAtCountResponse, Error>
  >,
) =>
  useVisualizeQuery(
    request,
    (currentRequest) =>
      queryKeys.routineTaskRecord.visualizeMyScheduledAtCount(
        currentRequest?.param.permission,
        currentRequest?.param.timeHourUnit,
        currentRequest?.param.queryRangeStartedAt,
        currentRequest?.param.queryRangeEndedAt,
        currentRequest?.param.routineTaskIds as UUID[] | undefined,
      ),
    queryFnVisualizeMyRoutineTaskRecordScheduledAtCount,
    options,
  );

export const useVisualizeMyRoutineTaskRecordActualStartedAtCount = (
  request?: VisualizeMyRoutineTaskRecordActualStartedAtCountRequest,
  options?: Partial<
    UseQueryOptions<
      VisualizeMyRoutineTaskRecordActualStartedAtCountResponse,
      Error
    >
  >,
) =>
  useVisualizeQuery(
    request,
    (currentRequest) =>
      queryKeys.routineTaskRecord.visualizeMyActualStartedAtCount(
        currentRequest?.param.permission,
        currentRequest?.param.timeHourUnit,
        currentRequest?.param.queryRangeStartedAt,
        currentRequest?.param.queryRangeEndedAt,
        currentRequest?.param.routineTaskIds as UUID[] | undefined,
      ),
    queryFnVisualizeMyRoutineTaskRecordActualStartedAtCount,
    options,
  );

export const useVisualizeMyRoutineTaskRecordActualEndedAtCount = (
  request?: VisualizeMyRoutineTaskRecordActualEndedAtCountRequest,
  options?: Partial<
    UseQueryOptions<
      VisualizeMyRoutineTaskRecordActualEndedAtCountResponse,
      Error
    >
  >,
) =>
  useVisualizeQuery(
    request,
    (currentRequest) =>
      queryKeys.routineTaskRecord.visualizeMyActualEndedAtCount(
        currentRequest?.param.permission,
        currentRequest?.param.timeHourUnit,
        currentRequest?.param.queryRangeStartedAt,
        currentRequest?.param.queryRangeEndedAt,
        currentRequest?.param.routineTaskIds as UUID[] | undefined,
      ),
    queryFnVisualizeMyRoutineTaskRecordActualEndedAtCount,
    options,
  );

export const useGetAllMyRoutineTaskRecordsByRoutineTaskId = (
  hookRequest?: GetAllMyRoutineTaskRecordsByRoutineTaskIdRequest,
  options?: Partial<
    UseQueryOptions<GetAllMyRoutineTaskRecordsByRoutineTaskIdResponse, Error>
  >,
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request?: GetAllMyRoutineTaskRecordsByRoutineTaskIdRequest,
  ): Promise<GetAllMyRoutineTaskRecordsByRoutineTaskIdResponse> => {
    if (!request) {
      throw new NotegicValidationError(
        ValidationClientException.ReceivedUndefinedRequest(),
      );
    }

    try {
      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
      }

      const response =
        await queryFnGetAllMyRoutineTaskRecordsByRoutineTaskId(request);
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
      );
      return response;
    } catch (error) {
      if (
        error instanceof NotegicAPIError ||
        error instanceof NotegicFetchError
      ) {
        return {
          success: false,
          data: [],
          exception: error.unWrap,
          embedded: { publicId: "" },
        } as GetAllMyRoutineTaskRecordsByRoutineTaskIdResponse;
      }

      throw error;
    }
  };

  const query = useQuery<
    GetAllMyRoutineTaskRecordsByRoutineTaskIdResponse,
    Error
  >({
    queryKey: queryKeys.routineTaskRecord.recentByRoutineTaskId(
      hookRequest?.param.routineTaskId as UUID | undefined,
      hookRequest?.param.limit,
    ),
    queryFn: async () => perform(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: hookRequest ? (options?.enabled ?? true) : false,
  });

  const fetch = async (
    callbackRequest: GetAllMyRoutineTaskRecordsByRoutineTaskIdRequest,
  ): Promise<GetAllMyRoutineTaskRecordsByRoutineTaskIdResponse> =>
    queryClient.fetchQuery({
      queryKey: queryKeys.routineTaskRecord.recentByRoutineTaskId(
        callbackRequest.param.routineTaskId as UUID,
        callbackRequest.param.limit,
      ),
      queryFn: async () => perform(callbackRequest),
      staleTime: UseQueryDefaultOptions.staleTime,
      ...options,
    });

  return { ...query, fetch };
};
