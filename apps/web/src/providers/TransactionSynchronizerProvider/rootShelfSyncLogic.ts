import {
  type CreateRootShelfRequest,
  CreateRootShelfRequestSchema,
  CreateRootShelvesRequestSchema,
  DeleteMyRootShelfByIdRequestSchema,
  DeleteMyRootShelvesByIdsRequest,
  DeleteMyRootShelvesByIdsRequestSchema,
  RestoreMyRootShelfByIdRequestSchema,
  RestoreMyRootShelvesByIdsRequest,
  RestoreMyRootShelvesByIdsRequestSchema,
  UpdateMyRootShelfByIdRequestSchema,
  UpdateMyRootShelvesByIdsRequest,
  UpdateMyRootShelvesByIdsRequestSchema,
} from "@shared/api/interfaces/rootShelf.interface";
import { Transaction } from "@/api/local/schemas";
import { TransactionActionType } from "@/api/local/schemas/enums/transaction_action_type.enum";
import { TransactionEntityType } from "@/api/local/schemas/enums/transaction_entity_type.enum";
import { InferSelectModel } from "drizzle-orm";
import {
  dropEntityPendingOperations,
  EntityState,
  getMergedSequences,
  getTransactionSequences,
  MergedTransaction,
  MergedTransactionsResult,
  markTransactionsAsMerged,
  mergeSet,
  PreparedSyncJobsResult,
  SyncHeader,
  SyncJob,
} from "./TransactionSynchronizerProvider";

interface RootShelfMutators {
  createRootShelfMutator: {
    mutateAsync: (request: CreateRootShelfRequest) => Promise<unknown>;
  };
  updateRootShelvesMutator: {
    mutateAsync: (request: UpdateMyRootShelvesByIdsRequest) => Promise<unknown>;
  };
  restoreRootShelvesMutator: {
    mutateAsync: (
      request: RestoreMyRootShelvesByIdsRequest
    ) => Promise<unknown>;
  };
  deleteRootShelvesMutator: {
    mutateAsync: (request: DeleteMyRootShelvesByIdsRequest) => Promise<unknown>;
  };
}

interface PrepareRootShelfSyncJobsOptions {
  transactions: MergedTransaction[];
  header: SyncHeader;
  mutators: RootShelfMutators;
}

const mergeRootCreateValues = (
  current: { id?: string; name: string },
  updateValues: { name?: string }
): { id?: string; name: string } => ({
  ...current,
  ...(updateValues.name !== undefined ? { name: updateValues.name } : {}),
});

export const prepareRootShelfSyncJobs = ({
  transactions,
  header,
  mutators,
}: PrepareRootShelfSyncJobsOptions): PreparedSyncJobsResult => {
  const createRootShelvesMap = new Map<
    string,
    EntityState<{ id?: string; name: string }>
  >();
  const updateRootShelvesMap = new Map<
    string,
    EntityState<{
      rootShelfId: string;
      values: { name?: string };
      setNull?: Record<string, boolean>;
    }>
  >();
  const restoreRootShelvesMap = new Map<
    string,
    EntityState<{ rootShelfId: string }>
  >();
  const deleteRootShelvesMap = new Map<
    string,
    {
      body: {
        rootShelfId: string;
      };
      affected: {
        subShelfIds: Set<string>;
        materialIds: Set<string>;
      };
      sequences: Set<number>;
    }
  >();

  const parseFailedSequences = new Set<number>();
  const noopSequences = new Set<number>();
  const syncJobs: SyncJob[] = [];

  for (const transaction of transactions) {
    const request = {
      body: transaction.body as unknown,
      ...(transaction.affected !== null &&
      typeof transaction.affected === "object"
        ? { affected: transaction.affected as unknown }
        : {}),
    };

    if (transaction.entityType !== TransactionEntityType.RootShelf) {
      mergeSet(parseFailedSequences, getTransactionSequences(transaction));
      continue;
    }

    switch (transaction.actionType) {
      case TransactionActionType.CREATE: {
        const one = CreateRootShelfRequestSchema.safeParse(request);
        if (one.success) {
          const id = one.data.body.id;
          if (!id) {
            mergeSet(
              parseFailedSequences,
              getTransactionSequences(transaction)
            );
            break;
          }
          createRootShelvesMap.set(id, {
            body: {
              id,
              name: one.data.body.name,
            },
            sequences: getTransactionSequences(transaction),
          });
          break;
        }

        const many = CreateRootShelvesRequestSchema.safeParse(request);
        if (many.success) {
          if (many.data.body.createdRootShelves.length === 0) {
            mergeSet(noopSequences, getTransactionSequences(transaction));
            break;
          }
          for (const created of many.data.body.createdRootShelves) {
            if (!created.id) continue;
            createRootShelvesMap.set(created.id, {
              body: {
                id: created.id,
                name: created.name,
              },
              sequences: getTransactionSequences(transaction),
            });
          }
          break;
        }

        mergeSet(parseFailedSequences, getTransactionSequences(transaction));
        break;
      }
      case TransactionActionType.UPDATE: {
        const one = UpdateMyRootShelfByIdRequestSchema.safeParse(request);
        if (one.success) {
          const id = one.data.body.rootShelfId;
          const existingCreate = createRootShelvesMap.get(id);
          if (existingCreate) {
            existingCreate.body = mergeRootCreateValues(
              existingCreate.body,
              one.data.body.values
            );
            mergeSet(
              existingCreate.sequences,
              getTransactionSequences(transaction)
            );
            break;
          }

          const existingUpdate = updateRootShelvesMap.get(id);
          if (existingUpdate) {
            existingUpdate.body.values = {
              ...existingUpdate.body.values,
              ...one.data.body.values,
            };
            existingUpdate.body.setNull = {
              ...(existingUpdate.body.setNull ?? {}),
              ...(one.data.body.setNull ?? {}),
            };
            mergeSet(
              existingUpdate.sequences,
              getTransactionSequences(transaction)
            );
            break;
          }

          updateRootShelvesMap.set(id, {
            body: {
              rootShelfId: id,
              values: one.data.body.values,
              setNull: one.data.body.setNull,
            },
            sequences: getTransactionSequences(transaction),
          });
          break;
        }

        const many = UpdateMyRootShelvesByIdsRequestSchema.safeParse(request);
        if (many.success) {
          for (const updated of many.data.body.updatedRootShelves) {
            const id = updated.rootShelfId;
            const existingCreate = createRootShelvesMap.get(id);
            if (existingCreate) {
              existingCreate.body = mergeRootCreateValues(
                existingCreate.body,
                updated.values
              );
              mergeSet(
                existingCreate.sequences,
                getTransactionSequences(transaction)
              );
              continue;
            }

            const existingUpdate = updateRootShelvesMap.get(id);
            if (existingUpdate) {
              existingUpdate.body.values = {
                ...existingUpdate.body.values,
                ...updated.values,
              };
              existingUpdate.body.setNull = {
                ...(existingUpdate.body.setNull ?? {}),
                ...(updated.setNull ?? {}),
              };
              mergeSet(
                existingUpdate.sequences,
                getTransactionSequences(transaction)
              );
              continue;
            }

            updateRootShelvesMap.set(id, {
              body: {
                rootShelfId: id,
                values: updated.values,
                setNull: updated.setNull,
              },
              sequences: getTransactionSequences(transaction),
            });
          }
          break;
        }

        mergeSet(parseFailedSequences, getTransactionSequences(transaction));
        break;
      }
      case TransactionActionType.RESTORE: {
        const one = RestoreMyRootShelfByIdRequestSchema.safeParse(request);
        if (one.success) {
          const id = one.data.body.rootShelfId;
          const deleted = deleteRootShelvesMap.get(id);
          if (deleted) {
            mergeSet(noopSequences, deleted.sequences);
            mergeSet(noopSequences, getTransactionSequences(transaction));
            deleteRootShelvesMap.delete(id);
            break;
          }

          restoreRootShelvesMap.set(id, {
            body: {
              rootShelfId: id,
            },
            sequences: getTransactionSequences(transaction),
          });
          break;
        }

        const many = RestoreMyRootShelvesByIdsRequestSchema.safeParse(request);
        if (many.success) {
          for (const id of many.data.body.rootShelfIds) {
            const deleted = deleteRootShelvesMap.get(id);
            if (deleted) {
              mergeSet(noopSequences, deleted.sequences);
              mergeSet(noopSequences, getTransactionSequences(transaction));
              deleteRootShelvesMap.delete(id);
              continue;
            }

            restoreRootShelvesMap.set(id, {
              body: {
                rootShelfId: id,
              },
              sequences: getTransactionSequences(transaction),
            });
          }
          break;
        }

        mergeSet(parseFailedSequences, getTransactionSequences(transaction));
        break;
      }
      case TransactionActionType.DELETE: {
        const one = DeleteMyRootShelfByIdRequestSchema.safeParse(request);
        if (one.success) {
          const id = one.data.body.rootShelfId;
          if (createRootShelvesMap.has(id)) {
            mergeSet(noopSequences, createRootShelvesMap.get(id)!.sequences);
            mergeSet(noopSequences, getTransactionSequences(transaction));
            createRootShelvesMap.delete(id);
            updateRootShelvesMap.delete(id);
            restoreRootShelvesMap.delete(id);
            deleteRootShelvesMap.delete(id);
            break;
          }

          dropEntityPendingOperations(
            id,
            [updateRootShelvesMap, restoreRootShelvesMap],
            noopSequences
          );
          const existingDelete = deleteRootShelvesMap.get(id);
          if (existingDelete) {
            mergeSet(
              existingDelete.sequences,
              getTransactionSequences(transaction)
            );
            mergeSet(
              existingDelete.affected.subShelfIds,
              one.data.affected.subShelfIds
            );
            mergeSet(
              existingDelete.affected.materialIds,
              one.data.affected.materialIds
            );
          } else {
            deleteRootShelvesMap.set(id, {
              body: {
                rootShelfId: id,
              },
              affected: {
                subShelfIds: new Set(one.data.affected.subShelfIds),
                materialIds: new Set(one.data.affected.materialIds),
              },
              sequences: getTransactionSequences(transaction),
            });
          }
          break;
        }

        const many = DeleteMyRootShelvesByIdsRequestSchema.safeParse(request);
        if (many.success) {
          for (const id of many.data.body.rootShelfIds) {
            if (createRootShelvesMap.has(id)) {
              mergeSet(noopSequences, createRootShelvesMap.get(id)!.sequences);
              mergeSet(noopSequences, getTransactionSequences(transaction));
              createRootShelvesMap.delete(id);
              updateRootShelvesMap.delete(id);
              restoreRootShelvesMap.delete(id);
              deleteRootShelvesMap.delete(id);
              continue;
            }

            dropEntityPendingOperations(
              id,
              [updateRootShelvesMap, restoreRootShelvesMap],
              noopSequences
            );
            const existingDelete = deleteRootShelvesMap.get(id);
            if (existingDelete) {
              mergeSet(
                existingDelete.sequences,
                getTransactionSequences(transaction)
              );
              mergeSet(
                existingDelete.affected.subShelfIds,
                many.data.affected.subShelfIds
              );
              mergeSet(
                existingDelete.affected.materialIds,
                many.data.affected.materialIds
              );
            } else {
              deleteRootShelvesMap.set(id, {
                body: {
                  rootShelfId: id,
                },
                affected: {
                  subShelfIds: new Set(many.data.affected.subShelfIds),
                  materialIds: new Set(many.data.affected.materialIds),
                },
                sequences: getTransactionSequences(transaction),
              });
            }
          }
          break;
        }

        mergeSet(parseFailedSequences, getTransactionSequences(transaction));
        break;
      }
      default: {
        mergeSet(parseFailedSequences, getTransactionSequences(transaction));
        break;
      }
    }
  }

  if (createRootShelvesMap.size > 0) {
    for (const state of createRootShelvesMap.values()) {
      const request: CreateRootShelfRequest = {
        header,
        body: state.body,
      };
      syncJobs.push({
        sequences: state.sequences,
        run: () => mutators.createRootShelfMutator.mutateAsync(request),
      });
    }
  }

  if (updateRootShelvesMap.size > 0) {
    const request: UpdateMyRootShelvesByIdsRequest = {
      header,
      body: {
        updatedRootShelves: Array.from(updateRootShelvesMap.values()).map(
          state => state.body
        ),
      },
    };
    const sequences = getMergedSequences(
      ...Array.from(updateRootShelvesMap.values()).map(state => state.sequences)
    );
    syncJobs.push({
      sequences,
      run: () => mutators.updateRootShelvesMutator.mutateAsync(request),
    });
  }

  if (restoreRootShelvesMap.size > 0) {
    const request: RestoreMyRootShelvesByIdsRequest = {
      header,
      body: {
        rootShelfIds: Array.from(restoreRootShelvesMap.values()).map(
          state => state.body.rootShelfId
        ),
      },
    };
    const sequences = getMergedSequences(
      ...Array.from(restoreRootShelvesMap.values()).map(
        state => state.sequences
      )
    );
    syncJobs.push({
      sequences,
      run: () => mutators.restoreRootShelvesMutator.mutateAsync(request),
    });
  }

  if (deleteRootShelvesMap.size > 0) {
    const request: DeleteMyRootShelvesByIdsRequest = {
      header,
      body: {
        rootShelfIds: Array.from(deleteRootShelvesMap.values()).map(
          state => state.body.rootShelfId
        ),
      },
      affected: {
        subShelfIds: Array.from(
          new Set(
            Array.from(deleteRootShelvesMap.values()).flatMap(state =>
              Array.from(state.affected.subShelfIds)
            )
          )
        ),
        materialIds: Array.from(
          new Set(
            Array.from(deleteRootShelvesMap.values()).flatMap(state =>
              Array.from(state.affected.materialIds)
            )
          )
        ),
      },
    };
    const sequences = getMergedSequences(
      ...Array.from(deleteRootShelvesMap.values()).map(state => state.sequences)
    );
    syncJobs.push({
      sequences,
      run: () => mutators.deleteRootShelvesMutator.mutateAsync(request),
    });
  }

  return {
    syncJobs,
    noopSequences,
    parseFailedSequences,
  };
};

export const mergeRootShelfTransactions = ({
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
