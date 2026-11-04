import {
  type CreateMyMaterialRequest,
  CreateMyMaterialRequestSchema,
  CreateMyMaterialResponseSchema,
  type DeleteMyMaterialByIdRequest,
  DeleteMyMaterialByIdRequestSchema,
  type DeleteMyMaterialsByIdsRequest,
  DeleteMyMaterialsByIdsRequestSchema,
  type HardDeleteMyMaterialsByIdsRequest,
  HardDeleteMyMaterialsByIdsRequestSchema,
  type MoveMyMaterialByIdRequest,
  MoveMyMaterialByIdRequestSchema,
  type RestoreMyMaterialByIdRequest,
  RestoreMyMaterialByIdRequestSchema,
  type RestoreMyMaterialsByIdsRequest,
  RestoreMyMaterialsByIdsRequestSchema,
  type UpdateMyMaterialByIdRequest,
  UpdateMyMaterialByIdRequestSchema,
} from "@shared/api/interfaces/material.interface";
import type { InferSelectModel } from "drizzle-orm";
import { Transaction } from "@/api/local/schemas";
import { TransactionActionType } from "@/api/local/schemas/enums/transaction_action_type.enum";
import { TransactionEntityType } from "@/api/local/schemas/enums/transaction_entity_type.enum";
import { parseRequest } from "@shared/api/validation";
import type {
  MergedTransaction,
  MergedTransactionsResult,
  PreparedSyncJobsResult,
  SyncHeader,
  SyncJob,
} from "./TransactionSynchronizerProvider";
import {
  getTransactionSequences,
  mergeSet,
  mergeSingleEntityTransactions,
} from "./TransactionSynchronizerProvider";

interface MaterialMutators {
  createMaterialMutator: {
    mutateAsync: (request: CreateMyMaterialRequest) => Promise<unknown>;
  };
  updateMaterialMutator: {
    mutateAsync: (request: UpdateMyMaterialByIdRequest) => Promise<unknown>;
  };
  moveMaterialMutator: {
    mutateAsync: (request: MoveMyMaterialByIdRequest) => Promise<unknown>;
  };
  restoreMaterialMutator: {
    mutateAsync: (request: RestoreMyMaterialByIdRequest) => Promise<unknown>;
  };
  restoreMaterialsMutator: {
    mutateAsync: (request: RestoreMyMaterialsByIdsRequest) => Promise<unknown>;
  };
  deleteMaterialMutator: {
    mutateAsync: (request: DeleteMyMaterialByIdRequest) => Promise<unknown>;
  };
  deleteMaterialsMutator: {
    mutateAsync: (request: DeleteMyMaterialsByIdsRequest) => Promise<unknown>;
  };
  hardDeleteMaterialsMutator: {
    mutateAsync: (
      request: HardDeleteMyMaterialsByIdsRequest
    ) => Promise<unknown>;
  };
}

interface PrepareMaterialSyncJobsOptions {
  transactions: MergedTransaction[];
  header: SyncHeader;
  mutators: MaterialMutators;
  acknowledgeCreate: (
    offlineId: string,
    remoteId: string,
    sequences: Set<number>
  ) => Promise<void>;
}

export const prepareMaterialSyncJobs = ({
  transactions,
  header,
  mutators,
  acknowledgeCreate,
}: PrepareMaterialSyncJobsOptions): PreparedSyncJobsResult => {
  const operations: SyncJob[] = [];
  const parseFailedSequences = new Set<number>();
  const deferredSequences = new Set<number>();

  for (const transaction of transactions) {
    const sequences = getTransactionSequences(transaction);
    if (transaction.entityType !== TransactionEntityType.Material) {
      mergeSet(parseFailedSequences, sequences);
      continue;
    }

    if (
      transaction.actionType === TransactionActionType.CREATE &&
      CreateMyMaterialRequestSchema.safeParse({
        ...transaction,
        affected: transaction.affected ?? undefined,
      }).success
    ) {
      operations.push({
        sequences,
        run: async () => {
          const result = await mutators.createMaterialMutator.mutateAsync({
            ...parseRequest(CreateMyMaterialRequestSchema, {
              ...transaction,
              affected: transaction.affected ?? undefined,
            }),
            header,
          });
          const affected = transaction.affected as {
            offlineMaterialId?: string;
          } | null;
          const response = CreateMyMaterialResponseSchema.parse(result);
          if (
            affected?.offlineMaterialId &&
            response.success &&
            response.embedded.publicId !== ""
          ) {
            await acknowledgeCreate(
              affected.offlineMaterialId,
              response.data.id,
              sequences
            );
          }
          return result;
        },
      });
      continue;
    }

    if (
      transaction.actionType === TransactionActionType.UPDATE &&
      UpdateMyMaterialByIdRequestSchema.safeParse({
        ...transaction,
        affected: transaction.affected ?? undefined,
      }).success
    ) {
      operations.push({
        sequences,
        run: () =>
          mutators.updateMaterialMutator.mutateAsync({
            ...parseRequest(UpdateMyMaterialByIdRequestSchema, {
              ...transaction,
              affected: transaction.affected ?? undefined,
            }),
            header,
          }),
      });
      continue;
    }

    if (
      transaction.actionType === TransactionActionType.MOVE &&
      MoveMyMaterialByIdRequestSchema.safeParse({
        ...transaction,
        affected: transaction.affected ?? undefined,
      }).success
    ) {
      operations.push({
        sequences,
        run: () =>
          mutators.moveMaterialMutator.mutateAsync({
            ...parseRequest(MoveMyMaterialByIdRequestSchema, {
              ...transaction,
              affected: transaction.affected ?? undefined,
            }),
            header,
          }),
      });
      continue;
    }

    if (
      transaction.actionType === TransactionActionType.RESTORE &&
      RestoreMyMaterialByIdRequestSchema.safeParse({
        ...transaction,
        affected: transaction.affected ?? undefined,
      }).success
    ) {
      operations.push({
        sequences,
        run: () =>
          mutators.restoreMaterialMutator.mutateAsync({
            ...parseRequest(RestoreMyMaterialByIdRequestSchema, {
              ...transaction,
              affected: transaction.affected ?? undefined,
            }),
            header,
          }),
      });
      continue;
    }

    if (
      transaction.actionType === TransactionActionType.RESTORE &&
      RestoreMyMaterialsByIdsRequestSchema.safeParse({
        ...transaction,
        affected: transaction.affected ?? undefined,
      }).success
    ) {
      operations.push({
        sequences,
        run: () =>
          mutators.restoreMaterialsMutator.mutateAsync({
            ...parseRequest(RestoreMyMaterialsByIdsRequestSchema, {
              ...transaction,
              affected: transaction.affected ?? undefined,
            }),
            header,
          }),
      });
      continue;
    }

    if (
      transaction.actionType === TransactionActionType.DELETE &&
      DeleteMyMaterialByIdRequestSchema.safeParse({
        ...transaction,
        affected: transaction.affected ?? undefined,
      }).success
    ) {
      operations.push({
        sequences,
        run: () =>
          mutators.deleteMaterialMutator.mutateAsync({
            ...parseRequest(DeleteMyMaterialByIdRequestSchema, {
              ...transaction,
              affected: transaction.affected ?? undefined,
            }),
            header,
          }),
      });
      continue;
    }

    if (
      transaction.actionType === TransactionActionType.DELETE &&
      DeleteMyMaterialsByIdsRequestSchema.safeParse({
        ...transaction,
        affected: transaction.affected ?? undefined,
      }).success
    ) {
      operations.push({
        sequences,
        run: () =>
          mutators.deleteMaterialsMutator.mutateAsync({
            ...parseRequest(DeleteMyMaterialsByIdsRequestSchema, {
              ...transaction,
              affected: transaction.affected ?? undefined,
            }),
            header,
          }),
      });
      continue;
    }

    if (
      transaction.actionType === TransactionActionType.HARD_DELETE &&
      HardDeleteMyMaterialsByIdsRequestSchema.safeParse({
        ...transaction,
        affected: transaction.affected ?? undefined,
      }).success
    ) {
      operations.push({
        sequences,
        run: () =>
          mutators.hardDeleteMaterialsMutator.mutateAsync({
            ...parseRequest(HardDeleteMyMaterialsByIdsRequestSchema, {
              ...transaction,
              affected: transaction.affected ?? undefined,
            }),
            header,
          }),
      });
      continue;
    }

    mergeSet(parseFailedSequences, sequences);
  }

  let previousOperation = Promise.resolve<unknown>(undefined);
  return {
    syncJobs: operations.map(operation => ({
      sequences: operation.sequences,
      run: () => {
        const ready = previousOperation.catch(error => {
          mergeSet(deferredSequences, operation.sequences);
          throw error;
        });
        const currentOperation = ready.then(async () => {
          const result = await operation.run();
          if (
            typeof result === "object" &&
            result !== null &&
            "success" in result &&
            result.success === false
          ) {
            throw new Error("material synchronization failed");
          }
          return result;
        });
        previousOperation = currentOperation;
        return currentOperation;
      },
    })),
    noopSequences: new Set<number>(),
    parseFailedSequences,
    deferredSequences,
  };
};

export const mergeMaterialTransactions = ({
  transactions,
  onParsed,
}: {
  transactions: InferSelectModel<typeof Transaction>[];
  onParsed?: () => void;
}): MergedTransactionsResult =>
  mergeSingleEntityTransactions({
    transactions,
    entityType: TransactionEntityType.Material,
    idField: "materialId",
    onParsed,
  });
