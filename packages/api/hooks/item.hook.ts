import type {
  CreateBlockPackRequest,
  CreateBlockPackResponse,
} from "@shared/api/interfaces/blockPack.interface";
import { ItemType } from "@shared/api/interfaces/enums/itemType.enum";
import type {
  CreateMyMaterialRequest,
  CreateMyMaterialResponse,
  DeleteMyMaterialByIdRequest,
  DeleteMyMaterialByIdResponse,
  UpdateMyMaterialByIdRequest,
  UpdateMyMaterialByIdResponse,
} from "@shared/api/interfaces/material.interface";
import { mutationFnCreateBlockPack } from "@shared/api/invokers/blockPack.invoker";
import {
  mutationFnCreateMyMaterial,
  mutationFnDeleteMyMaterialById,
  mutationFnUpdateMyMaterialById,
} from "@shared/api/invokers/material.invoker";
import type { Client } from "@shared/api/local/client";
import { OutboxStatus } from "@shared/api/local/repositories/inputs/outbox.input";
import { ItemRepository } from "@shared/api/local/repositories/item.repository";
import { OutboxRepository } from "@shared/api/local/repositories/outbox.repository";
import { useMutation } from "@tanstack/react-query";

export const useCreateMyMaterial = (
  client: Client,
  ownerPublicId: string,
  func: (request: CreateMyMaterialRequest) => Promise<CreateMyMaterialResponse>
) =>
  useMutation({
    mutationFn: async (request: CreateMyMaterialRequest) => {
      const id = crypto.randomUUID();
      const committed = await ItemRepository.CreateOne(client, {
        id,
        name: request.body.name,
        rootShelfId: request.affected.rootShelfId,
        parentSubShelfId: request.body.parentSubShelfId,
        ownerPublicId,
        type: ItemType.Material,
      });
      try {
        const response = await mutationFnCreateMyMaterial(request, func);
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

export const useUpdateMyMaterialById = (
  client: Client,
  ownerPublicId: string,
  func: (
    request: UpdateMyMaterialByIdRequest
  ) => Promise<UpdateMyMaterialByIdResponse>
) =>
  useMutation({
    mutationFn: async (request: UpdateMyMaterialByIdRequest) => {
      const name = request.body.values.name;
      const rootShelfId = request.affected.rootShelfId;
      if (name === undefined || rootShelfId === undefined) {
        return {
          local: undefined,
          response: await mutationFnUpdateMyMaterialById(request, func),
        };
      }
      const committed = await ItemRepository.UpdateOne(client, {
        id: request.body.materialId,
        name,
        rootShelfId,
        ownerPublicId,
      });
      try {
        const response = await mutationFnUpdateMyMaterialById(request, func);
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

export const useDeleteMyMaterialById = (
  client: Client,
  ownerPublicId: string,
  func: (
    request: DeleteMyMaterialByIdRequest
  ) => Promise<DeleteMyMaterialByIdResponse>
) =>
  useMutation({
    mutationFn: async (request: DeleteMyMaterialByIdRequest) => {
      const committed = await ItemRepository.DeleteOne(client, {
        id: request.body.materialId,
        rootShelfId: request.affected.rootShelfId,
        ownerPublicId,
      });
      try {
        const response = await mutationFnDeleteMyMaterialById(request, func);
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

export const useCreateBlockPack = (
  client: Client,
  ownerPublicId: string,
  func: (request: CreateBlockPackRequest) => Promise<CreateBlockPackResponse>
) =>
  useMutation({
    mutationFn: async (request: CreateBlockPackRequest) => {
      const id = request.body.id ?? crypto.randomUUID();
      const committed = await ItemRepository.CreateOne(client, {
        id,
        name: request.body.name,
        rootShelfId: request.affected.rootShelfId,
        parentSubShelfId: request.body.parentSubShelfId,
        ownerPublicId,
        type: ItemType.BlockPack,
      });
      try {
        const response = await mutationFnCreateBlockPack(
          { ...request, body: { ...request.body, id } },
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
