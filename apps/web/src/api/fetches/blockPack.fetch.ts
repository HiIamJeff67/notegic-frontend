import type { UUID } from "node:crypto";
import type {
  GetMyBlockPackByIdRequest,
  GetMyBlockPackByIdResponse,
  GetMyBlockPacksByParentSubShelfIdRequest,
  GetMyBlockPacksByParentSubShelfIdResponse,
  GetMyBlockPacksByRootShelfIdRequest,
  GetMyBlockPacksByRootShelfIdResponse,
} from "@shared/api/interfaces/blockPack.interface";
import { getQueryClient } from "@shared/api/queryClient";
import { QueryAsyncDefaultOptions } from "@shared/api/queryHookOptions";
import { queryKeys } from "@shared/api/queryKeys";
import type { FetchQueryOptions, QueryClient } from "@tanstack/react-query";
import {
  queryFnGetMyBlockPackById,
  queryFnGetMyBlockPacksByParentSubShelfId,
  queryFnGetMyBlockPacksByRootShelfId,
} from "@/api/invokers/blockPack.invoker";

export const fetchGetMyBlockPackById = async (
  fetchRequest: GetMyBlockPackByIdRequest,
  initialQueryClient?: QueryClient,
  options?: Partial<FetchQueryOptions>
): Promise<GetMyBlockPackByIdResponse> => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const response = await queryClient.fetchQuery({
    queryKey: queryKeys.blockPack.oneById(
      fetchRequest.param.blockPackId as UUID,
      fetchRequest.param.isDeleted ?? false
    ),
    queryFn: async () => await queryFnGetMyBlockPackById(fetchRequest),
    staleTime: QueryAsyncDefaultOptions.staleTime as number,
    ...options,
  });

  return response as GetMyBlockPackByIdResponse;
};

export const fetchGetMyBlockPacksByParentSubShelfId = async (
  fetchRequest: GetMyBlockPacksByParentSubShelfIdRequest,
  initialQueryClient?: QueryClient,
  options?: Partial<FetchQueryOptions>
): Promise<GetMyBlockPacksByParentSubShelfIdResponse> => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const response = await queryClient.fetchQuery({
    queryKey: queryKeys.blockPack.manyByParentSubShelfId(
      fetchRequest.param.parentSubShelfId as UUID
    ),
    queryFn: async () =>
      await queryFnGetMyBlockPacksByParentSubShelfId(fetchRequest),
    staleTime: QueryAsyncDefaultOptions.staleTime as number,
    ...options,
  });

  return response as GetMyBlockPacksByParentSubShelfIdResponse;
};

export const fetchGetMyBlockPacksByRootShelfId = async (
  fetchRequest: GetMyBlockPacksByRootShelfIdRequest,
  initialQueryClient?: QueryClient,
  options?: Partial<FetchQueryOptions>
): Promise<GetMyBlockPacksByRootShelfIdResponse> => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const response = await queryClient.fetchQuery({
    queryKey: queryKeys.blockPack.manyByRootShelfId(
      fetchRequest.param.rootShelfId as UUID
    ),
    queryFn: async () =>
      await queryFnGetMyBlockPacksByRootShelfId(fetchRequest),
    staleTime: QueryAsyncDefaultOptions.staleTime as number,
    ...options,
  });

  return response as GetMyBlockPacksByRootShelfIdResponse;
};
