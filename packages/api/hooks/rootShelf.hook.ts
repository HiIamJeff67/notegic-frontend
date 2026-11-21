import type {
  CreateRootShelfRequest,
  CreateRootShelfResponse,
  DeleteMyRootShelfByIdRequest,
  DeleteMyRootShelfByIdResponse,
  UpdateMyRootShelfByIdRequest,
  UpdateMyRootShelfByIdResponse,
} from "@shared/api/interfaces/rootShelf.interface";
import {
  mutationFnCreateRootShelf,
  mutationFnDeleteMyRootShelfById,
  mutationFnUpdateMyRootShelfById,
} from "@shared/api/invokers/rootShelf.invoker";
import type { Client } from "@shared/api/local/client";
import { OutboxStatus } from "@shared/api/local/repositories/inputs/outbox.input";
import { OutboxRepository } from "@shared/api/local/repositories/outbox.repository";
import { RootShelfRepository } from "@shared/api/local/repositories/rootShelf.repository";
import { useMutation } from "@tanstack/react-query";

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
