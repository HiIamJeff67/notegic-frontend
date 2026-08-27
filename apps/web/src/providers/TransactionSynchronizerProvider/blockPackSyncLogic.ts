import {
  CreateBlockPackRequestSchema,
  CreateBlockPacksRequest,
  CreateBlockPacksRequestSchema,
  DeleteMyBlockPackByIdRequestSchema,
  DeleteMyBlockPacksByIdsRequest,
  DeleteMyBlockPacksByIdsRequestSchema,
  MoveMyBlockPackByIdRequestSchema,
  MoveMyBlockPacksByParentSubShelfIdRequestSchema,
  MoveMyBlockPacksByParentSubShelfIdsRequest,
  MoveMyBlockPacksByParentSubShelfIdsRequestSchema,
  RestoreMyBlockPackByIdRequestSchema,
  RestoreMyBlockPacksByIdsRequest,
  RestoreMyBlockPacksByIdsRequestSchema,
  UpdateMyBlockPackByIdRequestSchema,
  UpdateMyBlockPacksByIdsRequest,
  UpdateMyBlockPacksByIdsRequestSchema,
} from "@shared/api/interfaces/blockPack.interface";
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

interface BlockPackMutators {
  createBlockPacksMutator: {
    mutateAsync: (request: CreateBlockPacksRequest) => Promise<unknown>;
  };
  updateBlockPacksMutator: {
    mutateAsync: (request: UpdateMyBlockPacksByIdsRequest) => Promise<unknown>;
  };
  moveBlockPacksMutator: {
    mutateAsync: (
      request: MoveMyBlockPacksByParentSubShelfIdsRequest
    ) => Promise<unknown>;
  };
  restoreBlockPacksMutator: {
    mutateAsync: (request: RestoreMyBlockPacksByIdsRequest) => Promise<unknown>;
  };
  deleteBlockPacksMutator: {
    mutateAsync: (request: DeleteMyBlockPacksByIdsRequest) => Promise<unknown>;
  };
}

interface PrepareBlockPackSyncJobsOptions {
  transactions: MergedTransaction[];
  header: SyncHeader;
  mutators: BlockPackMutators;
}

export const prepareBlockPackSyncJobs = ({
  transactions,
  header,
  mutators,
}: PrepareBlockPackSyncJobsOptions): PreparedSyncJobsResult => {
  const createBlockPacksMap = new Map<
    string,
    {
      body: {
        id?: string;
        parentSubShelfId: string;
        name: string;
        icon: string | null;
        headerBackgroundURL: string | null;
      };
      affected: {
        rootShelfId?: string;
      };
      sequences: Set<number>;
    }
  >();
  const updateBlockPacksMap = new Map<
    string,
    {
      body: {
        blockPackId: string;
        values: {
          name?: string;
          icon?: string;
          headerBackgroundURL?: string;
        };
        setNull?: Record<string, boolean>;
      };
      affected: {
        parentSubShelfId: string;
        rootShelfId?: string;
      };
      sequences: Set<number>;
    }
  >();
  const moveBlockPacksMap = new Map<
    string,
    {
      body: {
        blockPackId: string;
        destinationParentSubShelfId: string;
      };
      affected: {
        sourceParentSubShelfId?: string;
        rootShelfId?: string;
      };
      sequences: Set<number>;
    }
  >();
  const restoreBlockPacksMap = new Map<
    string,
    {
      body: {
        blockPackId: string;
      };
      affected: {
        parentSubShelfId: string;
        rootShelfId: string;
      };
      sequences: Set<number>;
    }
  >();
  const deleteBlockPacksMap = new Map<
    string,
    {
      body: {
        blockPackId: string;
      };
      affected: {
        parentSubShelfId: string;
        rootShelfId: string;
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

    if (transaction.entityType !== TransactionEntityType.BlockPack) {
      mergeSet(parseFailedSequences, getTransactionSequences(transaction));
      continue;
    }

    switch (transaction.actionType) {
      case TransactionActionType.CREATE: {
        const one = CreateBlockPackRequestSchema.safeParse(request);
        if (one.success) {
          const id = one.data.body.id;
          if (!id) {
            mergeSet(
              parseFailedSequences,
              getTransactionSequences(transaction)
            );
            break;
          }
          createBlockPacksMap.set(id, {
            body: {
              id,
              parentSubShelfId: one.data.body.parentSubShelfId,
              name: one.data.body.name,
              icon: one.data.body.icon,
              headerBackgroundURL: one.data.body.headerBackgroundURL,
            },
            affected: {
              rootShelfId: one.data.affected.rootShelfId,
            },
            sequences: getTransactionSequences(transaction),
          });
          break;
        }

        const many = CreateBlockPacksRequestSchema.safeParse(request);
        if (many.success) {
          for (const [
            index,
            created,
          ] of many.data.body.createdBlockPacks.entries()) {
            if (!created.id) continue;
            createBlockPacksMap.set(created.id, {
              body: {
                id: created.id,
                parentSubShelfId: created.parentSubShelfId,
                name: created.name,
                icon: created.icon,
                headerBackgroundURL: created.headerBackgroundURL,
              },
              affected: {
                rootShelfId:
                  many.data.affected.rootShelfIds[index] ??
                  many.data.affected.rootShelfIds[0],
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
        const one = UpdateMyBlockPackByIdRequestSchema.safeParse(request);
        if (one.success) {
          const id = one.data.body.blockPackId;
          const createState = createBlockPacksMap.get(id);
          if (createState) {
            createState.body.name =
              one.data.body.values.name ?? createState.body.name;
            createState.body.icon =
              (one.data.body.values.icon as string | undefined) ??
              createState.body.icon;
            createState.body.headerBackgroundURL =
              one.data.body.values.headerBackgroundURL ??
              createState.body.headerBackgroundURL;
            mergeSet(
              createState.sequences,
              getTransactionSequences(transaction)
            );
            break;
          }

          const existing = updateBlockPacksMap.get(id);
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
            updateBlockPacksMap.set(id, {
              body: {
                blockPackId: id,
                values: one.data.body.values,
                setNull: one.data.body.setNull,
              },
              affected: {
                parentSubShelfId: one.data.affected.parentSubShelfId,
                rootShelfId: one.data.affected.rootShelfId,
              },
              sequences: getTransactionSequences(transaction),
            });
          }
          break;
        }

        const many = UpdateMyBlockPacksByIdsRequestSchema.safeParse(request);
        if (many.success) {
          for (const [
            index,
            updated,
          ] of many.data.body.updatedBlockPacks.entries()) {
            const id = updated.blockPackId;
            const createState = createBlockPacksMap.get(id);
            if (createState) {
              createState.body.name =
                updated.values.name ?? createState.body.name;
              createState.body.icon =
                (updated.values.icon as string | undefined) ??
                createState.body.icon;
              createState.body.headerBackgroundURL =
                updated.values.headerBackgroundURL ??
                createState.body.headerBackgroundURL;
              mergeSet(
                createState.sequences,
                getTransactionSequences(transaction)
              );
              continue;
            }

            const existing = updateBlockPacksMap.get(id);
            if (existing) {
              existing.body.values = {
                ...existing.body.values,
                ...updated.values,
              };
              existing.body.setNull = {
                ...(existing.body.setNull ?? {}),
                ...(updated.setNull ?? {}),
              };
              existing.affected.parentSubShelfId =
                many.data.affected.parentSubShelfIds[index] ??
                many.data.affected.parentSubShelfIds[0];
              existing.affected.rootShelfId =
                many.data.affected.rootShelfIds[index] ??
                many.data.affected.rootShelfIds[0];
              mergeSet(
                existing.sequences,
                getTransactionSequences(transaction)
              );
            } else {
              updateBlockPacksMap.set(id, {
                body: {
                  blockPackId: id,
                  values: updated.values,
                  setNull: updated.setNull,
                },
                affected: {
                  parentSubShelfId:
                    many.data.affected.parentSubShelfIds[index] ??
                    many.data.affected.parentSubShelfIds[0],
                  rootShelfId:
                    many.data.affected.rootShelfIds[index] ??
                    many.data.affected.rootShelfIds[0],
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
        const one = MoveMyBlockPackByIdRequestSchema.safeParse(request);
        if (one.success) {
          const id = one.data.body.blockPackId;
          const createState = createBlockPacksMap.get(id);
          if (createState) {
            createState.body.parentSubShelfId =
              one.data.body.destinationParentSubShelfId;
            mergeSet(
              createState.sequences,
              getTransactionSequences(transaction)
            );
            break;
          }

          moveBlockPacksMap.set(id, {
            body: {
              blockPackId: id,
              destinationParentSubShelfId:
                one.data.body.destinationParentSubShelfId,
            },
            affected: {
              sourceParentSubShelfId: one.data.affected.sourceParentSubShelfId,
              rootShelfId: one.data.affected.rootShelfId,
            },
            sequences: getTransactionSequences(transaction),
          });
          break;
        }

        const manyOneDestination =
          MoveMyBlockPacksByParentSubShelfIdRequestSchema.safeParse(request);
        if (manyOneDestination.success) {
          for (const [
            index,
            id,
          ] of manyOneDestination.data.body.blockPackIds.entries()) {
            const createState = createBlockPacksMap.get(id);
            if (createState) {
              createState.body.parentSubShelfId =
                manyOneDestination.data.body.destinationParentSubShelfId;
              mergeSet(
                createState.sequences,
                getTransactionSequences(transaction)
              );
              continue;
            }

            moveBlockPacksMap.set(id, {
              body: {
                blockPackId: id,
                destinationParentSubShelfId:
                  manyOneDestination.data.body.destinationParentSubShelfId,
              },
              affected: {
                sourceParentSubShelfId:
                  manyOneDestination.data.affected.sourceParentSubShelfIds[
                    index
                  ] ??
                  manyOneDestination.data.affected.sourceParentSubShelfIds[0],
                rootShelfId: manyOneDestination.data.affected.rootShelfId,
              },
              sequences: getTransactionSequences(transaction),
            });
          }
          break;
        }

        const many =
          MoveMyBlockPacksByParentSubShelfIdsRequestSchema.safeParse(request);
        if (many.success) {
          for (const [
            movedIndex,
            moved,
          ] of many.data.body.movedBlockPacks.entries()) {
            for (const id of moved.blockPackIds) {
              const createState = createBlockPacksMap.get(id);
              if (createState) {
                createState.body.parentSubShelfId =
                  moved.destinationParentSubShelfId;
                mergeSet(
                  createState.sequences,
                  getTransactionSequences(transaction)
                );
                continue;
              }

              moveBlockPacksMap.set(id, {
                body: {
                  blockPackId: id,
                  destinationParentSubShelfId:
                    moved.destinationParentSubShelfId,
                },
                affected: {
                  sourceParentSubShelfId:
                    many.data.affected.sourceParentSubShelfIds[movedIndex] ??
                    many.data.affected.sourceParentSubShelfIds[0],
                  rootShelfId:
                    many.data.affected.rootShelfIds[movedIndex] ??
                    many.data.affected.rootShelfIds[0],
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
        const one = RestoreMyBlockPackByIdRequestSchema.safeParse(request);
        if (one.success) {
          const id = one.data.body.blockPackId;
          const deleted = deleteBlockPacksMap.get(id);
          if (deleted) {
            mergeSet(noopSequences, deleted.sequences);
            mergeSet(noopSequences, getTransactionSequences(transaction));
            deleteBlockPacksMap.delete(id);
            break;
          }

          restoreBlockPacksMap.set(id, {
            body: {
              blockPackId: id,
            },
            affected: {
              parentSubShelfId: one.data.affected.parentSubShelfId,
              rootShelfId: one.data.affected.rootShelfId,
            },
            sequences: getTransactionSequences(transaction),
          });
          break;
        }

        const many = RestoreMyBlockPacksByIdsRequestSchema.safeParse(request);
        if (many.success) {
          for (const [index, id] of many.data.body.blockPackIds.entries()) {
            const deleted = deleteBlockPacksMap.get(id);
            if (deleted) {
              mergeSet(noopSequences, deleted.sequences);
              mergeSet(noopSequences, getTransactionSequences(transaction));
              deleteBlockPacksMap.delete(id);
              continue;
            }

            restoreBlockPacksMap.set(id, {
              body: {
                blockPackId: id,
              },
              affected: {
                parentSubShelfId:
                  many.data.affected.parentSubShelfIds[index] ??
                  many.data.affected.parentSubShelfIds[0],
                rootShelfId:
                  many.data.affected.rootShelfIds[index] ??
                  many.data.affected.rootShelfIds[0],
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
        const one = DeleteMyBlockPackByIdRequestSchema.safeParse(request);
        if (one.success) {
          const id = one.data.body.blockPackId;
          if (createBlockPacksMap.has(id)) {
            mergeSet(noopSequences, createBlockPacksMap.get(id)!.sequences);
            mergeSet(noopSequences, getTransactionSequences(transaction));
            createBlockPacksMap.delete(id);
            updateBlockPacksMap.delete(id);
            moveBlockPacksMap.delete(id);
            restoreBlockPacksMap.delete(id);
            deleteBlockPacksMap.delete(id);
            break;
          }

          dropEntityPendingOperations(
            id,
            [updateBlockPacksMap, moveBlockPacksMap, restoreBlockPacksMap],
            noopSequences
          );
          deleteBlockPacksMap.set(id, {
            body: {
              blockPackId: id,
            },
            affected: {
              parentSubShelfId: one.data.affected.parentSubShelfId,
              rootShelfId: one.data.affected.rootShelfId,
            },
            sequences: getTransactionSequences(transaction),
          });
          break;
        }

        const many = DeleteMyBlockPacksByIdsRequestSchema.safeParse(request);
        if (many.success) {
          for (const [index, id] of many.data.body.blockPackIds.entries()) {
            if (createBlockPacksMap.has(id)) {
              mergeSet(noopSequences, createBlockPacksMap.get(id)!.sequences);
              mergeSet(noopSequences, getTransactionSequences(transaction));
              createBlockPacksMap.delete(id);
              updateBlockPacksMap.delete(id);
              moveBlockPacksMap.delete(id);
              restoreBlockPacksMap.delete(id);
              deleteBlockPacksMap.delete(id);
              continue;
            }

            dropEntityPendingOperations(
              id,
              [updateBlockPacksMap, moveBlockPacksMap, restoreBlockPacksMap],
              noopSequences
            );
            deleteBlockPacksMap.set(id, {
              body: {
                blockPackId: id,
              },
              affected: {
                parentSubShelfId:
                  many.data.affected.parentSubShelfIds[index] ??
                  many.data.affected.parentSubShelfIds[0],
                rootShelfId:
                  many.data.affected.rootShelfIds[index] ??
                  many.data.affected.rootShelfIds[0],
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

  if (createBlockPacksMap.size > 0) {
    const states = Array.from(createBlockPacksMap.values());
    const request: CreateBlockPacksRequest = {
      header,
      body: {
        createdBlockPacks: states.map(state => ({
          id: state.body.id,
          parentSubShelfId: state.body.parentSubShelfId,
          name: state.body.name,
          icon: state.body.icon as any,
          headerBackgroundURL: state.body.headerBackgroundURL,
        })),
      },
      affected: {
        rootShelfIds: states.map(state => state.affected.rootShelfId),
        parentSubShelfIds: states.map(state => state.body.parentSubShelfId),
      },
    };
    const sequences = getMergedSequences(
      ...states.map(state => state.sequences)
    );
    syncJobs.push({
      sequences,
      run: () => mutators.createBlockPacksMutator.mutateAsync(request),
    });
  }

  if (updateBlockPacksMap.size > 0) {
    const states = Array.from(updateBlockPacksMap.values());
    const request: UpdateMyBlockPacksByIdsRequest = {
      header,
      body: {
        updatedBlockPacks: states.map(state => ({
          blockPackId: state.body.blockPackId,
          values: state.body.values as any,
          setNull: state.body.setNull,
        })),
      },
      affected: {
        rootShelfIds: states.map(state => state.affected.rootShelfId as string),
        parentSubShelfIds: states.map(state => state.affected.parentSubShelfId),
      },
    };
    const sequences = getMergedSequences(
      ...states.map(state => state.sequences)
    );
    syncJobs.push({
      sequences,
      run: () => mutators.updateBlockPacksMutator.mutateAsync(request),
    });
  }

  if (moveBlockPacksMap.size > 0) {
    const states = Array.from(moveBlockPacksMap.values());
    const request: MoveMyBlockPacksByParentSubShelfIdsRequest = {
      header,
      body: {
        movedBlockPacks: states.map(state => ({
          blockPackIds: [state.body.blockPackId],
          destinationParentSubShelfId: state.body.destinationParentSubShelfId,
        })),
      },
      affected: {
        rootShelfIds: states
          .map(state => state.affected.rootShelfId)
          .filter((id): id is string => !!id),
        sourceParentSubShelfIds: states
          .map(state => state.affected.sourceParentSubShelfId)
          .filter((id): id is string => !!id),
      },
    };
    const sequences = getMergedSequences(
      ...states.map(state => state.sequences)
    );
    syncJobs.push({
      sequences,
      run: () => mutators.moveBlockPacksMutator.mutateAsync(request),
    });
  }

  if (restoreBlockPacksMap.size > 0) {
    const states = Array.from(restoreBlockPacksMap.values());
    const request: RestoreMyBlockPacksByIdsRequest = {
      header,
      body: {
        blockPackIds: states.map(state => state.body.blockPackId),
      },
      affected: {
        rootShelfIds: states.map(state => state.affected.rootShelfId),
        parentSubShelfIds: states.map(state => state.affected.parentSubShelfId),
      },
    };
    const sequences = getMergedSequences(
      ...states.map(state => state.sequences)
    );
    syncJobs.push({
      sequences,
      run: () => mutators.restoreBlockPacksMutator.mutateAsync(request),
    });
  }

  if (deleteBlockPacksMap.size > 0) {
    const states = Array.from(deleteBlockPacksMap.values());
    const request: DeleteMyBlockPacksByIdsRequest = {
      header,
      body: {
        blockPackIds: states.map(state => state.body.blockPackId),
      },
      affected: {
        rootShelfIds: states.map(state => state.affected.rootShelfId),
        parentSubShelfIds: states.map(state => state.affected.parentSubShelfId),
      },
    };
    const sequences = getMergedSequences(
      ...states.map(state => state.sequences)
    );
    syncJobs.push({
      sequences,
      run: () => mutators.deleteBlockPacksMutator.mutateAsync(request),
    });
  }

  return {
    syncJobs,
    noopSequences,
    parseFailedSequences,
  };
};

export const mergeBlockPackTransactions = ({
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
