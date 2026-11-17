import type { UUID } from "node:crypto";
import type {
  GetMyMaterialAndItsParentByIdRequest,
  GetMyMaterialAndItsParentByIdResponse,
  GetMyMaterialByIdRequest,
  GetMyMaterialByIdResponse,
  GetMyMaterialsByParentSubShelfIdRequest,
  GetMyMaterialsByParentSubShelfIdResponse,
  GetMyMaterialsByRootShelfIdRequest,
  GetMyMaterialsByRootShelfIdResponse,
} from "@shared/api/interfaces/material.interface";
import {
  queryFnGetMyMaterialAndItsParentById,
  queryFnGetMyMaterialById,
  queryFnGetMyMaterialsByParentSubShelfId,
  queryFnGetMyMaterialsByRootShelfId,
} from "@shared/api/invokers/material.invoker";
import { getQueryClient } from "@shared/api/queryClient";
import { QueryAsyncDefaultOptions } from "@shared/api/queryHookOptions";
import { queryKeys } from "@shared/api/queryKeys";
import type { FetchQueryOptions, QueryClient } from "@tanstack/react-query";
import {
  GetMyMaterialAndItsParentById,
  GetMyMaterialById,
  GetMyMaterialsByParentSubShelfId,
  GetMyMaterialsByRootShelfId,
} from "@/api/functions/material.serverFn";

export const fetchGetMyMaterialById = async (
  fetchRequest: GetMyMaterialByIdRequest,
  initialQueryClient?: QueryClient,
  options?: Partial<FetchQueryOptions>
): Promise<GetMyMaterialByIdResponse> => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const response = await queryClient.fetchQuery({
    queryKey: queryKeys.material.oneById(fetchRequest.param.materialId as UUID),
    queryFn: async () =>
      await queryFnGetMyMaterialById(fetchRequest, GetMyMaterialById),
    staleTime: QueryAsyncDefaultOptions.staleTime as number,
    ...options,
  });

  return response as GetMyMaterialByIdResponse;
};

export const fetchGetMyMaterialAndItsParentById = async (
  fetchRequest: GetMyMaterialAndItsParentByIdRequest,
  initialQueryClient?: QueryClient,
  options?: Partial<FetchQueryOptions>
): Promise<GetMyMaterialAndItsParentByIdResponse> => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const response = await queryClient.fetchQuery({
    queryKey: queryKeys.material.oneById(fetchRequest.param.materialId as UUID),
    queryFn: async () =>
      await queryFnGetMyMaterialAndItsParentById(
        fetchRequest,
        GetMyMaterialAndItsParentById
      ),
    staleTime: QueryAsyncDefaultOptions.staleTime as number,
    ...options,
  });

  return response as GetMyMaterialAndItsParentByIdResponse;
};

export const fetchGetMyMaterialsByParentSubShelfId = async (
  fetchRequest: GetMyMaterialsByParentSubShelfIdRequest,
  initialQueryClient?: QueryClient,
  options?: Partial<FetchQueryOptions>
): Promise<GetMyMaterialsByParentSubShelfIdResponse> => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const response = await queryClient.fetchQuery({
    queryKey: queryKeys.material.manyByParentSubShelfId(
      fetchRequest.param.parentSubShelfId as UUID
    ),
    queryFn: async () =>
      await queryFnGetMyMaterialsByParentSubShelfId(
        fetchRequest,
        GetMyMaterialsByParentSubShelfId
      ),
    staleTime: QueryAsyncDefaultOptions.staleTime as number,
    ...options,
  });

  return response as GetMyMaterialsByParentSubShelfIdResponse;
};

export const fetchGetMyMaterialsByRootShelfId = async (
  fetchRequest: GetMyMaterialsByRootShelfIdRequest,
  initialQueryClient?: QueryClient,
  options?: Partial<FetchQueryOptions>
): Promise<GetMyMaterialsByRootShelfIdResponse> => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const response = await queryClient.fetchQuery({
    queryKey: queryKeys.material.manyByRootShelfId(
      fetchRequest.param.rootShelfId as UUID
    ),
    queryFn: async () =>
      await queryFnGetMyMaterialsByRootShelfId(
        fetchRequest,
        GetMyMaterialsByRootShelfId
      ),
    staleTime: QueryAsyncDefaultOptions.staleTime as number,
    ...options,
  });

  return response as GetMyMaterialsByRootShelfIdResponse;
};
