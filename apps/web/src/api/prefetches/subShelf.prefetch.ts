import {
  GetMySubShelvesByRootShelfIdRequest,
  GetMySubShelfByIdRequest,
  GetMySubShelvesByPrevSubShelfIdRequest,
} from "@shared/api/interfaces/subShelf.interface";
import {
  queryFnGetMySubShelvesByRootShelfId,
  queryFnGetMySubShelfById,
  queryFnGetMySubShelvesByPrevSubShelfId,
} from "@/api/invokers/subShelf.invoker";
import { getQueryClient } from "@shared/api/queryClient";
import { PrefetchQueryDefaultOptions } from "@shared/api/queryHookOptions";
import { queryKeys } from "@shared/api/queryKeys";
import { QueryClient } from "@tanstack/react-query";
import type { UUID } from "crypto";

export const prefetchGetMySubShelfById = (initialQueryClient?: QueryClient) => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const prefetchQuery = async (
    prefetchRequest: GetMySubShelfByIdRequest
  ): Promise<void> => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.subShelf.oneById(
        prefetchRequest.param.subShelfId as UUID,
        prefetchRequest.param.isDeleted ?? false
      ),
      queryFn: async () => await queryFnGetMySubShelfById(prefetchRequest),
      staleTime: PrefetchQueryDefaultOptions.staleTime as number,
    });
  };

  return {
    prefetchQuery: prefetchQuery,
    nextQueryClient: queryClient,
    name: "GET_MY_SUB_SHELF_BY_ID_PREFETCH" as const,
  };
};

export const prefetchGetMySubShelvesByPrevSubShelfId = (
  initialQueryClient?: QueryClient
) => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const prefetchQuery = async (
    prefetchRequest: GetMySubShelvesByPrevSubShelfIdRequest
  ): Promise<void> => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.subShelf.manyByPrevSubShelfId(
        prefetchRequest.param.prevSubShelfId as UUID,
        prefetchRequest.param.areDeleted ?? false
      ),
      queryFn: async () =>
        await queryFnGetMySubShelvesByPrevSubShelfId(prefetchRequest),
      staleTime: PrefetchQueryDefaultOptions.staleTime as number,
    });
  };

  return {
    prefetchQuery: prefetchQuery,
    nextQueryClient: queryClient,
    name: "GET_MY_SUB_SHELVES_BY_PREV_SUB_SHELF_ID_PREFETCH" as const,
  };
};

export const prefetchGetMySubShelvesByRootShelfId = (
  initialQueryClient?: QueryClient
) => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const prefetchQuery = async (
    prefetchRequest: GetMySubShelvesByRootShelfIdRequest
  ): Promise<void> => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.subShelf.manyByRootShelfId(
        prefetchRequest.param.rootShelfId as UUID,
        prefetchRequest.param.areDeleted ?? false
      ),
      queryFn: async () =>
        await queryFnGetMySubShelvesByRootShelfId(prefetchRequest),
      staleTime: PrefetchQueryDefaultOptions.staleTime as number,
    });
  };

  return {
    prefetchQuery: prefetchQuery,
    nextQueryClient: queryClient,
    name: "GET_ALL_MY_SUB_SHELVES_BY_ROOT_SHELF_ID_PREFETCH" as const,
  };
};
