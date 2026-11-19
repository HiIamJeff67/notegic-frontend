import type {
  CreateRootShelfRequest,
  CreateRootShelfResponse,
  UpdateMyRootShelfByIdRequest,
  UpdateMyRootShelfByIdResponse,
} from "@shared/api/interfaces/rootShelf.interface";
import {
  mutationFnCreateRootShelf,
  mutationFnUpdateMyRootShelfById,
} from "@shared/api/invokers/rootShelf.invoker";
import { OutboxStatus } from "@shared/api/local/repositories/inputs/outbox.input";
import type { LocalDB } from "@shared/api/local/repositories/localDB";
import { OutboxRepository } from "@shared/api/local/repositories/outbox.repository";
import { RootShelfRepository } from "@shared/api/local/repositories/rootShelf.repository";
import { useMutation } from "@tanstack/react-query";

export const useCreateRootShelf = (
  db: LocalDB,
  ownerPublicId: string,
  func: (request: CreateRootShelfRequest) => Promise<CreateRootShelfResponse>
) =>
  useMutation({
    mutationFn: async (request: CreateRootShelfRequest) => {
      const id = request.body.id ?? crypto.randomUUID();
      const local = RootShelfRepository.CreateOne(db, {
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
        const lastError = response.exception?.message;
        OutboxRepository.Settle(db, {
          sequence: local.sequence,
          status: response.success
            ? OutboxStatus.accepted
            : OutboxStatus.unplaced,
          ...(typeof lastError === "string" ? { lastError } : {}),
        });
        return { local, response };
      } catch (error) {
        OutboxRepository.Settle(db, {
          sequence: local.sequence,
          status: OutboxStatus.unplaced,
          ...(error instanceof Error ? { lastError: error.message } : {}),
        });
        throw error;
      }
    },
  });

export const useUpdateMyRootShelfById = (
  db: LocalDB,
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
      const local = RootShelfRepository.UpdateOne(db, {
        id: request.body.rootShelfId,
        name,
        ownerPublicId,
      });
      try {
        const response = await mutationFnUpdateMyRootShelfById(request, func);
        const lastError = response.exception?.message;
        OutboxRepository.Settle(db, {
          sequence: local.sequence,
          status: response.success
            ? OutboxStatus.accepted
            : OutboxStatus.unplaced,
          ...(typeof lastError === "string" ? { lastError } : {}),
        });
        return { local, response };
      } catch (error) {
        OutboxRepository.Settle(db, {
          sequence: local.sequence,
          status: OutboxStatus.unplaced,
          ...(error instanceof Error ? { lastError: error.message } : {}),
        });
        throw error;
      }
    },
  });
