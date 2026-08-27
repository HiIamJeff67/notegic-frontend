import {
  GetAllMyMaterialsByRootShelfIdRequest,
  GetMyMaterialByIdRequest,
  GetMyMaterialsByParentSubShelfIdRequest,
} from "@shared/api/interfaces/material.interface";
import {
  queryFnGetAllMyMaterialsByRootShelfId,
  queryFnGetMyMaterialAndItsParentById,
  queryFnGetMyMaterialById,
  queryFnGetMyMaterialsByParentSubShelfId,
} from "@/api/invokers/material.invoker";
import { getQueryClient } from "@shared/api/queryClient";
import { PrefetchQueryDefaultOptions } from "@shared/api/queryHookOptions";
import { queryKeys } from "@shared/api/queryKeys";
import { QueryClient } from "@tanstack/react-query";
import type { UUID } from "crypto";

export const prefetchGetMyMaterialById = (initialQueryClient?: QueryClient) => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const prefetchQuery = async (
    prefetchRequest: GetMyMaterialByIdRequest
  ): Promise<void> => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.material.oneById(
        prefetchRequest.param.materialId as UUID,
        false,
        prefetchRequest.param.isDeleted ?? false
      ),
      queryFn: async () => await queryFnGetMyMaterialById(prefetchRequest),
      staleTime: PrefetchQueryDefaultOptions.staleTime as number,
    });
  };

  return {
    prefetchQuery: prefetchQuery,
    nextQueryClient: queryClient,
    name: "GET_MY_MATERIAL_BY_ID_PREFETCH" as const,
  };
};

export const prefetchGetMyMaterialAndItsParentById = (
  initialQueryClient?: QueryClient
) => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const prefetchQuery = async (
    prefetchRequest: GetMyMaterialByIdRequest
  ): Promise<void> => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.material.oneById(
        prefetchRequest.param.materialId as UUID,
        true,
        prefetchRequest.param.isDeleted ?? false
      ),
      queryFn: async () =>
        await queryFnGetMyMaterialAndItsParentById(prefetchRequest),
      staleTime: PrefetchQueryDefaultOptions.staleTime as number,
    });
  };

  return {
    prefetchQuery: prefetchQuery,
    nextQueryClient: queryClient,
    name: "GET_MY_MATERIAL_AND_ITS_PARENT_BY_ID_PREFETCH" as const,
  };
};

export const prefetchGetMyMaterialsByParentSubShelfId = (
  initialQueryClient?: QueryClient
) => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const prefetchQuery = async (
    prefetchRequest: GetMyMaterialsByParentSubShelfIdRequest
  ): Promise<void> => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.material.manyByParentSubShelfId(
        prefetchRequest.param.parentSubShelfId as UUID,
        prefetchRequest.param.areDeleted ?? false
      ),
      queryFn: async () =>
        await queryFnGetMyMaterialsByParentSubShelfId(prefetchRequest),
      staleTime: PrefetchQueryDefaultOptions.staleTime as number,
    });
  };

  return {
    prefetchQuery: prefetchQuery,
    nextQueryClient: queryClient,
    name: "GET_ALL_MY_MATERIALS_BY_PARENT_SUB_SHELF_ID_PREFETCH" as const,
  };
};

export const prefetchGetAllMyMaterialsByRootShelfId = (
  initialQueryClient?: QueryClient
) => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const prefetchQuery = async (
    prefetchRequest: GetAllMyMaterialsByRootShelfIdRequest
  ): Promise<void> => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.material.manyByRootShelfId(
        prefetchRequest.param.rootShelfId as UUID,
        prefetchRequest.param.areDeleted ?? false
      ),
      queryFn: async () =>
        await queryFnGetAllMyMaterialsByRootShelfId(prefetchRequest),
      staleTime: PrefetchQueryDefaultOptions.staleTime as number,
    });
  };

  return {
    prefetchQuery: prefetchQuery,
    nextQueryClient: queryClient,
    name: "GET_ALL_MY_MATERIALS_BY_ROOT_SHELF_ID_PREFETCH" as const,
  };
};
