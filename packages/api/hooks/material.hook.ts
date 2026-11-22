import { NotegicAPIError } from "@shared/api/exceptions";
import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { NotegicLocalDatabaseError } from "@shared/api/exceptions/errors/localDatabase.error";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import { ItemType } from "@shared/api/interfaces/enums/itemType.enum";
import type {
  CreateMaterialObjectTicketRequest,
  DeleteMyMaterialsByIdsRequest,
  GetMyMaterialAndItsParentByIdRequest,
  GetMyMaterialByIdRequest,
  GetMyMaterialsByParentSubShelfIdRequest,
  GetMyMaterialsByRootShelfIdRequest,
  HardDeleteMyMaterialsByIdsRequest,
  MoveMyMaterialByIdRequest,
  ResolveMaterialObjectTicketRequest,
  RestoreMyMaterialByIdRequest,
  RestoreMyMaterialsByIdsRequest,
} from "@shared/api/interfaces/material.interface";
import {
  mutationFnCreateMaterialObjectTicket,
  mutationFnDeleteMyMaterialsByIds,
  mutationFnHardDeleteMyMaterialsByIds,
  mutationFnMoveMyMaterialById,
  mutationFnRestoreMyMaterialById,
  mutationFnRestoreMyMaterialsByIds,
  queryFnGetMyMaterialAndItsParentById,
  queryFnGetMyMaterialById,
  queryFnGetMyMaterialsByParentSubShelfId,
  queryFnGetMyMaterialsByRootShelfId,
  queryFnResolveMaterialObjectTicket,
} from "@shared/api/invokers/material.invoker";
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

export const useGetMyMaterialById = (
  client: Client,
  online: () => Promise<boolean>,
  func: Parameters<typeof queryFnGetMyMaterialById>[1],
  request?: Parameters<typeof queryFnGetMyMaterialById>[0]
) => {
  const queryClient = getQueryClient();
  const materialId = request?.param?.materialId;
  const isDeleted = request?.param?.isDeleted ?? false;
  const query = useQuery({
    queryKey: queryKeys.material.oneById(
      materialId as UUID | undefined,
      false,
      isDeleted
    ),
    enabled: Boolean(materialId),
    queryFn: () => ItemRepository.GetObserved(client, { id: materialId ?? "" }),
    ...queryOptions,
  });

  useEffect(() => {
    if (!request || !materialId) return;
    let cancelled = false;
    void (async () => {
      try {
        if (!(await online())) return;
        const response = await queryFnGetMyMaterialById(request, func);
        if (cancelled || response.data.deletedAt) return;
        const parent = await SubShelfRepository.GetObserved(client, {
          id: response.data.parentSubShelfId,
        });
        if (!parent) return;
        const changed = await ItemRepository.UpsertObserved(client, {
          id: response.data.id,
          name: response.data.name,
          rootShelfId: parent.rootShelfId,
          parentSubShelfId: response.data.parentSubShelfId,
          type: ItemType.Material,
          at: response.data.updatedAt,
        });
        if (!changed || cancelled) return;
        const item = await ItemRepository.GetObserved(client, {
          id: response.data.id,
        });
        if (!cancelled) {
          queryClient.setQueryData(
            queryKeys.material.oneById(materialId as UUID, false, isDeleted),
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
  }, [isDeleted, materialId, queryClient, request]);

  return query;
};

export const useGetMyMaterialAndItsParentById = (
  client: Client,
  online: () => Promise<boolean>,
  func: Parameters<typeof queryFnGetMyMaterialAndItsParentById>[1],
  request?: Parameters<typeof queryFnGetMyMaterialAndItsParentById>[0]
) => {
  const queryClient = getQueryClient();
  const materialId = request?.param?.materialId;
  const isDeleted = request?.param?.isDeleted ?? false;
  const query = useQuery({
    queryKey: queryKeys.material.oneById(
      materialId as UUID | undefined,
      true,
      isDeleted
    ),
    enabled: Boolean(materialId),
    queryFn: async () => {
      const item = await ItemRepository.GetObserved(client, {
        id: materialId ?? "",
      });
      const parent = item
        ? await SubShelfRepository.GetObserved(client, {
            id: item.parentSubShelfId,
          })
        : undefined;
      return { item, parent };
    },
    ...queryOptions,
  });

  useEffect(() => {
    if (!request || !materialId) return;
    let cancelled = false;
    void (async () => {
      try {
        if (!(await online())) return;
        const response = await queryFnGetMyMaterialAndItsParentById(
          request,
          func
        );
        if (
          cancelled ||
          response.data.deletedAt ||
          response.data.parentSubShelfDeletedAt
        )
          return;
        const shelfChanged = await SubShelfRepository.UpsertObserved(client, {
          id: response.data.parentSubShelfId,
          name: response.data.parentSubShelfName,
          rootShelfId: response.data.rootShelfId,
          prevSubShelfId: response.data.parentSubShelfPrevSubShelfId,
          path: response.data.parentSubShelfPath,
          at: response.data.parentSubShelfUpdatedAt,
        });
        const itemChanged = await ItemRepository.UpsertObserved(client, {
          id: response.data.id,
          name: response.data.name,
          rootShelfId: response.data.rootShelfId,
          parentSubShelfId: response.data.parentSubShelfId,
          type: ItemType.Material,
          at: response.data.updatedAt,
        });
        if ((!shelfChanged && !itemChanged) || cancelled) return;
        const item = await ItemRepository.GetObserved(client, {
          id: response.data.id,
        });
        const parent = await SubShelfRepository.GetObserved(client, {
          id: response.data.parentSubShelfId,
        });
        if (!cancelled) {
          queryClient.setQueryData(
            queryKeys.material.oneById(materialId as UUID, true, isDeleted),
            { item, parent }
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
  }, [isDeleted, materialId, queryClient, request]);

  return query;
};

export const useGetMyMaterialsByParentSubShelfId = (
  client: Client,
  online: () => Promise<boolean>,
  func: Parameters<typeof queryFnGetMyMaterialsByParentSubShelfId>[1],
  request?: Parameters<typeof queryFnGetMyMaterialsByParentSubShelfId>[0]
) => {
  const queryClient = getQueryClient();
  const parentSubShelfId = request?.param?.parentSubShelfId;
  const areDeleted = request?.param?.areDeleted ?? false;
  const query = useQuery({
    queryKey: queryKeys.material.manyByParentSubShelfId(
      parentSubShelfId as UUID | undefined,
      areDeleted
    ),
    enabled: Boolean(parentSubShelfId),
    queryFn: () =>
      ItemRepository.GetObservedMany(client, {
        parentSubShelfId: parentSubShelfId ?? "",
        type: ItemType.Material,
      }),
    ...queryOptions,
  });

  useEffect(() => {
    if (!request || !parentSubShelfId) return;
    let cancelled = false;
    void (async () => {
      try {
        if (!(await online())) return;
        const response = await queryFnGetMyMaterialsByParentSubShelfId(
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
              type: ItemType.Material,
              at: item.updatedAt,
            })),
        });
        if (!changed || cancelled) return;
        const items = await ItemRepository.GetObservedMany(client, {
          parentSubShelfId,
          type: ItemType.Material,
        });
        if (!cancelled) {
          queryClient.setQueryData(
            queryKeys.material.manyByParentSubShelfId(
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

export const useGetMyMaterialsByRootShelfId = (
  client: Client,
  online: () => Promise<boolean>,
  func: Parameters<typeof queryFnGetMyMaterialsByRootShelfId>[1],
  request?: Parameters<typeof queryFnGetMyMaterialsByRootShelfId>[0]
) => {
  const queryClient = getQueryClient();
  const rootShelfId = request?.param?.rootShelfId;
  const areDeleted = request?.param?.areDeleted ?? false;
  const query = useQuery({
    queryKey: queryKeys.material.manyByRootShelfId(
      rootShelfId as UUID | undefined,
      areDeleted
    ),
    enabled: Boolean(rootShelfId),
    queryFn: () =>
      ItemRepository.GetObservedMany(client, {
        rootShelfId: rootShelfId ?? "",
        type: ItemType.Material,
      }),
    ...queryOptions,
  });

  useEffect(() => {
    if (!request || !rootShelfId) return;
    let cancelled = false;
    void (async () => {
      try {
        if (!(await online())) return;
        const response = await queryFnGetMyMaterialsByRootShelfId(
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
              type: ItemType.Material,
              at: item.updatedAt,
            })),
        });
        if (!changed || cancelled) return;
        const items = await ItemRepository.GetObservedMany(client, {
          rootShelfId,
          type: ItemType.Material,
        });
        if (!cancelled) {
          queryClient.setQueryData(
            queryKeys.material.manyByRootShelfId(
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

export const useResolveMaterialObjectTicket = (
  func: Parameters<typeof queryFnResolveMaterialObjectTicket>[1],
  request?: Parameters<typeof queryFnResolveMaterialObjectTicket>[0]
) =>
  useQuery({
    queryKey: queryKeys.material.objectTicket(request?.body.objectTicket),
    enabled: Boolean(request),
    queryFn: () =>
      queryFnResolveMaterialObjectTicket(
        request as ResolveMaterialObjectTicketRequest,
        func
      ),
    ...queryOptions,
  });

export const useCreateMaterialObjectTicket = (
  func: Parameters<typeof mutationFnCreateMaterialObjectTicket>[1]
) =>
  useMutation({
    mutationFn: (request: CreateMaterialObjectTicketRequest) =>
      mutationFnCreateMaterialObjectTicket(request, func),
  });

export const useMoveMyMaterialById = (
  func: Parameters<typeof mutationFnMoveMyMaterialById>[1]
) => {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: (request: MoveMyMaterialByIdRequest) =>
      mutationFnMoveMyMaterialById(request, func),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.material.all(),
      });
    },
  });
};

export const useRestoreMyMaterialById = (
  func: Parameters<typeof mutationFnRestoreMyMaterialById>[1]
) => {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: (request: RestoreMyMaterialByIdRequest) =>
      mutationFnRestoreMyMaterialById(request, func),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.material.all(),
      });
    },
  });
};

export const useRestoreMyMaterialsByIds = (
  func: Parameters<typeof mutationFnRestoreMyMaterialsByIds>[1]
) => {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: (request: RestoreMyMaterialsByIdsRequest) =>
      mutationFnRestoreMyMaterialsByIds(request, func),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.material.all(),
      });
    },
  });
};

export const useDeleteMyMaterialsByIds = (
  func: Parameters<typeof mutationFnDeleteMyMaterialsByIds>[1]
) => {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: (request: DeleteMyMaterialsByIdsRequest) =>
      mutationFnDeleteMyMaterialsByIds(request, func),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.material.all(),
      });
    },
  });
};

export const useHardDeleteMyMaterialsByIds = (
  func: Parameters<typeof mutationFnHardDeleteMyMaterialsByIds>[1]
) => {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: (request: HardDeleteMyMaterialsByIdsRequest) =>
      mutationFnHardDeleteMyMaterialsByIds(request, func),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.material.all(),
      });
    },
  });
};
