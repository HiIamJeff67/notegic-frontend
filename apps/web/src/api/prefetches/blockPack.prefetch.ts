import {
  GetMyBlockPacksByRootShelfIdRequest,
  GetMyBlockPackAndItsParentByIdRequest,
  GetMyBlockPackByIdRequest,
  GetMyBlockPacksByParentSubShelfIdRequest,
} from "@shared/api/interfaces/blockPack.interface";
import {
  queryFnGetMyBlockPacksByRootShelfId,
  queryFnGetMyBlockPackAndItsParentById,
  queryFnGetMyBlockPackById,
  queryFnGetMyBlockPacksByParentSubShelfId,
} from "@/api/invokers/blockPack.invoker";
import { getQueryClient } from "@shared/api/queryClient";
import { PrefetchQueryDefaultOptions } from "@shared/api/queryHookOptions";
import { queryKeys } from "@shared/api/queryKeys";
import { QueryClient } from "@tanstack/react-query";
import type { UUID } from "crypto";

export const prefetchGetMyBlockPackById = (
  initialQueryClient?: QueryClient
) => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const prefetchQuery = async (
    prefetchRequest: GetMyBlockPackByIdRequest
  ): Promise<void> => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.blockPack.oneById(
        prefetchRequest.param.blockPackId as UUID,
        false,
        prefetchRequest.param.isDeleted ?? false
      ),
      queryFn: async () => await queryFnGetMyBlockPackById(prefetchRequest),
      staleTime: PrefetchQueryDefaultOptions.staleTime as number,
    });
  };

  return {
    prefetchQuery: prefetchQuery,
    nextQueryClient: queryClient,
    name: "GET_MY_BLOCK_PACK_BY_ID_PREFETCH" as const,
  };
};

export const prefetchGetMyBlockPackAndItsParentById = (
  initialQueryClient?: QueryClient
) => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const prefetchQuery = async (
    prefetchRequest: GetMyBlockPackAndItsParentByIdRequest
  ): Promise<void> => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.blockPack.oneById(
        prefetchRequest.param.blockPackId as UUID,
        true,
        prefetchRequest.param.isDeleted ?? false
      ),
      queryFn: async () =>
        await queryFnGetMyBlockPackAndItsParentById(prefetchRequest),
      staleTime: PrefetchQueryDefaultOptions.staleTime as number,
    });
  };

  return {
    prefetchQuery: prefetchQuery,
    nextQueryClient: queryClient,
    name: "GET_MY_BLOCK_PACK_AND_ITS_PARENT_BY_ID_PREFETCH" as const,
  };
};

export const prefetchGetMyBlockPacksByParentSubShelfId = (
  initialQueryClient?: QueryClient
) => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const prefetchQuery = async (
    prefetchRequest: GetMyBlockPacksByParentSubShelfIdRequest
  ): Promise<void> => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.blockPack.manyByParentSubShelfId(
        prefetchRequest.param.parentSubShelfId as UUID,
        prefetchRequest.param.areDeleted ?? false
      ),
      queryFn: async () =>
        await queryFnGetMyBlockPacksByParentSubShelfId(prefetchRequest),
      staleTime: PrefetchQueryDefaultOptions.staleTime as number,
    });
  };

  return {
    prefetchQuery: prefetchQuery,
    nextQueryClient: queryClient,
    name: "GET_MY_BLOCK_PACKS_BY_PARENT_SUB_SHELF_ID_PREFETCH" as const,
  };
};

export const prefetchGetMyBlockPacksByRootShelfId = (
  initialQueryClient?: QueryClient
) => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const prefetchQuery = async (
    prefetchRequest: GetMyBlockPacksByRootShelfIdRequest
  ): Promise<void> => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.blockPack.manyByRootShelfId(
        prefetchRequest.param.rootShelfId as UUID,
        prefetchRequest.param.areDeleted ?? false
      ),
      queryFn: async () =>
        await queryFnGetMyBlockPacksByRootShelfId(prefetchRequest),
      staleTime: PrefetchQueryDefaultOptions.staleTime as number,
    });
  };

  return {
    prefetchQuery: prefetchQuery,
    nextQueryClient: queryClient,
    name: "GET_ALL_MY_BLOCK_PACKS_BY_ROOT_SHELF_ID_PREFETCH" as const,
  };
};
