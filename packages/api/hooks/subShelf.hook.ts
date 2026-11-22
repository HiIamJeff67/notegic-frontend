import { NotegicAPIError } from "@shared/api/exceptions";
import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { NotegicLocalDatabaseError } from "@shared/api/exceptions/errors/localDatabase.error";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import { ItemType } from "@shared/api/interfaces/enums/itemType.enum";
import type {
  CreateSubShelfByRootShelfIdRequest,
  CreateSubShelfByRootShelfIdResponse,
  CreateSubShelvesByRootShelfIdsRequest,
  DeleteMySubShelfByIdRequest,
  DeleteMySubShelfByIdResponse,
  DeleteMySubShelvesByIdsRequest,
  GetMySubShelfByIdRequest,
  GetMySubShelvesAndItemsByPrevSubShelfIdRequest,
  GetMySubShelvesByPrevSubShelfIdRequest,
  GetMySubShelvesByRootShelfIdRequest,
  HardDeleteMySubShelvesByIdsRequest,
  MoveMySubShelfRequest,
  MoveMySubShelvesByRootShelfIdRequest,
  MoveMySubShelvesByRootShelfIdsRequest,
  RestoreMySubShelfByIdRequest,
  RestoreMySubShelvesByIdsRequest,
  UpdateMySubShelfByIdRequest,
  UpdateMySubShelfByIdResponse,
  UpdateMySubShelvesByIdsRequest,
} from "@shared/api/interfaces/subShelf.interface";
import {
  mutationFnCreateSubShelfByRootShelfId,
  mutationFnCreateSubShelvesByRootShelfIds,
  mutationFnDeleteMySubShelfById,
  mutationFnDeleteMySubShelvesByIds,
  mutationFnHardDeleteMySubShelvesByIds,
  mutationFnMoveMySubShelf,
  mutationFnMoveMySubShelvesByRootShelfId,
  mutationFnMoveMySubShelvesByRootShelfIds,
  mutationFnRestoreMySubShelfById,
  mutationFnRestoreMySubShelvesByIds,
  mutationFnUpdateMySubShelfById,
  mutationFnUpdateMySubShelvesByIds,
  queryFnGetMySubShelfById,
  queryFnGetMySubShelvesAndItemsByPrevSubShelfId,
  queryFnGetMySubShelvesByPrevSubShelfId,
  queryFnGetMySubShelvesByRootShelfId,
} from "@shared/api/invokers/subShelf.invoker";
import type { Client } from "@shared/api/local/client";
import { OutboxStatus } from "@shared/api/local/repositories/inputs/outbox.input";
import { ItemRepository } from "@shared/api/local/repositories/item.repository";
import { OutboxRepository } from "@shared/api/local/repositories/outbox.repository";
import { SubShelfRepository } from "@shared/api/local/repositories/subShelf.repository";
import { getQueryClient } from "@shared/api/queryClient";
import { UseQueryDefaultOptions } from "@shared/api/queryHookOptions";
import { queryKeys } from "@shared/api/queryKeys";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { UUID } from "crypto";
import { useEffect } from "react";

export const useCreateSubShelfByRootShelfId = (
  client: Client,
  ownerPublicId: string,
  func: (
    request: CreateSubShelfByRootShelfIdRequest
  ) => Promise<CreateSubShelfByRootShelfIdResponse>
) =>
  useMutation({
    mutationFn: async (request: CreateSubShelfByRootShelfIdRequest) => {
      const id = request.body.id ?? crypto.randomUUID();
      const committed = await SubShelfRepository.CreateOne(client, {
        id,
        name: request.body.name,
        rootShelfId: request.body.rootShelfId,
        ownerPublicId,
        prevSubShelfId: request.body.prevSubShelfId,
      });
      try {
        const response = await mutationFnCreateSubShelfByRootShelfId(
          {
            ...request,
            body: { ...request.body, id },
          },
          func
        );
        await OutboxRepository.Settle(client, {
          sequence: committed.sequence,
          status: response.success
            ? OutboxStatus.accepted
            : OutboxStatus.unplaced,
          ...(typeof response.exception?.message === "string"
            ? { lastError: response.exception.message }
            : {}),
        });
        return { local: committed, response };
      } catch (error) {
        await OutboxRepository.Settle(client, {
          sequence: committed.sequence,
          status: OutboxStatus.unplaced,
          ...(error instanceof Error ? { lastError: error.message } : {}),
        });
        throw error;
      }
    },
  });

export const useUpdateMySubShelfById = (
  client: Client,
  ownerPublicId: string,
  func: (
    request: UpdateMySubShelfByIdRequest
  ) => Promise<UpdateMySubShelfByIdResponse>
) =>
  useMutation({
    mutationFn: async (request: UpdateMySubShelfByIdRequest) => {
      const name = request.body.values.name;
      if (name === undefined || request.affected?.rootShelfId === undefined) {
        return {
          local: undefined,
          response: await mutationFnUpdateMySubShelfById(request, func),
        };
      }
      const committed = await SubShelfRepository.UpdateOne(client, {
        id: request.body.subShelfId,
        name,
        rootShelfId: request.affected.rootShelfId,
        ownerPublicId,
      });
      try {
        const response = await mutationFnUpdateMySubShelfById(request, func);
        await OutboxRepository.Settle(client, {
          sequence: committed.sequence,
          status: response.success
            ? OutboxStatus.accepted
            : OutboxStatus.unplaced,
          ...(typeof response.exception?.message === "string"
            ? { lastError: response.exception.message }
            : {}),
        });
        return { local: committed, response };
      } catch (error) {
        await OutboxRepository.Settle(client, {
          sequence: committed.sequence,
          status: OutboxStatus.unplaced,
          ...(error instanceof Error ? { lastError: error.message } : {}),
        });
        throw error;
      }
    },
  });

export const useDeleteMySubShelfById = (
  client: Client,
  ownerPublicId: string,
  func: (
    request: DeleteMySubShelfByIdRequest
  ) => Promise<DeleteMySubShelfByIdResponse>
) =>
  useMutation({
    mutationFn: async (request: DeleteMySubShelfByIdRequest) => {
      const rootShelfId = request.affected?.rootShelfId;
      if (rootShelfId === undefined) {
        return {
          local: undefined,
          response: await mutationFnDeleteMySubShelfById(request, func),
        };
      }
      const committed = await SubShelfRepository.DeleteOne(client, {
        id: request.body.subShelfId,
        rootShelfId,
        ownerPublicId,
      });
      try {
        const response = await mutationFnDeleteMySubShelfById(request, func);
        await OutboxRepository.Settle(client, {
          sequence: committed.sequence,
          status: response.success
            ? OutboxStatus.accepted
            : OutboxStatus.unplaced,
          ...(typeof response.exception?.message === "string"
            ? { lastError: response.exception.message }
            : {}),
        });
        return { local: committed, response };
      } catch (error) {
        await OutboxRepository.Settle(client, {
          sequence: committed.sequence,
          status: OutboxStatus.unplaced,
          ...(error instanceof Error ? { lastError: error.message } : {}),
        });
        throw error;
      }
    },
  });

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

export const useGetMySubShelfById = (
  client: Client,
  online: () => Promise<boolean>,
  func: Parameters<typeof queryFnGetMySubShelfById>[1],
  request?: Parameters<typeof queryFnGetMySubShelfById>[0]
) => {
  const queryClient = getQueryClient();
  const subShelfId = request?.param?.subShelfId;
  const isDeleted = request?.param?.isDeleted ?? false;
  const query = useQuery({
    queryKey: queryKeys.subShelf.oneById(
      subShelfId as UUID | undefined,
      isDeleted
    ),
    enabled: Boolean(subShelfId),
    queryFn: () =>
      SubShelfRepository.GetObserved(client, { id: subShelfId ?? "" }),
    ...queryOptions,
  });

  useEffect(() => {
    if (!request || !subShelfId) return;
    let cancelled = false;
    void (async () => {
      try {
        if (!(await online())) return;
        const response = await queryFnGetMySubShelfById(request, func);
        if (cancelled || response.data.deletedAt) return;
        const changed = await SubShelfRepository.UpsertObserved(client, {
          id: response.data.id,
          name: response.data.name,
          rootShelfId: response.data.rootShelfId,
          prevSubShelfId: response.data.prevSubShelfId,
          path: response.data.path,
          at: response.data.updatedAt,
        });
        if (!changed || cancelled) return;
        const shelf = await SubShelfRepository.GetObserved(client, {
          id: response.data.id,
        });
        if (!cancelled) {
          queryClient.setQueryData(
            queryKeys.subShelf.oneById(subShelfId as UUID, isDeleted),
            shelf
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
  }, [isDeleted, queryClient, request, subShelfId]);

  return query;
};

export const useGetMySubShelvesByPrevSubShelfId = (
  client: Client,
  online: () => Promise<boolean>,
  func: Parameters<typeof queryFnGetMySubShelvesByPrevSubShelfId>[1],
  request?: Parameters<typeof queryFnGetMySubShelvesByPrevSubShelfId>[0]
) => {
  const queryClient = getQueryClient();
  const prevSubShelfId = request?.param?.prevSubShelfId;
  const areDeleted = request?.param?.areDeleted ?? false;
  const query = useQuery({
    queryKey: queryKeys.subShelf.manyByPrevSubShelfId(
      prevSubShelfId as UUID | undefined,
      areDeleted
    ),
    enabled: Boolean(prevSubShelfId),
    queryFn: () =>
      SubShelfRepository.GetObservedMany(client, {
        prevSubShelfId: prevSubShelfId ?? "",
      }),
    ...queryOptions,
  });

  useEffect(() => {
    if (!request || !prevSubShelfId) return;
    let cancelled = false;
    void (async () => {
      try {
        if (!(await online())) return;
        const response = await queryFnGetMySubShelvesByPrevSubShelfId(
          request,
          func
        );
        if (cancelled) return;
        const changed = await SubShelfRepository.UpsertObservedMany(client, {
          shelves: response.data
            .filter(shelf => shelf.deletedAt === null)
            .map(shelf => ({
              id: shelf.id,
              name: shelf.name,
              rootShelfId: shelf.rootShelfId,
              prevSubShelfId: shelf.prevSubShelfId,
              path: shelf.path,
              at: shelf.updatedAt,
            })),
        });
        if (!changed || cancelled) return;
        const shelves = await SubShelfRepository.GetObservedMany(client, {
          prevSubShelfId,
        });
        if (!cancelled) {
          queryClient.setQueryData(
            queryKeys.subShelf.manyByPrevSubShelfId(
              prevSubShelfId as UUID,
              areDeleted
            ),
            shelves
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
  }, [areDeleted, prevSubShelfId, queryClient, request]);

  return query;
};

export const useGetMySubShelvesByRootShelfId = (
  client: Client,
  online: () => Promise<boolean>,
  func: Parameters<typeof queryFnGetMySubShelvesByRootShelfId>[1],
  request?: Parameters<typeof queryFnGetMySubShelvesByRootShelfId>[0]
) => {
  const queryClient = getQueryClient();
  const rootShelfId = request?.param?.rootShelfId;
  const areDeleted = request?.param?.areDeleted ?? false;
  const query = useQuery({
    queryKey: queryKeys.subShelf.manyByRootShelfId(
      rootShelfId as UUID | undefined,
      areDeleted
    ),
    enabled: Boolean(rootShelfId),
    queryFn: () =>
      SubShelfRepository.GetObservedMany(client, {
        rootShelfId: rootShelfId ?? "",
      }),
    ...queryOptions,
  });

  useEffect(() => {
    if (!request || !rootShelfId) return;
    let cancelled = false;
    void (async () => {
      try {
        if (!(await online())) return;
        const response = await queryFnGetMySubShelvesByRootShelfId(
          request,
          func
        );
        if (cancelled) return;
        const changed = await SubShelfRepository.UpsertObservedMany(client, {
          shelves: response.data
            .filter(shelf => shelf.deletedAt === null)
            .map(shelf => ({
              id: shelf.id,
              name: shelf.name,
              rootShelfId: shelf.rootShelfId,
              prevSubShelfId: shelf.prevSubShelfId,
              path: shelf.path,
              at: shelf.updatedAt,
            })),
        });
        if (!changed || cancelled) return;
        const shelves = await SubShelfRepository.GetObservedMany(client, {
          rootShelfId,
        });
        if (!cancelled) {
          queryClient.setQueryData(
            queryKeys.subShelf.manyByRootShelfId(
              rootShelfId as UUID,
              areDeleted
            ),
            shelves
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

export const useGetMySubShelvesAndItemsByPrevSubShelfId = (
  client: Client,
  online: () => Promise<boolean>,
  func: Parameters<typeof queryFnGetMySubShelvesAndItemsByPrevSubShelfId>[1],
  request?: Parameters<typeof queryFnGetMySubShelvesAndItemsByPrevSubShelfId>[0]
) => {
  const queryClient = getQueryClient();
  const prevSubShelfId = request?.param?.prevSubShelfId;
  const areDeleted = request?.param?.areDeleted ?? false;
  const queryKey = queryKeys.subShelf.manyByPrevSubShelfId(
    prevSubShelfId as UUID | undefined,
    areDeleted
  );
  const query = useQuery({
    queryKey,
    enabled: Boolean(prevSubShelfId),
    queryFn: async () => {
      const shelves = await SubShelfRepository.GetObservedMany(client, {
        prevSubShelfId: prevSubShelfId ?? "",
      });
      const items = await ItemRepository.GetObservedMany(client, {
        parentSubShelfId: prevSubShelfId ?? "",
      });
      return { shelves, items };
    },
    ...queryOptions,
  });

  useEffect(() => {
    if (!request || !prevSubShelfId) return;
    let cancelled = false;
    void (async () => {
      try {
        if (!(await online())) return;
        const response = await queryFnGetMySubShelvesAndItemsByPrevSubShelfId(
          request,
          func
        );
        if (cancelled) return;
        const shelvesChanged = await SubShelfRepository.UpsertObservedMany(
          client,
          {
            shelves: response.data.subShelves
              .filter(shelf => shelf.deletedAt === null)
              .map(shelf => ({
                id: shelf.id,
                name: shelf.name,
                rootShelfId: shelf.rootShelfId,
                prevSubShelfId: shelf.prevSubShelfId,
                path: shelf.path,
                at: shelf.updatedAt,
              })),
          }
        );
        const parent = await SubShelfRepository.GetObserved(client, {
          id: prevSubShelfId,
        });
        const rootShelfId =
          parent?.rootShelfId ??
          response.data.subShelves.find(shelf => shelf.deletedAt === null)
            ?.rootShelfId;
        const itemsChanged =
          rootShelfId === undefined
            ? false
            : await ItemRepository.UpsertObservedMany(client, {
                items: [
                  ...response.data.materials
                    .filter(item => item.deletedAt === null)
                    .map(item => ({
                      id: item.id,
                      name: item.name,
                      rootShelfId,
                      parentSubShelfId: item.parentSubShelfId,
                      type: ItemType.Material,
                      at: item.updatedAt,
                    })),
                  ...response.data.blockPacks
                    .filter(item => item.deletedAt === null)
                    .map(item => ({
                      id: item.id,
                      name: item.name,
                      rootShelfId,
                      parentSubShelfId: item.parentSubShelfId,
                      type: ItemType.BlockPack,
                      at: item.updatedAt,
                    })),
                ],
              });
        if ((!shelvesChanged && !itemsChanged) || cancelled) return;
        const shelves = await SubShelfRepository.GetObservedMany(client, {
          prevSubShelfId,
        });
        const items = await ItemRepository.GetObservedMany(client, {
          parentSubShelfId: prevSubShelfId,
        });
        if (!cancelled) queryClient.setQueryData(queryKey, { shelves, items });
      } catch (error) {
        if (keepsLocalRow(error)) return;
        throw error;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [areDeleted, prevSubShelfId, queryClient, request]);

  return query;
};

const useRemoteSubShelfMutation = <Request>(
  mutate: (request: Request) => Promise<unknown>
) => {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: mutate,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.subShelf.all(),
      });
    },
  });
};

export const useCreateSubShelvesByRootShelfIds = (
  func: Parameters<typeof mutationFnCreateSubShelvesByRootShelfIds>[1]
) =>
  useRemoteSubShelfMutation((request: CreateSubShelvesByRootShelfIdsRequest) =>
    mutationFnCreateSubShelvesByRootShelfIds(request, func)
  );

export const useUpdateMySubShelvesByIds = (
  func: Parameters<typeof mutationFnUpdateMySubShelvesByIds>[1]
) =>
  useRemoteSubShelfMutation((request: UpdateMySubShelvesByIdsRequest) =>
    mutationFnUpdateMySubShelvesByIds(request, func)
  );

export const useMoveMySubShelf = (
  func: Parameters<typeof mutationFnMoveMySubShelf>[1]
) =>
  useRemoteSubShelfMutation((request: MoveMySubShelfRequest) =>
    mutationFnMoveMySubShelf(request, func)
  );

export const useMoveMySubShelvesByRootShelfId = (
  func: Parameters<typeof mutationFnMoveMySubShelvesByRootShelfId>[1]
) =>
  useRemoteSubShelfMutation((request: MoveMySubShelvesByRootShelfIdRequest) =>
    mutationFnMoveMySubShelvesByRootShelfId(request, func)
  );

export const useMoveMySubShelvesByRootShelfIds = (
  func: Parameters<typeof mutationFnMoveMySubShelvesByRootShelfIds>[1]
) =>
  useRemoteSubShelfMutation((request: MoveMySubShelvesByRootShelfIdsRequest) =>
    mutationFnMoveMySubShelvesByRootShelfIds(request, func)
  );

export const useRestoreMySubShelfById = (
  func: Parameters<typeof mutationFnRestoreMySubShelfById>[1]
) =>
  useRemoteSubShelfMutation((request: RestoreMySubShelfByIdRequest) =>
    mutationFnRestoreMySubShelfById(request, func)
  );

export const useRestoreMySubShelvesByIds = (
  func: Parameters<typeof mutationFnRestoreMySubShelvesByIds>[1]
) =>
  useRemoteSubShelfMutation((request: RestoreMySubShelvesByIdsRequest) =>
    mutationFnRestoreMySubShelvesByIds(request, func)
  );

export const useDeleteMySubShelvesByIds = (
  func: Parameters<typeof mutationFnDeleteMySubShelvesByIds>[1]
) =>
  useRemoteSubShelfMutation((request: DeleteMySubShelvesByIdsRequest) =>
    mutationFnDeleteMySubShelvesByIds(request, func)
  );

export const useHardDeleteMySubShelvesByIds = (
  func: Parameters<typeof mutationFnHardDeleteMySubShelvesByIds>[1]
) =>
  useRemoteSubShelfMutation((request: HardDeleteMySubShelvesByIdsRequest) =>
    mutationFnHardDeleteMySubShelvesByIds(request, func)
  );
