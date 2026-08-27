import {
  CreateSubShelfByRootShelfIdRequestSchema,
  CreateSubShelvesByRootShelfIdsRequest,
  CreateSubShelvesByRootShelfIdsRequestSchema,
  DeleteMySubShelfByIdRequestSchema,
  DeleteMySubShelvesByIdsRequest,
  DeleteMySubShelvesByIdsRequestSchema,
  MoveMySubShelfRequestSchema,
  MoveMySubShelvesByRootShelfIdRequestSchema,
  MoveMySubShelvesByRootShelfIdsRequest,
  MoveMySubShelvesByRootShelfIdsRequestSchema,
  RestoreMySubShelfByIdRequestSchema,
  RestoreMySubShelvesByIdsRequest,
  RestoreMySubShelvesByIdsRequestSchema,
  UpdateMySubShelfByIdRequestSchema,
  UpdateMySubShelvesByIdsRequest,
  UpdateMySubShelvesByIdsRequestSchema,
} from "@shared/api/interfaces/subShelf.interface";
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

interface SubShelfMutators {
  createSubShelvesMutator: {
    mutateAsync: (
      request: CreateSubShelvesByRootShelfIdsRequest
    ) => Promise<unknown>;
  };
  updateSubShelvesMutator: {
    mutateAsync: (request: UpdateMySubShelvesByIdsRequest) => Promise<unknown>;
  };
  moveSubShelvesMutator: {
    mutateAsync: (
      request: MoveMySubShelvesByRootShelfIdsRequest
    ) => Promise<unknown>;
  };
  restoreSubShelvesMutator: {
    mutateAsync: (request: RestoreMySubShelvesByIdsRequest) => Promise<unknown>;
  };
  deleteSubShelvesMutator: {
    mutateAsync: (request: DeleteMySubShelvesByIdsRequest) => Promise<unknown>;
  };
}

interface PrepareSubShelfSyncJobsOptions {
  transactions: MergedTransaction[];
  header: SyncHeader;
  mutators: SubShelfMutators;
}

export const prepareSubShelfSyncJobs = ({
  transactions,
  header,
  mutators,
}: PrepareSubShelfSyncJobsOptions): PreparedSyncJobsResult => {
  const createSubShelvesMap = new Map<
    string,
    EntityState<{
      id?: string;
      rootShelfId: string;
      prevSubShelfId: string | null;
      name: string;
    }>
  >();
  const updateSubShelvesMap = new Map<
    string,
    {
      body: {
        subShelfId: string;
        values: { name?: string };
        setNull?: Record<string, boolean>;
      };
      affected: {
        rootShelfId: string;
        prevSubShelfId: string | null;
      };
      sequences: Set<number>;
    }
  >();
  const moveSubShelvesMap = new Map<
    string,
    EntityState<{
      sourceRootShelfId: string;
      sourceSubShelfId: string;
      destinationRootShelfId: string;
      destinationSubShelfId: string | null;
    }>
  >();
  const restoreSubShelvesMap = new Map<
    string,
    {
      body: {
        subShelfId: string;
      };
      affected: {
        rootShelfId: string;
        prevSubShelfId: string | null;
      };
      sequences: Set<number>;
    }
  >();
  const deleteSubShelvesMap = new Map<
    string,
    {
      body: {
        subShelfId: string;
      };
      affected: {
        rootShelfId: string;
        prevSubShelfId: string | null;
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

    if (transaction.entityType !== TransactionEntityType.SubShelf) {
      mergeSet(parseFailedSequences, getTransactionSequences(transaction));
      continue;
    }

    switch (transaction.actionType) {
      case TransactionActionType.CREATE: {
        const one = CreateSubShelfByRootShelfIdRequestSchema.safeParse(request);
        if (one.success) {
          const id = one.data.body.id;
          if (!id) {
            mergeSet(
              parseFailedSequences,
              getTransactionSequences(transaction)
            );
            break;
          }
          createSubShelvesMap.set(id, {
            body: {
              id,
              rootShelfId: one.data.body.rootShelfId,
              prevSubShelfId: one.data.body.prevSubShelfId,
              name: one.data.body.name,
            },
            sequences: getTransactionSequences(transaction),
          });
          break;
        }

        const many =
          CreateSubShelvesByRootShelfIdsRequestSchema.safeParse(request);
        if (many.success) {
          for (const created of many.data.body.createdSubShelves) {
            if (!created.id) continue;
            createSubShelvesMap.set(created.id, {
              body: {
                id: created.id,
                rootShelfId: created.rootShelfId,
                prevSubShelfId: created.prevSubShelfId,
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
        const one = UpdateMySubShelfByIdRequestSchema.safeParse(request);
        if (one.success) {
          const id = one.data.body.subShelfId;
          const createState = createSubShelvesMap.get(id);
          if (createState) {
            if (one.data.body.values.name !== undefined) {
              createState.body.name = one.data.body.values.name;
            }
            mergeSet(
              createState.sequences,
              getTransactionSequences(transaction)
            );
            break;
          }

          const existing = updateSubShelvesMap.get(id);
          if (existing) {
            existing.body.values = {
              ...existing.body.values,
              ...one.data.body.values,
            };
            existing.body.setNull = {
              ...(existing.body.setNull ?? {}),
              ...(one.data.body.setNull ?? {}),
            };
            mergeSet(existing.sequences, getTransactionSequences(transaction));
          } else {
            updateSubShelvesMap.set(id, {
              body: {
                subShelfId: id,
                values: one.data.body.values,
                setNull: one.data.body.setNull,
              },
              affected: {
                rootShelfId: one.data.affected.rootShelfId,
                prevSubShelfId: one.data.affected.prevSubShelfId,
              },
              sequences: getTransactionSequences(transaction),
            });
          }
          break;
        }

        const many = UpdateMySubShelvesByIdsRequestSchema.safeParse(request);
        if (many.success) {
          for (const [
            index,
            updated,
          ] of many.data.body.updatedSubShelves.entries()) {
            const id = updated.subShelfId;
            const createState = createSubShelvesMap.get(id);
            if (createState) {
              if (updated.values.name !== undefined) {
                createState.body.name = updated.values.name;
              }
              mergeSet(
                createState.sequences,
                getTransactionSequences(transaction)
              );
              continue;
            }

            const existing = updateSubShelvesMap.get(id);
            if (existing) {
              existing.body.values = {
                ...existing.body.values,
                ...updated.values,
              };
              existing.body.setNull = {
                ...(existing.body.setNull ?? {}),
                ...(updated.setNull ?? {}),
              };
              existing.affected.rootShelfId =
                many.data.affected.rootShelfIds[index] ??
                many.data.affected.rootShelfIds[0];
              existing.affected.prevSubShelfId =
                many.data.affected.prevSubShelfIds[index] ??
                many.data.affected.prevSubShelfIds[0] ??
                null;
              mergeSet(
                existing.sequences,
                getTransactionSequences(transaction)
              );
            } else {
              updateSubShelvesMap.set(id, {
                body: {
                  subShelfId: id,
                  values: updated.values,
                  setNull: updated.setNull,
                },
                affected: {
                  rootShelfId:
                    many.data.affected.rootShelfIds[index] ??
                    many.data.affected.rootShelfIds[0],
                  prevSubShelfId:
                    many.data.affected.prevSubShelfIds[index] ??
                    many.data.affected.prevSubShelfIds[0] ??
                    null,
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
      case TransactionActionType.MOVE: {
        const oneByOne = MoveMySubShelfRequestSchema.safeParse(request);
        if (oneByOne.success) {
          const id = oneByOne.data.body.sourceSubShelfId;
          const createState = createSubShelvesMap.get(id);
          if (createState) {
            createState.body.rootShelfId =
              oneByOne.data.body.destinationRootShelfId;
            createState.body.prevSubShelfId =
              oneByOne.data.body.destinationSubShelfId;
            mergeSet(
              createState.sequences,
              getTransactionSequences(transaction)
            );
            break;
          }

          moveSubShelvesMap.set(id, {
            body: {
              sourceRootShelfId: oneByOne.data.body.sourceRootShelfId,
              sourceSubShelfId: id,
              destinationRootShelfId: oneByOne.data.body.destinationRootShelfId,
              destinationSubShelfId: oneByOne.data.body.destinationSubShelfId,
            },
            sequences: getTransactionSequences(transaction),
          });
          break;
        }

        const oneToOne =
          MoveMySubShelvesByRootShelfIdRequestSchema.safeParse(request);
        if (oneToOne.success) {
          for (const id of oneToOne.data.body.sourceSubShelfIds) {
            const createState = createSubShelvesMap.get(id);
            if (createState) {
              createState.body.rootShelfId =
                oneToOne.data.body.destinationRootShelfId;
              createState.body.prevSubShelfId =
                oneToOne.data.body.destinationSubShelfId;
              mergeSet(
                createState.sequences,
                getTransactionSequences(transaction)
              );
              continue;
            }

            moveSubShelvesMap.set(id, {
              body: {
                sourceRootShelfId: oneToOne.data.body.sourceRootShelfId,
                sourceSubShelfId: id,
                destinationRootShelfId:
                  oneToOne.data.body.destinationRootShelfId,
                destinationSubShelfId: oneToOne.data.body.destinationSubShelfId,
              },
              sequences: getTransactionSequences(transaction),
            });
          }
          break;
        }

        const many =
          MoveMySubShelvesByRootShelfIdsRequestSchema.safeParse(request);
        if (many.success) {
          for (const moved of many.data.body.moveSubShelves) {
            for (const id of moved.sourceSubShelfIds) {
              const createState = createSubShelvesMap.get(id);
              if (createState) {
                createState.body.rootShelfId = moved.destinationRootShelfId;
                createState.body.prevSubShelfId = moved.destinationSubShelfId;
                mergeSet(
                  createState.sequences,
                  getTransactionSequences(transaction)
                );
                continue;
              }

              moveSubShelvesMap.set(id, {
                body: {
                  sourceRootShelfId: moved.sourceRootShelfId,
                  sourceSubShelfId: id,
                  destinationRootShelfId: moved.destinationRootShelfId,
                  destinationSubShelfId: moved.destinationSubShelfId,
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
      case TransactionActionType.RESTORE: {
        const one = RestoreMySubShelfByIdRequestSchema.safeParse(request);
        if (one.success) {
          const id = one.data.body.subShelfId;
          const deleted = deleteSubShelvesMap.get(id);
          if (deleted) {
            mergeSet(noopSequences, deleted.sequences);
            mergeSet(noopSequences, getTransactionSequences(transaction));
            deleteSubShelvesMap.delete(id);
            break;
          }

          restoreSubShelvesMap.set(id, {
            body: {
              subShelfId: id,
            },
            affected: {
              rootShelfId: one.data.affected.rootShelfId,
              prevSubShelfId: one.data.affected.prevSubShelfId,
            },
            sequences: getTransactionSequences(transaction),
          });
          break;
        }

        const many = RestoreMySubShelvesByIdsRequestSchema.safeParse(request);
        if (many.success) {
          for (const [index, id] of many.data.body.subShelfIds.entries()) {
            const deleted = deleteSubShelvesMap.get(id);
            if (deleted) {
              mergeSet(noopSequences, deleted.sequences);
              mergeSet(noopSequences, getTransactionSequences(transaction));
              deleteSubShelvesMap.delete(id);
              continue;
            }

            restoreSubShelvesMap.set(id, {
              body: {
                subShelfId: id,
              },
              affected: {
                rootShelfId:
                  many.data.affected.rootShelfIds[index] ??
                  many.data.affected.rootShelfIds[0],
                prevSubShelfId:
                  many.data.affected.prevSubShelfIds[index] ??
                  many.data.affected.prevSubShelfIds[0] ??
                  null,
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
        const one = DeleteMySubShelfByIdRequestSchema.safeParse(request);
        if (one.success) {
          const id = one.data.body.subShelfId;
          if (createSubShelvesMap.has(id)) {
            mergeSet(noopSequences, createSubShelvesMap.get(id)!.sequences);
            mergeSet(noopSequences, getTransactionSequences(transaction));
            createSubShelvesMap.delete(id);
            updateSubShelvesMap.delete(id);
            moveSubShelvesMap.delete(id);
            restoreSubShelvesMap.delete(id);
            deleteSubShelvesMap.delete(id);
            break;
          }

          dropEntityPendingOperations(
            id,
            [updateSubShelvesMap, moveSubShelvesMap, restoreSubShelvesMap],
            noopSequences
          );
          deleteSubShelvesMap.set(id, {
            body: {
              subShelfId: id,
            },
            affected: {
              rootShelfId: one.data.affected.rootShelfId,
              prevSubShelfId: one.data.affected.prevSubShelfId,
            },
            sequences: getTransactionSequences(transaction),
          });
          break;
        }

        const many = DeleteMySubShelvesByIdsRequestSchema.safeParse(request);
        if (many.success) {
          for (const [index, id] of many.data.body.subShelfIds.entries()) {
            if (createSubShelvesMap.has(id)) {
              mergeSet(noopSequences, createSubShelvesMap.get(id)!.sequences);
              mergeSet(noopSequences, getTransactionSequences(transaction));
              createSubShelvesMap.delete(id);
              updateSubShelvesMap.delete(id);
              moveSubShelvesMap.delete(id);
              restoreSubShelvesMap.delete(id);
              deleteSubShelvesMap.delete(id);
              continue;
            }

            dropEntityPendingOperations(
              id,
              [updateSubShelvesMap, moveSubShelvesMap, restoreSubShelvesMap],
              noopSequences
            );
            deleteSubShelvesMap.set(id, {
              body: {
                subShelfId: id,
              },
              affected: {
                rootShelfId:
                  many.data.affected.rootShelfIds[index] ??
                  many.data.affected.rootShelfIds[0],
                prevSubShelfId:
                  many.data.affected.prevSubShelfIds[index] ??
                  many.data.affected.prevSubShelfIds[0] ??
                  null,
              },
              sequences: getTransactionSequences(transaction),
            });
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

  if (createSubShelvesMap.size > 0) {
    const states = Array.from(createSubShelvesMap.values());
    const request: CreateSubShelvesByRootShelfIdsRequest = {
      header,
      body: {
        createdSubShelves: states.map(state => state.body),
      },
      affected: {
        rootShelfIds: states.map(state => state.body.rootShelfId),
        prevSubShelfIds: states.map(state => state.body.prevSubShelfId),
      },
    };
    const sequences = getMergedSequences(
      ...states.map(state => state.sequences)
    );
    syncJobs.push({
      sequences,
      run: () => mutators.createSubShelvesMutator.mutateAsync(request),
    });
  }

  if (updateSubShelvesMap.size > 0) {
    const states = Array.from(updateSubShelvesMap.values());
    const request: UpdateMySubShelvesByIdsRequest = {
      header,
      body: {
        updatedSubShelves: states.map(state => ({
          subShelfId: state.body.subShelfId,
          values: state.body.values,
          setNull: state.body.setNull,
        })),
      },
      affected: {
        rootShelfIds: states.map(state => state.affected.rootShelfId),
        prevSubShelfIds: states.map(state => state.affected.prevSubShelfId),
      },
    };
    const sequences = getMergedSequences(
      ...states.map(state => state.sequences)
    );
    syncJobs.push({
      sequences,
      run: () => mutators.updateSubShelvesMutator.mutateAsync(request),
    });
  }

  if (moveSubShelvesMap.size > 0) {
    const states = Array.from(moveSubShelvesMap.values());
    const request: MoveMySubShelvesByRootShelfIdsRequest = {
      header,
      body: {
        moveSubShelves: states.map(state => ({
          sourceRootShelfId: state.body.sourceRootShelfId,
          sourceSubShelfIds: [state.body.sourceSubShelfId],
          destinationRootShelfId: state.body.destinationRootShelfId,
          destinationSubShelfId: state.body.destinationSubShelfId as string,
        })),
      },
      affected: {
        rootShelfIds: Array.from(
          new Set(
            states.flatMap(state => [
              state.body.sourceRootShelfId,
              state.body.destinationRootShelfId,
            ])
          )
        ),
        childSubShelfIds: states.map(state => state.body.sourceSubShelfId),
      },
    };
    const sequences = getMergedSequences(
      ...states.map(state => state.sequences)
    );
    syncJobs.push({
      sequences,
      run: () => mutators.moveSubShelvesMutator.mutateAsync(request),
    });
  }

  if (restoreSubShelvesMap.size > 0) {
    const states = Array.from(restoreSubShelvesMap.values());
    const request: RestoreMySubShelvesByIdsRequest = {
      header,
      body: {
        subShelfIds: states.map(state => state.body.subShelfId),
      },
      affected: {
        rootShelfIds: states.map(state => state.affected.rootShelfId),
        prevSubShelfIds: states
          .map(state => state.affected.prevSubShelfId)
          .filter((id): id is string => id !== null),
      },
    };
    const sequences = getMergedSequences(
      ...states.map(state => state.sequences)
    );
    syncJobs.push({
      sequences,
      run: () => mutators.restoreSubShelvesMutator.mutateAsync(request),
    });
  }

  if (deleteSubShelvesMap.size > 0) {
    const states = Array.from(deleteSubShelvesMap.values());
    const request: DeleteMySubShelvesByIdsRequest = {
      header,
      body: {
        subShelfIds: states.map(state => state.body.subShelfId),
      },
      affected: {
        rootShelfIds: states.map(state => state.affected.rootShelfId),
        prevSubShelfIds: states
          .map(state => state.affected.prevSubShelfId)
          .filter((id): id is string => id !== null),
      },
    };
    const sequences = getMergedSequences(
      ...states.map(state => state.sequences)
    );
    syncJobs.push({
      sequences,
      run: () => mutators.deleteSubShelvesMutator.mutateAsync(request),
    });
  }

  return {
    syncJobs,
    noopSequences,
    parseFailedSequences,
  };
};

export const mergeSubShelfTransactions = ({
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
