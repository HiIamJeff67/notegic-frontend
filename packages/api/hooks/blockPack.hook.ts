import { NotegicAPIError } from "@shared/api/exceptions";
import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { NotegicLocalDatabaseError } from "@shared/api/exceptions/errors/localDatabase.error";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import type {
  CreateBlockPacksRequest,
  DeleteMyBlockPackByIdRequest,
  DeleteMyBlockPacksByIdsRequest,
  GetMyBlockPackByIdRequest,
  GetMyBlockPacksByParentSubShelfIdRequest,
  GetMyBlockPacksByRootShelfIdRequest,
  HardDeleteMyBlockPacksByIdsRequest,
  MoveMyBlockPackByIdRequest,
  MoveMyBlockPacksByParentSubShelfIdRequest,
  MoveMyBlockPacksByParentSubShelfIdsRequest,
  RestoreMyBlockPackByIdRequest,
  RestoreMyBlockPacksByIdsRequest,
  UpdateMyBlockPackByIdRequest,
  UpdateMyBlockPacksByIdsRequest,
} from "@shared/api/interfaces/blockPack.interface";
import { ItemType } from "@shared/api/interfaces/enums/itemType.enum";
import {
  mutationFnCreateBlockPacks,
  mutationFnDeleteMyBlockPackById,
  mutationFnDeleteMyBlockPacksByIds,
  mutationFnHardDeleteMyBlockPacksByIds,
  mutationFnMoveMyBlockPackById,
  mutationFnMoveMyBlockPacksByParentSubShelfId,
  mutationFnMoveMyBlockPacksByParentSubShelfIds,
  mutationFnRestoreMyBlockPackById,
  mutationFnRestoreMyBlockPacksByIds,
  mutationFnUpdateMyBlockPackById,
  mutationFnUpdateMyBlockPacksByIds,
  queryFnGetMyBlockPackById,
  queryFnGetMyBlockPacksByParentSubShelfId,
  queryFnGetMyBlockPacksByRootShelfId,
} from "@shared/api/invokers/blockPack.invoker";
import type { Client } from "@shared/api/local/client";
import { ItemRepository } from "@shared/api/local/repositories/item.repository";
import { SubShelfRepository } from "@shared/api/local/repositories/subShelf.repository";
import { getQueryClient } from "@shared/api/queryClient";
import { UseQueryDefaultOptions } from "@shared/api/queryHookOptions";
import { queryKeys } from "@shared/api/queryKeys";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { UUID } from "crypto";
import { useEffect } from "react";

const keepsLocalRow = (error: unknown) =>
  error instanceof NotegicAPIError ||
  error instanceof NotegicFetchError ||
  error instanceof NotegicValidationError ||
  error instanceof NotegicLocalDatabaseError;

const queryOptions = {
  staleTime: UseQueryDefaultOptions.staleTime,
  refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
  refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
};

export const useGetMyBlockPackById = (
  client: Client,
  online: () => Promise<boolean>,
  func: Parameters<typeof queryFnGetMyBlockPackById>[1],
  request?: Parameters<typeof queryFnGetMyBlockPackById>[0]
) => {
  const queryClient = getQueryClient();
  const blockPackId = request?.param?.blockPackId;
  const isDeleted = request?.param?.isDeleted ?? false;
  const query = useQuery({
    queryKey: queryKeys.blockPack.oneById(
      blockPackId as UUID | undefined,
      isDeleted
    ),
    enabled: Boolean(blockPackId),
    queryFn: () =>
      ItemRepository.GetObserved(client, { id: blockPackId ?? "" }),
    ...queryOptions,
  });

  useEffect(() => {
    if (!request || !blockPackId) return;
    let cancelled = false;
    void (async () => {
      try {
        if (!(await online())) return;
        const response = await queryFnGetMyBlockPackById(request, func);
        if (cancelled || response.data.deletedAt) return;
        const changed = await ItemRepository.UpsertObserved(client, {
          id: response.data.id,
          name: response.data.name,
          rootShelfId: response.data.rootShelfId,
          parentSubShelfId: response.data.parentSubShelfId,
          type: ItemType.BlockPack,
          at: response.data.updatedAt,
        });
        if (!changed || cancelled) return;
        const item = await ItemRepository.GetObserved(client, {
          id: response.data.id,
        });
        if (!cancelled) {
          queryClient.setQueryData(
            queryKeys.blockPack.oneById(blockPackId as UUID, isDeleted),
            item
          );
        }
      } catch (error) {
        if (keepsLocalRow(error)) return;
        throw error;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [blockPackId, isDeleted, queryClient, request]);

  return query;
};

export const useGetMyBlockPacksByParentSubShelfId = (
  client: Client,
  online: () => Promise<boolean>,
  func: Parameters<typeof queryFnGetMyBlockPacksByParentSubShelfId>[1],
  request?: Parameters<typeof queryFnGetMyBlockPacksByParentSubShelfId>[0]
) => {
  const queryClient = getQueryClient();
  const parentSubShelfId = request?.param?.parentSubShelfId;
  const areDeleted = request?.param?.areDeleted ?? false;
  const query = useQuery({
    queryKey: queryKeys.blockPack.manyByParentSubShelfId(
      parentSubShelfId as UUID | undefined,
      areDeleted
    ),
    enabled: Boolean(parentSubShelfId),
    queryFn: () =>
      ItemRepository.GetObservedMany(client, {
        parentSubShelfId: parentSubShelfId ?? "",
        type: ItemType.BlockPack,
      }),
    ...queryOptions,
  });

  useEffect(() => {
    if (!request || !parentSubShelfId) return;
    let cancelled = false;
    void (async () => {
      try {
        if (!(await online())) return;
        const response = await queryFnGetMyBlockPacksByParentSubShelfId(
          request,
          func
        );
        const parent = await SubShelfRepository.GetObserved(client, {
          id: parentSubShelfId,
        });
        if (cancelled || !parent) return;
        const changed = await ItemRepository.UpsertObservedMany(client, {
          items: response.data
            .filter(item => item.deletedAt === null)
            .map(item => ({
              id: item.id,
              name: item.name,
              rootShelfId: parent.rootShelfId,
              parentSubShelfId: item.parentSubShelfId,
              type: ItemType.BlockPack,
              at: item.updatedAt,
            })),
        });
        if (!changed || cancelled) return;
        const items = await ItemRepository.GetObservedMany(client, {
          parentSubShelfId,
          type: ItemType.BlockPack,
        });
        if (!cancelled) {
          queryClient.setQueryData(
            queryKeys.blockPack.manyByParentSubShelfId(
              parentSubShelfId as UUID,
              areDeleted
            ),
            items
          );
        }
      } catch (error) {
        if (keepsLocalRow(error)) return;
        throw error;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [areDeleted, parentSubShelfId, queryClient, request]);

  return query;
};

export const useGetMyBlockPacksByRootShelfId = (
  client: Client,
  online: () => Promise<boolean>,
  func: Parameters<typeof queryFnGetMyBlockPacksByRootShelfId>[1],
  request?: Parameters<typeof queryFnGetMyBlockPacksByRootShelfId>[0]
) => {
  const queryClient = getQueryClient();
  const rootShelfId = request?.param?.rootShelfId;
  const areDeleted = request?.param?.areDeleted ?? false;
  const query = useQuery({
    queryKey: queryKeys.blockPack.manyByRootShelfId(
      rootShelfId as UUID | undefined,
      areDeleted
    ),
    enabled: Boolean(rootShelfId),
    queryFn: () =>
      ItemRepository.GetObservedMany(client, {
        rootShelfId: rootShelfId ?? "",
        type: ItemType.BlockPack,
      }),
    ...queryOptions,
  });

  useEffect(() => {
    if (!request || !rootShelfId) return;
    let cancelled = false;
    void (async () => {
      try {
        if (!(await online())) return;
        const response = await queryFnGetMyBlockPacksByRootShelfId(
          request,
          func
        );
        if (cancelled) return;
        const changed = await ItemRepository.UpsertObservedMany(client, {
          items: response.data
            .filter(item => item.deletedAt === null)
            .map(item => ({
              id: item.id,
              name: item.name,
              rootShelfId,
              parentSubShelfId: item.parentSubShelfId,
              type: ItemType.BlockPack,
              at: item.updatedAt,
            })),
        });
        if (!changed || cancelled) return;
        const items = await ItemRepository.GetObservedMany(client, {
          rootShelfId,
          type: ItemType.BlockPack,
        });
        if (!cancelled) {
          queryClient.setQueryData(
            queryKeys.blockPack.manyByRootShelfId(
              rootShelfId as UUID,
              areDeleted
            ),
            items
          );
        }
      } catch (error) {
        if (keepsLocalRow(error)) return;
        throw error;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [areDeleted, queryClient, request, rootShelfId]);

  return query;
};

const invalidateBlockPacks = () => {
  void getQueryClient().invalidateQueries({
    queryKey: queryKeys.blockPack.all(),
  });
};

export const useCreateBlockPacks = (
  func: Parameters<typeof mutationFnCreateBlockPacks>[1]
) =>
  useMutation({
    mutationFn: (request: CreateBlockPacksRequest) =>
      mutationFnCreateBlockPacks(request, func),
    onSuccess: invalidateBlockPacks,
  });

export const useUpdateMyBlockPackById = (
  func: Parameters<typeof mutationFnUpdateMyBlockPackById>[1]
) =>
  useMutation({
    mutationFn: (request: UpdateMyBlockPackByIdRequest) =>
      mutationFnUpdateMyBlockPackById(request, func),
    onSuccess: invalidateBlockPacks,
  });

export const useUpdateMyBlockPacksByIds = (
  func: Parameters<typeof mutationFnUpdateMyBlockPacksByIds>[1]
) =>
  useMutation({
    mutationFn: (request: UpdateMyBlockPacksByIdsRequest) =>
      mutationFnUpdateMyBlockPacksByIds(request, func),
    onSuccess: invalidateBlockPacks,
  });

export const useMoveMyBlockPackById = (
  func: Parameters<typeof mutationFnMoveMyBlockPackById>[1]
) =>
  useMutation({
    mutationFn: (request: MoveMyBlockPackByIdRequest) =>
      mutationFnMoveMyBlockPackById(request, func),
    onSuccess: invalidateBlockPacks,
  });

export const useMoveMyBlockPacksByParentSubShelfId = (
  func: Parameters<typeof mutationFnMoveMyBlockPacksByParentSubShelfId>[1]
) =>
  useMutation({
    mutationFn: (request: MoveMyBlockPacksByParentSubShelfIdRequest) =>
      mutationFnMoveMyBlockPacksByParentSubShelfId(request, func),
    onSuccess: invalidateBlockPacks,
  });

export const useMoveMyBlockPacksByParentSubShelfIds = (
  func: Parameters<typeof mutationFnMoveMyBlockPacksByParentSubShelfIds>[1]
) =>
  useMutation({
    mutationFn: (request: MoveMyBlockPacksByParentSubShelfIdsRequest) =>
      mutationFnMoveMyBlockPacksByParentSubShelfIds(request, func),
    onSuccess: invalidateBlockPacks,
  });

export const useRestoreMyBlockPackById = (
  func: Parameters<typeof mutationFnRestoreMyBlockPackById>[1]
) =>
  useMutation({
    mutationFn: (request: RestoreMyBlockPackByIdRequest) =>
      mutationFnRestoreMyBlockPackById(request, func),
    onSuccess: invalidateBlockPacks,
  });

export const useRestoreMyBlockPacksByIds = (
  func: Parameters<typeof mutationFnRestoreMyBlockPacksByIds>[1]
) =>
  useMutation({
    mutationFn: (request: RestoreMyBlockPacksByIdsRequest) =>
      mutationFnRestoreMyBlockPacksByIds(request, func),
    onSuccess: invalidateBlockPacks,
  });

export const useDeleteMyBlockPackById = (
  func: Parameters<typeof mutationFnDeleteMyBlockPackById>[1]
) =>
  useMutation({
    mutationFn: (request: DeleteMyBlockPackByIdRequest) =>
      mutationFnDeleteMyBlockPackById(request, func),
    onSuccess: invalidateBlockPacks,
  });

export const useDeleteMyBlockPacksByIds = (
  func: Parameters<typeof mutationFnDeleteMyBlockPacksByIds>[1]
) =>
  useMutation({
    mutationFn: (request: DeleteMyBlockPacksByIdsRequest) =>
      mutationFnDeleteMyBlockPacksByIds(request, func),
    onSuccess: invalidateBlockPacks,
  });

export const useHardDeleteMyBlockPacksByIds = (
  func: Parameters<typeof mutationFnHardDeleteMyBlockPacksByIds>[1]
) =>
  useMutation({
    mutationFn: (request: HardDeleteMyBlockPacksByIdsRequest) =>
      mutationFnHardDeleteMyBlockPacksByIds(request, func),
    onSuccess: invalidateBlockPacks,
  });
