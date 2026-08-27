import {
  type LinkRoutineItemByIdRequest,
  LinkRoutineItemByIdRequestSchema,
  type LinkRoutineItemsByIdsRequest,
  LinkRoutineItemsByIdsRequestSchema,
  type LinkRoutineTagByIdRequest,
  LinkRoutineTagByIdRequestSchema,
  type LinkRoutineTagsByIdsRequest,
  LinkRoutineTagsByIdsRequestSchema,
} from "@shared/api/interfaces/routine.interface";
import { Transaction } from "@/api/local/schemas";
import { TransactionActionType } from "@/api/local/schemas/enums/transaction_action_type.enum";
import { TransactionEntityType } from "@/api/local/schemas/enums/transaction_entity_type.enum";
import type { InferSelectModel } from "drizzle-orm";
import type {
  MergedTransaction,
  MergedTransactionsResult,
  PreparedSyncJobsResult,
  SyncHeader,
} from "./TransactionSynchronizerProvider";
import {
  getTransactionSequences,
  markTransactionsAsMerged,
  mergeSet,
} from "./TransactionSynchronizerProvider";

interface RoutineRelationMutators {
  linkRoutineTagMutator: {
    mutateAsync: (request: LinkRoutineTagByIdRequest) => Promise<unknown>;
  };
  linkRoutineTagsMutator: {
    mutateAsync: (request: LinkRoutineTagsByIdsRequest) => Promise<unknown>;
  };
  linkRoutineItemMutator: {
    mutateAsync: (request: LinkRoutineItemByIdRequest) => Promise<unknown>;
  };
  linkRoutineItemsMutator: {
    mutateAsync: (request: LinkRoutineItemsByIdsRequest) => Promise<unknown>;
  };
}

interface PrepareRoutineRelationSyncJobsOptions {
  transactions: MergedTransaction[];
  header: SyncHeader;
  mutators: RoutineRelationMutators;
}

export const prepareRoutineRelationSyncJobs = ({
  transactions,
  header,
  mutators,
}: PrepareRoutineRelationSyncJobsOptions): PreparedSyncJobsResult => {
  const operations: Array<() => Promise<unknown>> = [];
  const sequences = new Set<number>();
  const parseFailedSequences = new Set<number>();

  for (const transaction of transactions) {
    const request = {
      body: transaction.body as unknown,
      ...(transaction.affected !== null &&
      typeof transaction.affected === "object"
        ? { affected: transaction.affected as unknown }
        : {}),
    };

    if (transaction.entityType === TransactionEntityType.RoutinesToTags) {
      const one = LinkRoutineTagByIdRequestSchema.safeParse(request);
      if (one.success) {
        const expectedAction = one.data.body.isUnlink
          ? TransactionActionType.DELETE
          : TransactionActionType.CREATE;
        if (transaction.actionType !== expectedAction) {
          mergeSet(parseFailedSequences, getTransactionSequences(transaction));
          continue;
        }
        operations.push(() =>
          mutators.linkRoutineTagMutator.mutateAsync({
            header,
            body: one.data.body,
          })
        );
        mergeSet(sequences, getTransactionSequences(transaction));
        continue;
      }

      const many = LinkRoutineTagsByIdsRequestSchema.safeParse(request);
      if (many.success) {
        const expectedAction = many.data.body.isUnlink
          ? TransactionActionType.DELETE
          : TransactionActionType.CREATE;
        if (transaction.actionType !== expectedAction) {
          mergeSet(parseFailedSequences, getTransactionSequences(transaction));
          continue;
        }
        operations.push(() =>
          mutators.linkRoutineTagsMutator.mutateAsync({
            header,
            body: many.data.body,
          })
        );
        mergeSet(sequences, getTransactionSequences(transaction));
        continue;
      }
    }

    if (transaction.entityType === TransactionEntityType.RoutinesToItems) {
      const one = LinkRoutineItemByIdRequestSchema.safeParse(request);
      if (one.success) {
        const expectedAction = one.data.body.isUnlink
          ? TransactionActionType.DELETE
          : TransactionActionType.CREATE;
        if (transaction.actionType !== expectedAction) {
          mergeSet(parseFailedSequences, getTransactionSequences(transaction));
          continue;
        }
        operations.push(() =>
          mutators.linkRoutineItemMutator.mutateAsync({
            header,
            body: one.data.body,
          })
        );
        mergeSet(sequences, getTransactionSequences(transaction));
        continue;
      }

      const many = LinkRoutineItemsByIdsRequestSchema.safeParse(request);
      if (many.success) {
        const expectedAction = many.data.body.isUnlink
          ? TransactionActionType.DELETE
          : TransactionActionType.CREATE;
        if (transaction.actionType !== expectedAction) {
          mergeSet(parseFailedSequences, getTransactionSequences(transaction));
          continue;
        }
        operations.push(() =>
          mutators.linkRoutineItemsMutator.mutateAsync({
            header,
            body: many.data.body,
          })
        );
        mergeSet(sequences, getTransactionSequences(transaction));
        continue;
      }
    }

    mergeSet(parseFailedSequences, getTransactionSequences(transaction));
  }

  const operationSequences = Array.from(sequences);
  let previousOperation = Promise.resolve<unknown>(undefined);

  return {
    syncJobs: operations.map((operation, index) => ({
      sequences: new Set([operationSequences[index]]),
      run: () => {
        const currentOperation = previousOperation.then(async () => {
          const result = await operation();
          if (
            typeof result === "object" &&
            result !== null &&
            "success" in result &&
            result.success === false
          ) {
            throw new Error("routine relation synchronization failed");
          }
          return result;
        });
        previousOperation = currentOperation;
        return currentOperation;
      },
    })),
    noopSequences: new Set<number>(),
    parseFailedSequences,
  };
};

export const mergeRoutineRelationTransactions = ({
  transactions,
  onParsed,
}: {
  transactions: InferSelectModel<typeof Transaction>[];
  onParsed?: () => void;
}): MergedTransactionsResult => {
  transactions.forEach(() => onParsed?.());
  return {
    transactions: markTransactionsAsMerged(transactions),
    noopSequences: new Set<number>(),
    parseFailedSequences: new Set<number>(),
  };
};
