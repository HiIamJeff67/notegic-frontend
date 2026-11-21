import type {
  CreateSubShelfByRootShelfIdRequest,
  CreateSubShelfByRootShelfIdResponse,
  DeleteMySubShelfByIdRequest,
  DeleteMySubShelfByIdResponse,
  UpdateMySubShelfByIdRequest,
  UpdateMySubShelfByIdResponse,
} from "@shared/api/interfaces/subShelf.interface";
import {
  mutationFnCreateSubShelfByRootShelfId,
  mutationFnDeleteMySubShelfById,
  mutationFnUpdateMySubShelfById,
} from "@shared/api/invokers/subShelf.invoker";
import type { Client } from "@shared/api/local/client";
import { OutboxStatus } from "@shared/api/local/repositories/inputs/outbox.input";
import { OutboxRepository } from "@shared/api/local/repositories/outbox.repository";
import { SubShelfRepository } from "@shared/api/local/repositories/subShelf.repository";
import { useMutation } from "@tanstack/react-query";

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
