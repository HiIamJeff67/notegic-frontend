import { NotegicAPIError } from "@shared/api/exceptions";
import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import type {
  CreateRootShelfRequest,
  CreateRootShelfResponse,
  CreateRootShelvesRequest,
  DeleteMyRootShelfByIdRequest,
  DeleteMyRootShelfByIdResponse,
  DeleteMyRootShelvesByIdsRequest,
  DeleteRootShelfPermissionsRequest,
  GetMyRootShelfByIdRequest,
  GetMyRootShelfByIdResponse,
  HardDeleteMyRootShelvesByIdsRequest,
  LeaveMyRootShelfRequest,
  RestoreMyRootShelfByIdRequest,
  RestoreMyRootShelvesByIdsRequest,
  TransferMyRootShelfOwnershipRequest,
  UpdateMyRootShelfByIdRequest,
  UpdateMyRootShelfByIdResponse,
  UpdateMyRootShelvesByIdsRequest,
  UpsertRootShelfPermissionRequest,
} from "@shared/api/interfaces/rootShelf.interface";
import {
  mutationFnCreateRootShelf,
  mutationFnCreateRootShelves,
  mutationFnDeleteMyRootShelfById,
  mutationFnDeleteMyRootShelvesByIds,
  mutationFnDeleteRootShelfPermissions,
  mutationFnHardDeleteMyRootShelvesByIds,
  mutationFnLeaveMyRootShelf,
  mutationFnRestoreMyRootShelfById,
  mutationFnRestoreMyRootShelvesByIds,
  mutationFnTransferMyRootShelfOwnership,
  mutationFnUpdateMyRootShelfById,
  mutationFnUpdateMyRootShelvesByIds,
  mutationFnUpsertRootShelfPermission,
  queryFnGetMyRootShelfById,
} from "@shared/api/invokers/rootShelf.invoker";
import type { Client } from "@shared/api/local/client";
import { OutboxStatus } from "@shared/api/local/repositories/inputs/outbox.input";
import { OutboxRepository } from "@shared/api/local/repositories/outbox.repository";
import { RootShelfRepository } from "@shared/api/local/repositories/rootShelf.repository";
import { getQueryClient } from "@shared/api/queryClient";
import { UseQueryDefaultOptions } from "@shared/api/queryHookOptions";
import { queryKeys } from "@shared/api/queryKeys";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { UUID } from "crypto";
import { useEffect } from "react";

export const useGetMyRootShelfById = (
  client: Client,
  ownerPublicId: string,
  online: () => Promise<boolean>,
  func: (
    request: GetMyRootShelfByIdRequest
  ) => Promise<GetMyRootShelfByIdResponse>,
  request: GetMyRootShelfByIdRequest
) => {
  const queryClient = getQueryClient();
  const rootShelfId = request.param?.rootShelfId;
  const isDeleted = request.param?.isDeleted ?? false;
  const query = useQuery({
    queryKey: queryKeys.rootShelf.oneById(
      rootShelfId as UUID | undefined,
      isDeleted
    ),
    enabled: Boolean(rootShelfId),
    queryFn: () =>
      RootShelfRepository.GetObserved(client, {
        id: rootShelfId ?? "",
        ownerPublicId,
      }),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
  });

  useEffect(() => {
    if (!rootShelfId) return;
    let cancelled = false;
    void (async () => {
      try {
        if (!(await online())) return;
        const response = await queryFnGetMyRootShelfById(request, func);
        if (cancelled || response.data.deletedAt) return;
        const changed = await RootShelfRepository.UpsertObserved(client, {
          id: response.data.id,
          name: response.data.name,
          ownerPublicId,
          permission: response.data.permission,
          subShelfCount: response.data.subShelfCount,
          itemCount: response.data.itemCount,
          at: response.data.updatedAt,
        });
        if (!changed || cancelled) return;
        const shelf = await RootShelfRepository.GetObserved(client, {
          id: response.data.id,
          ownerPublicId,
        });
        if (!cancelled) {
          queryClient.setQueryData(
            queryKeys.rootShelf.oneById(rootShelfId as UUID, isDeleted),
            shelf
          );
        }
      } catch (error) {
        if (
          error instanceof NotegicAPIError ||
          error instanceof NotegicFetchError ||
          error instanceof NotegicValidationError
        ) {
          return;
        }
        throw error;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    client,
    func,
    isDeleted,
    online,
    ownerPublicId,
    queryClient,
    rootShelfId,
  ]);

  return query;
};

export const useCreateRootShelf = (
  client: Client,
  ownerPublicId: string,
  func: (request: CreateRootShelfRequest) => Promise<CreateRootShelfResponse>
) =>
  useMutation({
    mutationFn: async (request: CreateRootShelfRequest) => {
      const id = request.body.id ?? crypto.randomUUID();
      const committed = await RootShelfRepository.CreateOne(client, {
        id,
        name: request.body.name,
        ownerPublicId,
      });
      const shelfRequest = {
        ...request,
        body: { ...request.body, id },
      };
      try {
        const response = await mutationFnCreateRootShelf(shelfRequest, func);
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

export const useUpdateMyRootShelfById = (
  client: Client,
  ownerPublicId: string,
  func: (
    request: UpdateMyRootShelfByIdRequest
  ) => Promise<UpdateMyRootShelfByIdResponse>
) =>
  useMutation({
    mutationFn: async (request: UpdateMyRootShelfByIdRequest) => {
      const name = request.body.values.name;
      if (name === undefined) {
        return {
          local: undefined,
          response: await mutationFnUpdateMyRootShelfById(request, func),
        };
      }
      const committed = await RootShelfRepository.UpdateOne(client, {
        id: request.body.rootShelfId,
        name,
        ownerPublicId,
      });
      try {
        const response = await mutationFnUpdateMyRootShelfById(request, func);
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

export const useDeleteMyRootShelfById = (
  client: Client,
  ownerPublicId: string,
  func: (
    request: DeleteMyRootShelfByIdRequest
  ) => Promise<DeleteMyRootShelfByIdResponse>
) =>
  useMutation({
    mutationFn: async (request: DeleteMyRootShelfByIdRequest) => {
      const committed = await RootShelfRepository.DeleteOne(client, {
        id: request.body.rootShelfId,
        ownerPublicId,
      });
      try {
        const response = await mutationFnDeleteMyRootShelfById(request, func);
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

const invalidateRootShelves = () => {
  void getQueryClient().invalidateQueries({
    queryKey: queryKeys.rootShelf.all(),
  });
};

export const useCreateRootShelves = (
  func: Parameters<typeof mutationFnCreateRootShelves>[1]
) =>
  useMutation({
    mutationFn: (request: CreateRootShelvesRequest) =>
      mutationFnCreateRootShelves(request, func),
    onSuccess: invalidateRootShelves,
  });

export const useUpdateMyRootShelvesByIds = (
  func: Parameters<typeof mutationFnUpdateMyRootShelvesByIds>[1]
) =>
  useMutation({
    mutationFn: (request: UpdateMyRootShelvesByIdsRequest) =>
      mutationFnUpdateMyRootShelvesByIds(request, func),
    onSuccess: invalidateRootShelves,
  });

export const useUpsertRootShelfPermission = (
  func: Parameters<typeof mutationFnUpsertRootShelfPermission>[1]
) =>
  useMutation({
    mutationFn: (request: UpsertRootShelfPermissionRequest) =>
      mutationFnUpsertRootShelfPermission(request, func),
    onSuccess: invalidateRootShelves,
  });

export const useDeleteRootShelfPermissions = (
  func: Parameters<typeof mutationFnDeleteRootShelfPermissions>[1]
) =>
  useMutation({
    mutationFn: (request: DeleteRootShelfPermissionsRequest) =>
      mutationFnDeleteRootShelfPermissions(request, func),
    onSuccess: invalidateRootShelves,
  });

export const useRestoreMyRootShelfById = (
  func: Parameters<typeof mutationFnRestoreMyRootShelfById>[1]
) =>
  useMutation({
    mutationFn: (request: RestoreMyRootShelfByIdRequest) =>
      mutationFnRestoreMyRootShelfById(request, func),
    onSuccess: invalidateRootShelves,
  });

export const useRestoreMyRootShelvesByIds = (
  func: Parameters<typeof mutationFnRestoreMyRootShelvesByIds>[1]
) =>
  useMutation({
    mutationFn: (request: RestoreMyRootShelvesByIdsRequest) =>
      mutationFnRestoreMyRootShelvesByIds(request, func),
    onSuccess: invalidateRootShelves,
  });

export const useDeleteMyRootShelvesByIds = (
  func: Parameters<typeof mutationFnDeleteMyRootShelvesByIds>[1]
) =>
  useMutation({
    mutationFn: (request: DeleteMyRootShelvesByIdsRequest) =>
      mutationFnDeleteMyRootShelvesByIds(request, func),
    onSuccess: invalidateRootShelves,
  });

export const useTransferMyRootShelfOwnership = (
  func: Parameters<typeof mutationFnTransferMyRootShelfOwnership>[1]
) =>
  useMutation({
    mutationFn: (request: TransferMyRootShelfOwnershipRequest) =>
      mutationFnTransferMyRootShelfOwnership(request, func),
    onSuccess: invalidateRootShelves,
  });

export const useLeaveMyRootShelf = (
  func: Parameters<typeof mutationFnLeaveMyRootShelf>[1]
) =>
  useMutation({
    mutationFn: (request: LeaveMyRootShelfRequest) =>
      mutationFnLeaveMyRootShelf(request, func),
    onSuccess: invalidateRootShelves,
  });

export const useHardDeleteMyRootShelvesByIds = (
  func: Parameters<typeof mutationFnHardDeleteMyRootShelvesByIds>[1]
) =>
  useMutation({
    mutationFn: (request: HardDeleteMyRootShelvesByIdsRequest) =>
      mutationFnHardDeleteMyRootShelvesByIds(request, func),
    onSuccess: invalidateRootShelves,
  });
