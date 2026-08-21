import { getClientRequestHeaders } from "@shared/api/clientHeaders";
import {
  useCreateBlockPacks,
  useDeleteMyBlockPacksByIds,
  useMoveMyBlockPacksByParentSubShelfIds,
  useRestoreMyBlockPacksByIds,
  useUpdateMyBlockPacksByIds,
} from "@shared/api/hooks/blockPack.hook";
import {
  useCreateRootShelf,
  useDeleteMyRootShelvesByIds,
  useRestoreMyRootShelvesByIds,
  useUpdateMyRootShelvesByIds,
} from "@shared/api/hooks/rootShelf.hook";
import {
  useCreateRoutineByStationId,
  useCreateRoutinesByStationIds,
  useDeleteMyRoutineById,
  useDeleteMyRoutinesByIds,
  useHardDeleteMyRoutineById,
  useHardDeleteMyRoutinesByIds,
  useLinkRoutineItemById,
  useLinkRoutineItemsByIds,
  useLinkRoutineTagById,
  useLinkRoutineTagsByIds,
  useRestoreMyRoutineById,
  useRestoreMyRoutinesByIds,
  useUpdateMyRoutineById,
  useUpdateMyRoutinesByIds,
} from "@shared/api/hooks/routine.hook";
import {
  useCreateRoutineTag,
  useCreateRoutineTags,
  useHardDeleteMyRoutineTagById,
  useHardDeleteMyRoutineTagsByIds,
  useUpdateMyRoutineTagById,
  useUpdateMyRoutineTagsByIds,
} from "@shared/api/hooks/routineTag.hook";
import {
  useCreateStation,
  useCreateStations,
  useDeleteMyStationById,
  useDeleteMyStationsByIds,
  useHardDeleteMyStationById,
  useHardDeleteMyStationsByIds,
  useRestoreMyStationById,
  useRestoreMyStationsByIds,
  useUpdateMyStationById,
  useUpdateMyStationsByIds,
} from "@shared/api/hooks/station.hook";
import {
  useCreateSubShelvesByRootShelfIds,
  useDeleteMySubShelvesByIds,
  useMoveMySubShelvesByRootShelfIds,
  useRestoreMySubShelvesByIds,
  useUpdateMySubShelvesByIds,
} from "@shared/api/hooks/subShelf.hook";
import { localDB } from "@shared/api/local/db";
import { Transaction, User } from "@shared/api/local/schemas";
import { TransactionActionType } from "@shared/api/local/schemas/enums/transaction_action_type.enum";
import { TransactionEntityType } from "@shared/api/local/schemas/enums/transaction_entity_type.enum";
import { and, asc, eq, gte, InferSelectModel, inArray, lt } from "drizzle-orm";
import { createContext, useCallback, useEffect, useRef, useState } from "react";
import { useNetwork } from "@/hooks";
import { useLocalPreferences } from "@/hooks/localPreferences";
import {
  mergeBlockPackTransactions,
  prepareBlockPackSyncJobs,
} from "./blockPackSyncLogic";
import {
  mergeRoutineRelationTransactions,
  prepareRoutineRelationSyncJobs,
} from "./RoutineRelationSyncLogic";
import {
  mergeRoutineTransactions,
  prepareRoutineSyncJobs,
} from "./RoutineSyncLogic";
import {
  mergeRoutineTagTransactions,
  prepareRoutineTagSyncJobs,
} from "./RoutineTagSyncLogic";
import {
  mergeRootShelfTransactions,
  prepareRootShelfSyncJobs,
} from "./rootShelfSyncLogic";
import {
  mergeStationTransactions,
  prepareStationSyncJobs,
} from "./StationSyncLogic";
import {
  mergeSubShelfTransactions,
  prepareSubShelfSyncJobs,
} from "./subShelfSyncLogic";

/* ============================== General types ============================== */

export type EntityState<TBody> = {
  sequences: Set<number>;
  body: TBody;
};

export type SyncJob = {
  sequences: Set<number>;
  run: () => Promise<unknown>;
};

export type PreparedSyncJobsResult = {
  syncJobs: SyncJob[];
  noopSequences: Set<number>;
  parseFailedSequences: Set<number>;
};

export type MergedTransaction = InferSelectModel<typeof Transaction> & {
  mergedSequences: Set<number>;
};

export type MergedTransactionsResult = {
  transactions: MergedTransaction[];
  noopSequences: Set<number>;
  parseFailedSequences: Set<number>;
};

export const getTransactionSequences = (
  transaction: InferSelectModel<typeof Transaction> | MergedTransaction
): Set<number> =>
  "mergedSequences" in transaction
    ? transaction.mergedSequences
    : new Set([transaction.sequence]);

export const markTransactionsAsMerged = (
  transactions: InferSelectModel<typeof Transaction>[]
): MergedTransaction[] =>
  transactions.map(transaction => ({
    ...transaction,
    mergedSequences: new Set([transaction.sequence]),
  }));

const mergeTransactionBodies = (
  baseBody: unknown,
  nextBody: unknown,
  baseAction: TransactionActionType,
  nextAction: TransactionActionType
): unknown => {
  if (
    typeof baseBody !== "object" ||
    baseBody === null ||
    Array.isArray(baseBody) ||
    typeof nextBody !== "object" ||
    nextBody === null ||
    Array.isArray(nextBody)
  )
    return nextBody;

  const baseBodyRecord = baseBody as Record<string, unknown>;
  const nextBodyRecord = nextBody as Record<string, unknown>;

  if (
    baseAction === TransactionActionType.UPDATE &&
    nextAction === TransactionActionType.UPDATE
  ) {
    const baseValues =
      typeof baseBodyRecord.values === "object" &&
      baseBodyRecord.values !== null &&
      !Array.isArray(baseBodyRecord.values)
        ? (baseBodyRecord.values as Record<string, unknown>)
        : undefined;
    const nextValues =
      typeof nextBodyRecord.values === "object" &&
      nextBodyRecord.values !== null &&
      !Array.isArray(nextBodyRecord.values)
        ? (nextBodyRecord.values as Record<string, unknown>)
        : undefined;
    const baseSetNull =
      typeof baseBodyRecord.setNull === "object" &&
      baseBodyRecord.setNull !== null &&
      !Array.isArray(baseBodyRecord.setNull)
        ? (baseBodyRecord.setNull as Record<string, unknown>)
        : undefined;
    const nextSetNull =
      typeof nextBodyRecord.setNull === "object" &&
      nextBodyRecord.setNull !== null &&
      !Array.isArray(nextBodyRecord.setNull)
        ? (nextBodyRecord.setNull as Record<string, unknown>)
        : undefined;

    return {
      ...baseBodyRecord,
      ...nextBodyRecord,
      ...(baseValues || nextValues
        ? {
            values: {
              ...(baseValues ?? {}),
              ...(nextValues ?? {}),
            },
          }
        : {}),
      ...(baseSetNull || nextSetNull
        ? {
            setNull: {
              ...(baseSetNull ?? {}),
              ...(nextSetNull ?? {}),
            },
          }
        : {}),
    };
  }

  if (
    baseAction === TransactionActionType.CREATE &&
    nextAction === TransactionActionType.UPDATE
  ) {
    const nextValues =
      typeof nextBodyRecord.values === "object" &&
      nextBodyRecord.values !== null &&
      !Array.isArray(nextBodyRecord.values)
        ? (nextBodyRecord.values as Record<string, unknown>)
        : {};
    return {
      ...baseBodyRecord,
      ...nextValues,
    };
  }

  return nextBody;
};

const isTerminalDeleteAction = (action: TransactionActionType) =>
  action === TransactionActionType.DELETE ||
  action === TransactionActionType.HARD_DELETE;

export const mergeSingleEntityTransactions = ({
  transactions,
  entityType,
  idField,
  onParsed,
}: {
  transactions: InferSelectModel<typeof Transaction>[];
  entityType: TransactionEntityType;
  idField: string;
  onParsed?: () => void;
}): MergedTransactionsResult => {
  const states = new Map<string, MergedTransaction>();
  const passthrough: MergedTransaction[] = [];
  const noopSequences = new Set<number>();

  for (const transaction of transactions) {
    onParsed?.();
    const body =
      typeof transaction.body === "object" &&
      transaction.body !== null &&
      !Array.isArray(transaction.body)
        ? (transaction.body as Record<string, unknown>)
        : undefined;
    const entityId =
      transaction.actionType === TransactionActionType.CREATE
        ? (body?.[idField] ?? body?.id)
        : body?.[idField];
    const id = typeof entityId === "string" ? entityId : undefined;
    if (transaction.entityType !== entityType || !id) {
      passthrough.push({
        ...transaction,
        mergedSequences: new Set([transaction.sequence]),
      });
      continue;
    }

    const current: MergedTransaction = {
      ...transaction,
      mergedSequences: new Set([transaction.sequence]),
    };
    const previous = states.get(id);
    if (!previous) {
      states.set(id, current);
      continue;
    }

    mergeSet(previous.mergedSequences, [transaction.sequence]);

    if (
      previous.actionType === TransactionActionType.CREATE &&
      isTerminalDeleteAction(transaction.actionType)
    ) {
      mergeSet(noopSequences, previous.mergedSequences);
      mergeSet(noopSequences, current.mergedSequences);
      states.delete(id);
      continue;
    }

    if (isTerminalDeleteAction(transaction.actionType)) {
      states.set(id, {
        ...current,
        mergedSequences: previous.mergedSequences,
      });
      continue;
    }

    states.set(id, {
      ...current,
      actionType:
        previous.actionType === TransactionActionType.CREATE &&
        transaction.actionType === TransactionActionType.UPDATE
          ? TransactionActionType.CREATE
          : transaction.actionType,
      body: mergeTransactionBodies(
        previous.body,
        transaction.body,
        previous.actionType,
        transaction.actionType
      ),
      mergedSequences: previous.mergedSequences,
    });
  }

  return {
    transactions: [...passthrough, ...states.values()].sort(
      (a, b) => a.sequence - b.sequence
    ),
    noopSequences,
    parseFailedSequences: new Set<number>(),
  };
};

export type SyncHeader = {
  userAgent: string;
  csrfToken?: string;
};

export type SyncProgressReporter = {
  onParsed?: () => void;
};

export const MAX_TRANSACTION_RETRY_COUNT = 5;

/* ============================== Helper functions ============================== */

export const getMergedSequences = (...sets: Set<number>[]): Set<number> => {
  const merged = new Set<number>();
  sets.forEach(set => set.forEach(value => merged.add(value)));
  return merged;
};

export const mergeSet = <T,>(target: Set<T>, values: Iterable<T>) => {
  for (const value of values) target.add(value);
};

export const dropEntityPendingOperations = (
  id: string,
  maps: Array<Map<string, EntityState<any>>>,
  noopSequences: Set<number>
) => {
  for (const map of maps) {
    const state = map.get(id);
    if (!state) continue;
    mergeSet(noopSequences, state.sequences);
    map.delete(id);
  }
};

interface TransactionSynchronizerContextType {
  status:
    | "unsynchronized"
    | "analyzing"
    | "synchronizing"
    | "migrating"
    | "synchronized";
  getTransactionCount: () => Promise<number>;
  getTerminalTransactionCount: () => Promise<number>;
  clearTerminalTransactions: () => Promise<void>;
  synchronizeTransactions: () => Promise<void>;
  synchronizationProgress: number;
}

export const TransactionSynchronizerContext = createContext<
  TransactionSynchronizerContextType | undefined
>(undefined);

interface TransactionSynchronizerProviderProps {
  children: React.ReactNode;
}

export const TransactionSynchronizerProvider = ({
  children,
}: TransactionSynchronizerProviderProps) => {
  const [status, setStatus] = useState<
    | "unsynchronized"
    | "analyzing"
    | "synchronizing"
    | "migrating"
    | "synchronized"
  >("analyzing");
  const { isOnline } = useNetwork();
  const {
    isReady: areLocalPreferencesReady,
    preferences: { localVault, offlineQueue },
  } = useLocalPreferences();

  const createRootShelfMutator = useCreateRootShelf();
  const updateRootShelvesMutator = useUpdateMyRootShelvesByIds();
  const restoreRootShelvesMutator = useRestoreMyRootShelvesByIds();
  const deleteRootShelvesMutator = useDeleteMyRootShelvesByIds();

  const createStationMutator = useCreateStation();
  const createStationsMutator = useCreateStations();
  const updateStationMutator = useUpdateMyStationById();
  const updateStationsMutator = useUpdateMyStationsByIds();
  const restoreStationMutator = useRestoreMyStationById();
  const restoreStationsMutator = useRestoreMyStationsByIds();
  const deleteStationMutator = useDeleteMyStationById();
  const deleteStationsMutator = useDeleteMyStationsByIds();
  const hardDeleteStationMutator = useHardDeleteMyStationById();
  const hardDeleteStationsMutator = useHardDeleteMyStationsByIds();

  const createRoutineMutator = useCreateRoutineByStationId();
  const createRoutinesMutator = useCreateRoutinesByStationIds();
  const updateRoutineMutator = useUpdateMyRoutineById();
  const updateRoutinesMutator = useUpdateMyRoutinesByIds();
  const restoreRoutineMutator = useRestoreMyRoutineById();
  const restoreRoutinesMutator = useRestoreMyRoutinesByIds();
  const deleteRoutineMutator = useDeleteMyRoutineById();
  const deleteRoutinesMutator = useDeleteMyRoutinesByIds();
  const hardDeleteRoutineMutator = useHardDeleteMyRoutineById();
  const hardDeleteRoutinesMutator = useHardDeleteMyRoutinesByIds();
  const linkRoutineTagMutator = useLinkRoutineTagById();
  const linkRoutineTagsMutator = useLinkRoutineTagsByIds();
  const linkRoutineItemMutator = useLinkRoutineItemById();
  const linkRoutineItemsMutator = useLinkRoutineItemsByIds();

  const createRoutineTagMutator = useCreateRoutineTag();
  const createRoutineTagsMutator = useCreateRoutineTags();
  const updateRoutineTagMutator = useUpdateMyRoutineTagById();
  const updateRoutineTagsMutator = useUpdateMyRoutineTagsByIds();
  const hardDeleteRoutineTagMutator = useHardDeleteMyRoutineTagById();
  const hardDeleteRoutineTagsMutator = useHardDeleteMyRoutineTagsByIds();

  const createSubShelvesMutator = useCreateSubShelvesByRootShelfIds();
  const updateSubShelvesMutator = useUpdateMySubShelvesByIds();
  const moveSubShelvesMutator = useMoveMySubShelvesByRootShelfIds();
  const restoreSubShelvesMutator = useRestoreMySubShelvesByIds();
  const deleteSubShelvesMutator = useDeleteMySubShelvesByIds();

  const createBlockPacksMutator = useCreateBlockPacks();
  const updateBlockPacksMutator = useUpdateMyBlockPacksByIds();
  const moveBlockPacksMutator = useMoveMyBlockPacksByParentSubShelfIds();
  const restoreBlockPacksMutator = useRestoreMyBlockPacksByIds();
  const deleteBlockPacksMutator = useDeleteMyBlockPacksByIds();

  const [synchronizationProgress, setSynchronizationProgress] =
    useState<number>(0);
  const hasBootstrappedRef = useRef<boolean>(false);
  const isBootstrappingRef = useRef<boolean>(false);
  const isSynchronizingRef = useRef<boolean>(false);

  const getTransactionCount = useCallback(async (): Promise<number> => {
    if (!areLocalPreferencesReady || !localVault || !localDB.isEnabled) {
      return 0;
    }
    if (
      !offlineQueue &&
      typeof navigator !== "undefined" &&
      navigator.onLine === false
    ) {
      return 0;
    }
    if (!localDB.isReady) await localDB.ensureReady();
    if (!localDB.isEnabled || !localDB.isReady) return 0;

    const loggedInUser = (
      await localDB
        .select({ publicId: User.publicId })
        .from(User)
        .where(eq(User.isLoggedIn, true))
        .limit(1)
    )[0];
    if (!loggedInUser) return 0;

    const transactions = await localDB
      .select({ sequence: Transaction.sequence })
      .from(Transaction)
      .where(
        and(
          eq(Transaction.ownerPublicId, loggedInUser.publicId),
          lt(Transaction.retryCount, MAX_TRANSACTION_RETRY_COUNT)
        )
      );
    return transactions.length;
  }, [areLocalPreferencesReady, localVault, offlineQueue]);

  const getTerminalTransactionCount = useCallback(async (): Promise<number> => {
    if (!areLocalPreferencesReady || !localVault || !localDB.isEnabled) {
      return 0;
    }
    if (!localDB.isReady) await localDB.ensureReady();
    if (!localDB.isEnabled || !localDB.isReady) return 0;

    const loggedInUser = (
      await localDB
        .select({ publicId: User.publicId })
        .from(User)
        .where(eq(User.isLoggedIn, true))
        .limit(1)
    )[0];
    if (!loggedInUser) return 0;

    const transactions = await localDB
      .select({ sequence: Transaction.sequence })
      .from(Transaction)
      .where(
        and(
          eq(Transaction.ownerPublicId, loggedInUser.publicId),
          gte(Transaction.retryCount, MAX_TRANSACTION_RETRY_COUNT)
        )
      );
    return transactions.length;
  }, [areLocalPreferencesReady, localVault]);

  const clearTerminalTransactions = useCallback(async (): Promise<void> => {
    if (!areLocalPreferencesReady || !localVault || !localDB.isEnabled) {
      return;
    }
    if (!localDB.isReady) await localDB.ensureReady();
    if (!localDB.isEnabled || !localDB.isReady) return;

    const loggedInUser = (
      await localDB
        .select({ publicId: User.publicId })
        .from(User)
        .where(eq(User.isLoggedIn, true))
        .limit(1)
    )[0];
    if (!loggedInUser) return;

    await localDB
      .delete(Transaction)
      .where(
        and(
          eq(Transaction.ownerPublicId, loggedInUser.publicId),
          gte(Transaction.retryCount, MAX_TRANSACTION_RETRY_COUNT)
        )
      );
  }, [areLocalPreferencesReady, localVault]);

  const syncPreparedSyncJobs = useCallback(
    async (
      transactions: InferSelectModel<typeof Transaction>[],
      mergedResult: PreparedSyncJobsResult,
      onJobFinished: () => void
    ) => {
      if (mergedResult.syncJobs.length === 0) {
        const noopAndParseFailed = Array.from(
          new Set([
            ...mergedResult.noopSequences,
            ...mergedResult.parseFailedSequences,
          ])
        );
        if (noopAndParseFailed.length > 0) {
          if (!localDB.isReady) await localDB.ensureReady();
          await localDB
            .delete(Transaction)
            .where(inArray(Transaction.sequence, noopAndParseFailed));
        }
        return;
      }

      const settledSyncJobs = await Promise.allSettled(
        mergedResult.syncJobs.map(job => job.run())
      );

      const succeededSequences = new Set<number>(mergedResult.noopSequences);
      const failedSequences = new Set<number>(
        mergedResult.parseFailedSequences
      );

      settledSyncJobs.forEach((settledSyncJob, index) => {
        const sequences = mergedResult.syncJobs[index].sequences;
        // A job is only considered synchronized when:
        //  1. the promise is fulfilled, and
        //  2. it is not an offline/local fallback response (a fallback response indicate that `success === false`).
        // `fulfilled + success:false` means request handling completed,
        // but server synchronization did not actually succeed yet.
        if (
          settledSyncJob.status === "fulfilled" &&
          !(
            typeof settledSyncJob.value === "object" &&
            settledSyncJob.value !== null &&
            "success" in settledSyncJob.value &&
            settledSyncJob.value.success === false
          )
        ) {
          mergeSet(succeededSequences, sequences);
        } else {
          mergeSet(failedSequences, sequences);
        }
        onJobFinished();
      });

      if (succeededSequences.size > 0) {
        await localDB
          .delete(Transaction)
          .where(inArray(Transaction.sequence, Array.from(succeededSequences)));
      }

      if (failedSequences.size > 0) {
        for (const sequence of failedSequences) {
          const current = transactions.find(t => t.sequence === sequence);
          await localDB
            .update(Transaction)
            .set({
              retryCount: Math.min(
                (current?.retryCount ?? 0) + 1,
                MAX_TRANSACTION_RETRY_COUNT
              ),
              lastError:
                (current?.retryCount ?? 0) + 1 >= MAX_TRANSACTION_RETRY_COUNT
                  ? "maximum retry count reached"
                  : "synchronize transaction failed",
            })
            .where(eq(Transaction.sequence, sequence));
        }
      }
    },
    []
  );

  const synchronizeTransactions = useCallback(async () => {
    if (
      !areLocalPreferencesReady ||
      !localVault ||
      !isOnline ||
      !localDB.isEnabled
    ) {
      return;
    }

    setSynchronizationProgress(0);

    const header: SyncHeader = getClientRequestHeaders();

    if (!localDB.isReady) await localDB.ensureReady();
    if (!localDB.isEnabled || !localDB.isReady) return;

    const loggedInUser = (
      await localDB
        .select({ publicId: User.publicId })
        .from(User)
        .where(eq(User.isLoggedIn, true))
        .limit(1)
    )[0];
    if (!loggedInUser) {
      setSynchronizationProgress(1);
      return;
    }

    const transactions = await localDB
      .select()
      .from(Transaction)
      .where(
        and(
          eq(Transaction.ownerPublicId, loggedInUser.publicId),
          lt(Transaction.retryCount, MAX_TRANSACTION_RETRY_COUNT)
        )
      )
      .orderBy(asc(Transaction.sequence));

    if (transactions.length === 0) {
      setSynchronizationProgress(1);
      return;
    }

    const rootShelfTransactions: InferSelectModel<typeof Transaction>[] = [];
    const subShelfTransactions: InferSelectModel<typeof Transaction>[] = [];
    const blockPackTransactions: InferSelectModel<typeof Transaction>[] = [];
    const blockTransactions: InferSelectModel<typeof Transaction>[] = [];
    const stationTransactions: InferSelectModel<typeof Transaction>[] = [];
    const routineTransactions: InferSelectModel<typeof Transaction>[] = [];
    const routineTagTransactions: InferSelectModel<typeof Transaction>[] = [];
    const routineRelationTransactions: InferSelectModel<typeof Transaction>[] =
      [];
    for (const transaction of transactions) {
      switch (transaction.entityType) {
        case TransactionEntityType.RootShelf:
          rootShelfTransactions.push(transaction);
          break;
        case TransactionEntityType.SubShelf:
          subShelfTransactions.push(transaction);
          break;
        case TransactionEntityType.BlockPack:
          blockPackTransactions.push(transaction);
          break;
        case TransactionEntityType.Block:
          blockTransactions.push(transaction);
          break;
        case TransactionEntityType.Station:
          stationTransactions.push(transaction);
          break;
        case TransactionEntityType.Routine:
          routineTransactions.push(transaction);
          break;
        case TransactionEntityType.RoutineTag:
          routineTagTransactions.push(transaction);
          break;
        case TransactionEntityType.RoutinesToTags:
        case TransactionEntityType.RoutinesToItems:
          routineRelationTransactions.push(transaction);
          break;
        default:
          throw new Error("undefined transaction entity type");
      }
    }

    const parseUnits = transactions.length;
    let parsedUnits = 0;

    const handleOnParsed = () => {
      parsedUnits += 1;
      if (parseUnits === 0) return;
      setSynchronizationProgress((parsedUnits / parseUnits) * 0.5);
    };

    const combineMergedTransactionsWithPreparedJobs = (
      merged: MergedTransactionsResult,
      prepared: PreparedSyncJobsResult
    ): PreparedSyncJobsResult => ({
      ...prepared,
      noopSequences: getMergedSequences(
        merged.noopSequences,
        prepared.noopSequences
      ),
      parseFailedSequences: getMergedSequences(
        merged.parseFailedSequences,
        prepared.parseFailedSequences
      ),
    });

    const mergedRootShelves = mergeRootShelfTransactions({
      transactions: rootShelfTransactions,
      onParsed: handleOnParsed,
    });
    const mergedSubShelves = mergeSubShelfTransactions({
      transactions: subShelfTransactions,
      onParsed: handleOnParsed,
    });
    const mergedBlockPacks = mergeBlockPackTransactions({
      transactions: blockPackTransactions,
      onParsed: handleOnParsed,
    });
    const mergedStations = mergeStationTransactions({
      transactions: stationTransactions,
      onParsed: handleOnParsed,
    });
    const mergedRoutines = mergeRoutineTransactions({
      transactions: routineTransactions,
      onParsed: handleOnParsed,
    });
    const mergedRoutineTags = mergeRoutineTagTransactions({
      transactions: routineTagTransactions,
      onParsed: handleOnParsed,
    });
    const mergedRoutineRelations = mergeRoutineRelationTransactions({
      transactions: routineRelationTransactions,
      onParsed: handleOnParsed,
    });

    const allPreparedResults = [
      {
        transactions: rootShelfTransactions,
        mergedResult: combineMergedTransactionsWithPreparedJobs(
          mergedRootShelves,
          prepareRootShelfSyncJobs({
            transactions: mergedRootShelves.transactions,
            header,
            mutators: {
              createRootShelfMutator,
              updateRootShelvesMutator,
              restoreRootShelvesMutator,
              deleteRootShelvesMutator,
            },
          })
        ),
      },
      {
        transactions: subShelfTransactions,
        mergedResult: combineMergedTransactionsWithPreparedJobs(
          mergedSubShelves,
          prepareSubShelfSyncJobs({
            transactions: mergedSubShelves.transactions,
            header,
            mutators: {
              createSubShelvesMutator,
              updateSubShelvesMutator,
              moveSubShelvesMutator,
              restoreSubShelvesMutator,
              deleteSubShelvesMutator,
            },
          })
        ),
      },
      {
        transactions: blockPackTransactions,
        mergedResult: combineMergedTransactionsWithPreparedJobs(
          mergedBlockPacks,
          prepareBlockPackSyncJobs({
            transactions: mergedBlockPacks.transactions,
            header,
            mutators: {
              createBlockPacksMutator,
              updateBlockPacksMutator,
              moveBlockPacksMutator,
              restoreBlockPacksMutator,
              deleteBlockPacksMutator,
            },
          })
        ),
      },
      {
        transactions: blockTransactions,
        mergedResult: {
          syncJobs: [],
          noopSequences: new Set(
            blockTransactions.map(transaction => transaction.sequence)
          ),
          parseFailedSequences: new Set<number>(),
        },
      },
      {
        transactions: stationTransactions,
        mergedResult: combineMergedTransactionsWithPreparedJobs(
          mergedStations,
          prepareStationSyncJobs({
            transactions: mergedStations.transactions,
            header,
            mutators: {
              createStationMutator,
              createStationsMutator,
              updateStationMutator,
              updateStationsMutator,
              restoreStationMutator,
              restoreStationsMutator,
              deleteStationMutator,
              deleteStationsMutator,
              hardDeleteStationMutator,
              hardDeleteStationsMutator,
            },
          })
        ),
      },
      {
        transactions: routineTransactions,
        mergedResult: combineMergedTransactionsWithPreparedJobs(
          mergedRoutines,
          prepareRoutineSyncJobs({
            transactions: mergedRoutines.transactions,
            header,
            mutators: {
              createRoutineMutator,
              createRoutinesMutator,
              updateRoutineMutator,
              updateRoutinesMutator,
              restoreRoutineMutator,
              restoreRoutinesMutator,
              deleteRoutineMutator,
              deleteRoutinesMutator,
              hardDeleteRoutineMutator,
              hardDeleteRoutinesMutator,
            },
          })
        ),
      },
      {
        transactions: routineTagTransactions,
        mergedResult: combineMergedTransactionsWithPreparedJobs(
          mergedRoutineTags,
          prepareRoutineTagSyncJobs({
            transactions: mergedRoutineTags.transactions,
            header,
            mutators: {
              createRoutineTagMutator,
              createRoutineTagsMutator,
              updateRoutineTagMutator,
              updateRoutineTagsMutator,
              hardDeleteRoutineTagMutator,
              hardDeleteRoutineTagsMutator,
            },
          })
        ),
      },
      {
        transactions: routineRelationTransactions,
        mergedResult: combineMergedTransactionsWithPreparedJobs(
          mergedRoutineRelations,
          prepareRoutineRelationSyncJobs({
            transactions: mergedRoutineRelations.transactions,
            header,
            mutators: {
              linkRoutineTagMutator,
              linkRoutineTagsMutator,
              linkRoutineItemMutator,
              linkRoutineItemsMutator,
            },
          })
        ),
      },
    ];

    const totalJobs = allPreparedResults.reduce(
      (count, item) => count + item.mergedResult.syncJobs.length,
      0
    );
    let completedJobs = 0;

    const handleJobOnFinished = () => {
      completedJobs += 1;
      if (totalJobs === 0) return;
      setSynchronizationProgress(0.5 + (completedJobs / totalJobs) * 0.5);
    };

    for (const item of allPreparedResults) {
      await syncPreparedSyncJobs(
        item.transactions,
        item.mergedResult,
        handleJobOnFinished
      );
    }

    setSynchronizationProgress(1);
  }, [
    isOnline,
    areLocalPreferencesReady,
    localVault,
    createRootShelfMutator,
    updateRootShelvesMutator,
    restoreRootShelvesMutator,
    deleteRootShelvesMutator,
    createSubShelvesMutator,
    updateSubShelvesMutator,
    moveSubShelvesMutator,
    restoreSubShelvesMutator,
    deleteSubShelvesMutator,
    createBlockPacksMutator,
    updateBlockPacksMutator,
    moveBlockPacksMutator,
    restoreBlockPacksMutator,
    deleteBlockPacksMutator,
    createStationMutator,
    createStationsMutator,
    updateStationMutator,
    updateStationsMutator,
    restoreStationMutator,
    restoreStationsMutator,
    deleteStationMutator,
    deleteStationsMutator,
    hardDeleteStationMutator,
    hardDeleteStationsMutator,
    createRoutineMutator,
    createRoutinesMutator,
    updateRoutineMutator,
    updateRoutinesMutator,
    restoreRoutineMutator,
    restoreRoutinesMutator,
    deleteRoutineMutator,
    deleteRoutinesMutator,
    hardDeleteRoutineMutator,
    hardDeleteRoutinesMutator,
    linkRoutineTagMutator,
    linkRoutineTagsMutator,
    linkRoutineItemMutator,
    linkRoutineItemsMutator,
    createRoutineTagMutator,
    createRoutineTagsMutator,
    updateRoutineTagMutator,
    updateRoutineTagsMutator,
    hardDeleteRoutineTagMutator,
    hardDeleteRoutineTagsMutator,
    syncPreparedSyncJobs,
  ]);

  useEffect(() => {
    let cancelled = false;
    if (!areLocalPreferencesReady) return;
    if (!localVault) {
      hasBootstrappedRef.current = false;
      isSynchronizingRef.current = false;
      setSynchronizationProgress(0);
      setStatus("synchronized");
      return;
    }

    const bootstrap = async () => {
      if (hasBootstrappedRef.current || isBootstrappingRef.current) return;
      isBootstrappingRef.current = true;

      const safelySetStatus = (
        nextStatus:
          | "unsynchronized"
          | "analyzing"
          | "synchronizing"
          | "migrating"
          | "synchronized"
      ) => {
        if (!cancelled) setStatus(nextStatus);
      };

      try {
        safelySetStatus("analyzing");

        const latestMigrationVersion = localDB.getLatestMigrationVersion();
        let currentStoredVersion = await localDB.getVersion();

        if (currentStoredVersion === 0 && latestMigrationVersion > 0) {
          safelySetStatus("migrating");
          await localDB.ensureMigrated({
            currentVersion: 0,
            targetVersion: latestMigrationVersion,
          });
          currentStoredVersion = await localDB.getVersion();
        }

        let missingTablesDetected = false;
        const safelyResolveTransactionCount = async (): Promise<number> => {
          try {
            return await getTransactionCount();
          } catch {
            missingTablesDetected = true;
            currentStoredVersion = 0;
            return 0;
          }
        };

        const transactionCountBeforeMigration =
          await safelyResolveTransactionCount();

        if (
          missingTablesDetected ||
          currentStoredVersion !== latestMigrationVersion
        ) {
          if (transactionCountBeforeMigration > 0) {
            safelySetStatus("synchronizing");
            await synchronizeTransactions();
          }

          const transactionCountAfterSync =
            await safelyResolveTransactionCount();
          if (transactionCountAfterSync > 0) {
            safelySetStatus("unsynchronized");
            return;
          }

          safelySetStatus("migrating");
          await localDB.ensureMigrated({
            currentVersion: currentStoredVersion,
            targetVersion: latestMigrationVersion,
          });
        } else {
          if (transactionCountBeforeMigration > 0) {
            safelySetStatus("synchronizing");
            await synchronizeTransactions();
          }
        }

        hasBootstrappedRef.current = true;
      } catch (error) {
        console.error(
          "failed to bootstrap transaction synchronization:",
          error
        );
        safelySetStatus("unsynchronized");
        return;
      } finally {
        isBootstrappingRef.current = false;
      }

      safelySetStatus("synchronized");
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [
    areLocalPreferencesReady,
    localVault,
    getTransactionCount,
    synchronizeTransactions,
  ]);

  useEffect(() => {
    let cancelled = false;

    const synchronizeWhenOnline = async () => {
      if (
        !areLocalPreferencesReady ||
        !localVault ||
        !isOnline ||
        isSynchronizingRef.current ||
        isBootstrappingRef.current
      ) {
        return;
      }

      const pendingCount = await getTransactionCount();
      if (pendingCount === 0) {
        if (!cancelled && hasBootstrappedRef.current) {
          setStatus("synchronized");
        }
        return;
      }

      isSynchronizingRef.current = true;
      if (!cancelled) setStatus("synchronizing");
      try {
        await synchronizeTransactions();
        const remainingCount = await getTransactionCount();
        if (!cancelled) {
          setStatus(remainingCount > 0 ? "unsynchronized" : "synchronized");
        }
      } catch (error) {
        console.error(
          "failed to synchronize transactions on online event:",
          error
        );
        if (!cancelled) setStatus("unsynchronized");
      } finally {
        isSynchronizingRef.current = false;
      }
    };

    void synchronizeWhenOnline();

    return () => {
      cancelled = true;
    };
  }, [
    areLocalPreferencesReady,
    localVault,
    isOnline,
    getTransactionCount,
    synchronizeTransactions,
  ]);

  return (
    <TransactionSynchronizerContext.Provider
      value={{
        status: status,
        synchronizationProgress: synchronizationProgress,
        getTransactionCount: getTransactionCount,
        getTerminalTransactionCount: getTerminalTransactionCount,
        clearTerminalTransactions: clearTerminalTransactions,
        synchronizeTransactions: synchronizeTransactions,
      }}
    >
      {children}
    </TransactionSynchronizerContext.Provider>
  );
};
