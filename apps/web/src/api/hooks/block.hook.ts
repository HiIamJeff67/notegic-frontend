import type { UUID } from "node:crypto";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import type {
  GetMyBlockByIdRequest,
  GetMyBlockByIdResponse,
  GetMyBlocksByBlockPackIdRequest,
  GetMyBlocksByBlockPackIdResponse,
  GetMyBlocksByIdsRequest,
  GetMyBlocksByIdsResponse,
} from "@shared/api/interfaces/block.interface";
import { duplicateResponse } from "@shared/api/interfaces/context.interface";
import { getQueryClient } from "@shared/api/queryClient";
import { UseQueryDefaultOptions } from "@shared/api/queryHookOptions";
import { queryKeys } from "@shared/api/queryKeys";
import { type UseQueryOptions, useQuery } from "@tanstack/react-query";
import {
  queryFnGetMyBlockById,
  queryFnGetMyBlocksByBlockPackId,
  queryFnGetMyBlocksByIds,
} from "@/api/invokers/block.invoker";

export const useGetMyBlockById = (
  hookRequest?: GetMyBlockByIdRequest,
  options?: Partial<UseQueryOptions<GetMyBlockByIdResponse, Error>>
) => {
  const queryClient = getQueryClient();
  const perform = async (
    request?: GetMyBlockByIdRequest
  ): Promise<GetMyBlockByIdResponse> => {
    if (!request) {
      throw new NotegicValidationError(
        ValidationClientException.ReceivedUndefinedRequest()
      );
    }

    const response = await queryFnGetMyBlockById(request);
    return response;
  };

  const query = useQuery<GetMyBlockByIdResponse, Error>({
    queryKey: queryKeys.block.oneById(
      hookRequest?.param.blockId as UUID | undefined
    ),
    queryFn: async () => perform(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    networkMode: "always",
    ...options,
    enabled: hookRequest ? (options?.enabled ?? true) : false,
  });

  const fetch = async (callbackRequest: GetMyBlockByIdRequest) =>
    queryClient.fetchQuery({
      queryKey: queryKeys.block.oneById(
        callbackRequest.param.blockId as UUID | undefined
      ),
      queryFn: async () => perform(callbackRequest),
      staleTime: UseQueryDefaultOptions.staleTime,
      networkMode: "always",
      ...options,
    });

  return { ...query, fetch };
};

export const useGetMyBlocksByIds = (
  hookRequest?: GetMyBlocksByIdsRequest,
  options?: Partial<UseQueryOptions<GetMyBlocksByIdsResponse, Error>>
) => {
  const queryClient = getQueryClient();
  const perform = async (
    request?: GetMyBlocksByIdsRequest
  ): Promise<GetMyBlocksByIdsResponse> => {
    if (!request) {
      throw new NotegicValidationError(
        ValidationClientException.ReceivedUndefinedRequest()
      );
    }

    const response = await queryFnGetMyBlocksByIds(request);
    if (response.success && response.data) {
      response.data.forEach(block => {
        queryClient.setQueriesData(
          { queryKey: queryKeys.block.oneById(block.id as UUID) },
          duplicateResponse(response, true, block)
        );
      });
    }
    return response;
  };

  const query = useQuery<GetMyBlocksByIdsResponse, Error>({
    queryKey: queryKeys.block.manyByIds(
      hookRequest?.param.blockIds as UUID[] | undefined
    ),
    queryFn: async () => perform(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    networkMode: "always",
    ...options,
    enabled: hookRequest ? (options?.enabled ?? true) : false,
  });

  const fetch = async (callbackRequest: GetMyBlocksByIdsRequest) =>
    queryClient.fetchQuery({
      queryKey: queryKeys.block.manyByIds(
        callbackRequest.param.blockIds as UUID[] | undefined
      ),
      queryFn: async () => perform(callbackRequest),
      staleTime: UseQueryDefaultOptions.staleTime,
      networkMode: "always",
      ...options,
    });

  return { ...query, fetch };
};

export const useGetMyBlocksByBlockPackId = (
  hookRequest?: GetMyBlocksByBlockPackIdRequest,
  options?: Partial<UseQueryOptions<GetMyBlocksByBlockPackIdResponse, Error>>
) => {
  const queryClient = getQueryClient();
  const perform = async (
    request?: GetMyBlocksByBlockPackIdRequest
  ): Promise<GetMyBlocksByBlockPackIdResponse> => {
    if (!request) {
      throw new NotegicValidationError(
        ValidationClientException.ReceivedUndefinedRequest()
      );
    }

    const response = await queryFnGetMyBlocksByBlockPackId(request);
    return response;
  };

  const query = useQuery<GetMyBlocksByBlockPackIdResponse, Error>({
    queryKey: queryKeys.block.manyByBlockPackId(
      hookRequest?.param.blockPackId as UUID | undefined
    ),
    queryFn: async () => perform(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    networkMode: "always",
    ...options,
    enabled: hookRequest ? (options?.enabled ?? true) : false,
  });

  const fetch = async (callbackRequest: GetMyBlocksByBlockPackIdRequest) =>
    queryClient.fetchQuery({
      queryKey: queryKeys.block.manyByBlockPackId(
        callbackRequest.param.blockPackId as UUID | undefined
      ),
      queryFn: async () => perform(callbackRequest),
      staleTime: UseQueryDefaultOptions.staleTime,
      networkMode: "always",
      ...options,
    });

  return { ...query, fetch };
};
