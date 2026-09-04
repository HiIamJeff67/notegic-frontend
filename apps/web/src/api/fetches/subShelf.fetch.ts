import type { UUID } from "node:crypto";
import type {
  GetMySubShelvesByRootShelfIdRequest,
  GetMySubShelvesByRootShelfIdResponse,
  GetMySubShelfByIdRequest,
  GetMySubShelfByIdResponse,
  GetMySubShelvesAndItemsByPrevSubShelfIdRequest,
  GetMySubShelvesAndItemsByPrevSubShelfIdResponse,
  GetMySubShelvesByPrevSubShelfIdRequest,
  GetMySubShelvesByPrevSubShelfIdResponse,
} from "@shared/api/interfaces/subShelf.interface";
import {
  queryFnGetMySubShelvesByRootShelfId,
  queryFnGetMySubShelfById,
  queryFnGetMySubShelvesAndItemsByPrevSubShelfId,
  queryFnGetMySubShelvesByPrevSubShelfId,
} from "@/api/invokers/subShelf.invoker";
import { getQueryClient } from "@shared/api/queryClient";
import { QueryAsyncDefaultOptions } from "@shared/api/queryHookOptions";
import { queryKeys } from "@shared/api/queryKeys";
import type { FetchQueryOptions, QueryClient } from "@tanstack/react-query";

export const fetchGetMySubShelfById = async (
  fetchRequest: GetMySubShelfByIdRequest,
  initialQueryClient?: QueryClient,
  options?: Partial<FetchQueryOptions>
): Promise<GetMySubShelfByIdResponse> => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const response = await queryClient.fetchQuery({
    queryKey: queryKeys.subShelf.oneById(fetchRequest.param.subShelfId as UUID),
    queryFn: async () => await queryFnGetMySubShelfById(fetchRequest),
    staleTime: QueryAsyncDefaultOptions.staleTime as number,
    ...options,
  });

  return response as GetMySubShelfByIdResponse;
};

export const fetchGetMySubShelvesByPrevSubShelfId = async (
  fetchRequest: GetMySubShelvesByPrevSubShelfIdRequest,
  initialQueryClient?: QueryClient,
  options?: Partial<FetchQueryOptions>
): Promise<GetMySubShelvesByPrevSubShelfIdResponse> => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const response = await queryClient.fetchQuery({
    queryKey: queryKeys.subShelf.manyByPrevSubShelfId(
      fetchRequest.param.prevSubShelfId as UUID
    ),
    queryFn: async () =>
      await queryFnGetMySubShelvesByPrevSubShelfId(fetchRequest),
    staleTime: QueryAsyncDefaultOptions.staleTime as number,
    ...options,
  });

  return response as GetMySubShelvesByPrevSubShelfIdResponse;
};

export const fetchGetMySubShelvesByRootShelfId = async (
  fetchRequest: GetMySubShelvesByRootShelfIdRequest,
  initialQueryClient?: QueryClient,
  options?: Partial<FetchQueryOptions>
): Promise<GetMySubShelvesByRootShelfIdResponse> => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const response = await queryClient.fetchQuery({
    queryKey: queryKeys.subShelf.manyByRootShelfId(
      fetchRequest.param.rootShelfId as UUID
    ),
    queryFn: async () =>
      await queryFnGetMySubShelvesByRootShelfId(fetchRequest),
    staleTime: QueryAsyncDefaultOptions.staleTime as number,
    ...options,
  });

  return response as GetMySubShelvesByRootShelfIdResponse;
};

export const fetchGetMySubShelvesAndItemsByPrevSubShelfId = async (
  fetchRequest: GetMySubShelvesAndItemsByPrevSubShelfIdRequest,
  initialQueryClient?: QueryClient,
  options?: Partial<FetchQueryOptions>
): Promise<GetMySubShelvesAndItemsByPrevSubShelfIdResponse> => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const response = await queryClient.fetchQuery({
    queryKey: queryKeys.subShelf.manyByPrevSubShelfId(
      fetchRequest.param.prevSubShelfId as UUID
    ),
    queryFn: async () =>
      await queryFnGetMySubShelvesAndItemsByPrevSubShelfId(fetchRequest),
    staleTime: QueryAsyncDefaultOptions.staleTime as number,
    ...options,
  });

  return response as GetMySubShelvesAndItemsByPrevSubShelfIdResponse;
};
