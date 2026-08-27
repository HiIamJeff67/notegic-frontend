import type { UUID } from "node:crypto";
import type {
  GetAllMyBlockPacksByRootShelfIdRequest,
  GetAllMyBlockPacksByRootShelfIdResponse,
  GetMyBlockPackAndItsParentByIdRequest,
  GetMyBlockPackAndItsParentByIdResponse,
  GetMyBlockPackByIdRequest,
  GetMyBlockPackByIdResponse,
  GetMyBlockPacksByParentSubShelfIdRequest,
  GetMyBlockPacksByParentSubShelfIdResponse,
} from "@shared/api/interfaces/blockPack.interface";
import {
  queryFnGetAllMyBlockPacksByRootShelfId,
  queryFnGetMyBlockPackAndItsParentById,
  queryFnGetMyBlockPackById,
  queryFnGetMyBlockPacksByParentSubShelfId,
} from "@/api/invokers/blockPack.invoker";
import { getQueryClient } from "@shared/api/queryClient";
import { QueryAsyncDefaultOptions } from "@shared/api/queryHookOptions";
import { queryKeys } from "@shared/api/queryKeys";
import type { FetchQueryOptions, QueryClient } from "@tanstack/react-query";

export const fetchGetMyBlockPackById = async (
  fetchRequest: GetMyBlockPackByIdRequest,
  initialQueryClient?: QueryClient,
  options?: Partial<FetchQueryOptions>
): Promise<GetMyBlockPackByIdResponse> => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const response = await queryClient.fetchQuery({
    queryKey: queryKeys.blockPack.oneById(
      fetchRequest.param.blockPackId as UUID
    ),
    queryFn: async () => await queryFnGetMyBlockPackById(fetchRequest),
    staleTime: QueryAsyncDefaultOptions.staleTime as number,
    ...options,
  });

  return response as GetMyBlockPackByIdResponse;
};

export const fetchGetMyBlockPackAndItsParentById = async (
  fetchRequest: GetMyBlockPackAndItsParentByIdRequest,
  initialQueryClient?: QueryClient,
  options?: Partial<FetchQueryOptions>
): Promise<GetMyBlockPackAndItsParentByIdResponse> => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const response = await queryClient.fetchQuery({
    queryKey: queryKeys.blockPack.oneById(
      fetchRequest.param.blockPackId as UUID
    ),
    queryFn: async () =>
      await queryFnGetMyBlockPackAndItsParentById(fetchRequest),
    staleTime: QueryAsyncDefaultOptions.staleTime as number,
    ...options,
  });

  return response as GetMyBlockPackAndItsParentByIdResponse;
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

export const fetchGetAllMyBlockPacksByRootShelfId = async (
  fetchRequest: GetAllMyBlockPacksByRootShelfIdRequest,
  initialQueryClient?: QueryClient,
  options?: Partial<FetchQueryOptions>
): Promise<GetAllMyBlockPacksByRootShelfIdResponse> => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const response = await queryClient.fetchQuery({
    queryKey: queryKeys.blockPack.manyByRootShelfId(
      fetchRequest.param.rootShelfId as UUID
    ),
    queryFn: async () =>
      await queryFnGetAllMyBlockPacksByRootShelfId(fetchRequest),
    staleTime: QueryAsyncDefaultOptions.staleTime as number,
    ...options,
  });

  return response as GetAllMyBlockPacksByRootShelfIdResponse;
};
