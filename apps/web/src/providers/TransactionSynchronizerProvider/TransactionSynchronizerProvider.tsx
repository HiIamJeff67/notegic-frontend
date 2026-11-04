import { NetworkExceptions } from "@shared/api/exceptions/network.exception";
import { and, asc, eq, gte, InferSelectModel, inArray, lt } from "drizzle-orm";
import { createContext, useCallback, useEffect, useRef, useState } from "react";
import { isVirtualMode } from "@/api/availability";
import { getClientRequestHeaders } from "@/api/clientHeaders";
import {
  MaterialLocalSynchronizer,
  replaceMaterialId,
} from "@/api/local/synchronizers/material.synchronizer";
import {
  useCreateBlockPacks,
  useDeleteMyBlockPacksByIds,
  useHardDeleteMyBlockPacksByIds,
  useMoveMyBlockPacksByParentSubShelfIds,
  useRestoreMyBlockPacksByIds,
  useUpdateMyBlockPacksByIds,
} from "@/api/hooks/blockPack.hook";
import {
  useCreateMyMaterial,
  useDeleteMyMaterialById,
  useDeleteMyMaterialsByIds,
  useHardDeleteMyMaterialsByIds,
  useMoveMyMaterialById,
  useRestoreMyMaterialById,
  useRestoreMyMaterialsByIds,
  useUpdateMyMaterialById,
} from "@/api/hooks/material.hook";
import {
  useCreateRootShelf,
  useDeleteMyRootShelvesByIds,
  useDeleteRootShelfPermissions,
  useHardDeleteMyRootShelvesByIds,
  useLeaveMyRootShelf,
  useRestoreMyRootShelvesByIds,
  useTransferMyRootShelfOwnership,
  useUpdateMyRootShelvesByIds,
  useUpsertRootShelfPermission,
} from "@/api/hooks/rootShelf.hook";
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
  useLinkRoutineTaskById,
  useLinkRoutineTasksByIds,
  useRestoreMyRoutineById,
  useRestoreMyRoutinesByIds,
  useUpdateMyRoutineById,
  useUpdateMyRoutinesByIds,
} from "@/api/hooks/routine.hook";
import {
  useCreateRoutineTag,
  useCreateRoutineTags,
  useHardDeleteMyRoutineTagById,
  useHardDeleteMyRoutineTagsByIds,
  useUpdateMyRoutineTagById,
  useUpdateMyRoutineTagsByIds,
} from "@/api/hooks/routineTag.hook";
import {
  useCreateRoutineTaskByRoutineId,
  useHardDeleteMyRoutineTaskById,
  useUpdateMyRoutineTaskById,
} from "@/api/hooks/routineTask.hook";
import {
  useCreateStation,
  useCreateStations,
  useDeleteMyStationById,
  useDeleteMyStationsByIds,
  useHardDeleteMyStationById,
  useHardDeleteMyStationsByIds,
  useLeaveMyStation,
  useRestoreMyStationById,
  useRestoreMyStationsByIds,
  useTransferMyStationOwnership,
  useUpdateMyStationById,
  useUpdateMyStationsByIds,
} from "@/api/hooks/station.hook";
import {
  useCreateSubShelvesByRootShelfIds,
  useDeleteMySubShelvesByIds,
  useHardDeleteMySubShelvesByIds,
  useMoveMySubShelvesByRootShelfIds,
  useRestoreMySubShelvesByIds,
  useUpdateMySubShelvesByIds,
} from "@/api/hooks/subShelf.hook";
import { localDB } from "@/api/local/db";
import { Transaction, User } from "@/api/local/schemas";
import { TransactionActionType } from "@/api/local/schemas/enums/transaction_action_type.enum";
import { TransactionEntityType } from "@/api/local/schemas/enums/transaction_entity_type.enum";
import { RoutineTaskLocalSynchronizer } from "@/api/local/synchronizers/routineTask.synchronizer";
import { useNetwork } from "@/hooks";
import { useLocalPreferences } from "@/hooks/useLocalPreferences";
import {
  mergeBlockPackTransactions,
  prepareBlockPackSyncJobs,
} from "./blockPackSyncLogic";
import {
  mergeMaterialTransactions,
  prepareMaterialSyncJobs,
} from "./materialSyncLogic";
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
import { prepareRoutineTaskSyncJobs } from "./RoutineTaskSyncLogic";
import {
  mergeRootShelfTransactions,
  prepareRootShelfPermissionSyncJobs,
  prepareRootShelfSyncJobs,
} from "./rootShelfSyncLogic";
import {
  mergeStationTransactions,
  prepareStationMembershipSyncJobs,
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
  deferredSequences?: Set<number>;
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
  synchronizationRevision: number;
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

  const createRootShelfMutator = useCreateRootShelf({ offlineFallback: false });
  const updateRootShelvesMutator = useUpdateMyRootShelvesByIds({
    offlineFallback: false,
  });
  const restoreRootShelvesMutator = useRestoreMyRootShelvesByIds({
    offlineFallback: false,
  });
  const deleteRootShelvesMutator = useDeleteMyRootShelvesByIds({
    offlineFallback: false,
  });
  const hardDeleteRootShelvesMutator = useHardDeleteMyRootShelvesByIds({
    offlineFallback: false,
  });
  const upsertRootShelfPermissionMutator = useUpsertRootShelfPermission({
    offlineFallback: false,
  });
  const deleteRootShelfPermissionsMutator = useDeleteRootShelfPermissions({
    offlineFallback: false,
  });
  const transferRootShelfMutator = useTransferMyRootShelfOwnership({
    offlineFallback: false,
  });
  const leaveRootShelfMutator = useLeaveMyRootShelf({ offlineFallback: false });

  const createStationMutator = useCreateStation({ offlineFallback: false });
  const createStationsMutator = useCreateStations({ offlineFallback: false });
  const updateStationMutator = useUpdateMyStationById({
    offlineFallback: false,
  });
  const updateStationsMutator = useUpdateMyStationsByIds({
    offlineFallback: false,
  });
  const restoreStationMutator = useRestoreMyStationById({
    offlineFallback: false,
  });
  const restoreStationsMutator = useRestoreMyStationsByIds({
    offlineFallback: false,
  });
  const deleteStationMutator = useDeleteMyStationById({
    offlineFallback: false,
  });
  const deleteStationsMutator = useDeleteMyStationsByIds({
    offlineFallback: false,
  });
  const hardDeleteStationMutator = useHardDeleteMyStationById({
    offlineFallback: false,
  });
  const hardDeleteStationsMutator = useHardDeleteMyStationsByIds({
    offlineFallback: false,
  });
  const transferStationMutator = useTransferMyStationOwnership({
    offlineFallback: false,
  });
  const leaveStationMutator = useLeaveMyStation({ offlineFallback: false });

  const createRoutineTaskMutator = useCreateRoutineTaskByRoutineId(false);
  const updateRoutineTaskMutator = useUpdateMyRoutineTaskById(false);
  const hardDeleteRoutineTaskMutator = useHardDeleteMyRoutineTaskById(false);
  const createRoutineMutator = useCreateRoutineByStationId({
    offlineFallback: false,
  });
  const createRoutinesMutator = useCreateRoutinesByStationIds({
    offlineFallback: false,
  });
  const updateRoutineMutator = useUpdateMyRoutineById(false);
  const updateRoutinesMutator = useUpdateMyRoutinesByIds({
    offlineFallback: false,
  });
  const restoreRoutineMutator = useRestoreMyRoutineById({
    offlineFallback: false,
  });
  const restoreRoutinesMutator = useRestoreMyRoutinesByIds({
    offlineFallback: false,
  });
  const deleteRoutineMutator = useDeleteMyRoutineById({
    offlineFallback: false,
  });
  const deleteRoutinesMutator = useDeleteMyRoutinesByIds({
    offlineFallback: false,
  });
  const hardDeleteRoutineMutator = useHardDeleteMyRoutineById({
    offlineFallback: false,
  });
  const hardDeleteRoutinesMutator = useHardDeleteMyRoutinesByIds({
    offlineFallback: false,
  });
  const linkRoutineTagMutator = useLinkRoutineTagById({
    offlineFallback: false,
  });
  const linkRoutineTagsMutator = useLinkRoutineTagsByIds({
    offlineFallback: false,
  });
  const linkRoutineItemMutator = useLinkRoutineItemById({
    offlineFallback: false,
  });
  const linkRoutineItemsMutator = useLinkRoutineItemsByIds({
    offlineFallback: false,
  });
  const linkRoutineTaskMutator = useLinkRoutineTaskById({
    offlineFallback: false,
  });
  const linkRoutineTasksMutator = useLinkRoutineTasksByIds({
    offlineFallback: false,
  });

  const createRoutineTagMutator = useCreateRoutineTag({
    offlineFallback: false,
  });
  const createRoutineTagsMutator = useCreateRoutineTags({
    offlineFallback: false,
  });
  const updateRoutineTagMutator = useUpdateMyRoutineTagById({
    offlineFallback: false,
  });
  const updateRoutineTagsMutator = useUpdateMyRoutineTagsByIds({
    offlineFallback: false,
  });
  const hardDeleteRoutineTagMutator = useHardDeleteMyRoutineTagById({
    offlineFallback: false,
  });
  const hardDeleteRoutineTagsMutator = useHardDeleteMyRoutineTagsByIds({
    offlineFallback: false,
  });

  const createSubShelvesMutator = useCreateSubShelvesByRootShelfIds({
    offlineFallback: false,
  });
  const updateSubShelvesMutator = useUpdateMySubShelvesByIds({
    offlineFallback: false,
  });
  const moveSubShelvesMutator = useMoveMySubShelvesByRootShelfIds({
    offlineFallback: false,
  });
  const restoreSubShelvesMutator = useRestoreMySubShelvesByIds({
    offlineFallback: false,
  });
  const deleteSubShelvesMutator = useDeleteMySubShelvesByIds({
    offlineFallback: false,
  });
  const hardDeleteSubShelvesMutator = useHardDeleteMySubShelvesByIds({
    offlineFallback: false,
  });

  const createBlockPacksMutator = useCreateBlockPacks({
    offlineFallback: false,
  });
  const updateBlockPacksMutator = useUpdateMyBlockPacksByIds({
    offlineFallback: false,
  });
  const moveBlockPacksMutator = useMoveMyBlockPacksByParentSubShelfIds({
    offlineFallback: false,
  });
  const restoreBlockPacksMutator = useRestoreMyBlockPacksByIds({
    offlineFallback: false,
  });
  const deleteBlockPacksMutator = useDeleteMyBlockPacksByIds({
    offlineFallback: false,
  });
  const hardDeleteBlockPacksMutator = useHardDeleteMyBlockPacksByIds({
    offlineFallback: false,
  });
  const createMaterialMutator = useCreateMyMaterial({ offlineFallback: false });
  const updateMaterialMutator = useUpdateMyMaterialById({
    offlineFallback: false,
  });
  const moveMaterialMutator = useMoveMyMaterialById({ offlineFallback: false });
  const restoreMaterialMutator = useRestoreMyMaterialById({
    offlineFallback: false,
  });
  const restoreMaterialsMutator = useRestoreMyMaterialsByIds({
    offlineFallback: false,
  });
  const deleteMaterialMutator = useDeleteMyMaterialById({
    offlineFallback: false,
  });
  const deleteMaterialsMutator = useDeleteMyMaterialsByIds({
    offlineFallback: false,
  });
  const hardDeleteMaterialsMutator = useHardDeleteMyMaterialsByIds({
    offlineFallback: false,
  });

  const [synchronizationRevision, setSynchronizationRevision] = useState(0);
  const activeSynchronizationRef = useRef<Promise<void> | null>(null);
  const [synchronizationProgress, setSynchronizationProgress] =
    useState<number>(0);
  const hasBootstrappedRef = useRef<boolean>(false);
  const isBootstrappingRef = useRef<boolean>(false);
  const isSynchronizingRef = useRef<boolean>(false);

  const getTransactionCount = useCallback(async (): Promise<number> => {
    if (
      !areLocalPreferencesReady ||
      !localVault ||
      !localDB.isEnabled ||
      localDB.isReadOnly
    ) {
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
    if (
      !areLocalPreferencesReady ||
      !localVault ||
      !localDB.isEnabled ||
      localDB.isReadOnly
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
          gte(Transaction.retryCount, MAX_TRANSACTION_RETRY_COUNT)
        )
      );
    return transactions.length;
  }, [areLocalPreferencesReady, localVault]);

  const clearTerminalTransactions = useCallback(async (): Promise<void> => {
    if (
      !areLocalPreferencesReady ||
      !localVault ||
      !localDB.isEnabled ||
      localDB.isReadOnly
    ) {
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
        const value =
          settledSyncJob.status === "fulfilled" ? settledSyncJob.value : null;
        const keptLocally =
          typeof value === "object" &&
          value !== null &&
          "success" in value &&
          value.success === true &&
          "embedded" in value &&
          typeof value.embedded === "object" &&
          value.embedded !== null &&
          "publicId" in value.embedded &&
          value.embedded.publicId === "";
        const remoteUnreachable =
          keptLocally ||
          (settledSyncJob.status === "rejected" &&
            NetworkExceptions.isMissingNetworkError(settledSyncJob.reason));
        if (
          !remoteUnreachable &&
          settledSyncJob.status === "fulfilled" &&
          !(
            typeof settledSyncJob.value === "object" &&
            settledSyncJob.value !== null &&
            "success" in settledSyncJob.value &&
            settledSyncJob.value.success === false
          )
        ) {
          mergeSet(succeededSequences, sequences);
        } else if (
          !remoteUnreachable &&
          ![...sequences].some(sequence =>
            mergedResult.deferredSequences?.has(sequence)
          )
        ) {
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

  const performSynchronization = useCallback(async () => {
    if (
      !areLocalPreferencesReady ||
      !localVault ||
      !isOnline ||
      isVirtualMode() ||
      !localDB.isEnabled ||
      localDB.isReadOnly
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
    const materialTransactions: InferSelectModel<typeof Transaction>[] = [];
    const blockTransactions: InferSelectModel<typeof Transaction>[] = [];
    const rootShelfPermissionTransactions: InferSelectModel<
      typeof Transaction
    >[] = [];
    const stationMembershipTransactions: InferSelectModel<
      typeof Transaction
    >[] = [];
    const stationTransactions: InferSelectModel<typeof Transaction>[] = [];
    const routineTransactions: InferSelectModel<typeof Transaction>[] = [];
    const routineTaskTransactions: InferSelectModel<typeof Transaction>[] = [];
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
        case TransactionEntityType.Material:
          materialTransactions.push(transaction);
          break;
        case TransactionEntityType.RootShelfPermission:
          rootShelfPermissionTransactions.push(transaction);
          break;
        case TransactionEntityType.StationMembership:
          stationMembershipTransactions.push(transaction);
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
        case TransactionEntityType.RoutineTask:
          routineTaskTransactions.push(transaction);
          break;
        case TransactionEntityType.RoutineTag:
          routineTagTransactions.push(transaction);
          break;
        case TransactionEntityType.RoutinesToTags:
        case TransactionEntityType.RoutinesToItems:
        case TransactionEntityType.RoutinesToTasks:
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
    const mergedMaterials = mergeMaterialTransactions({
      transactions: materialTransactions,
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
              hardDeleteRootShelvesMutator,
            },
          })
        ),
      },
      {
        transactions: rootShelfPermissionTransactions,
        mergedResult: prepareRootShelfPermissionSyncJobs({
          transactions: rootShelfPermissionTransactions,
          header,
          mutators: {
            upsertRootShelfPermissionMutator,
            deleteRootShelfPermissionsMutator,
            transferRootShelfMutator,
            leaveRootShelfMutator,
          },
        }),
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
              hardDeleteSubShelvesMutator,
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
              hardDeleteBlockPacksMutator,
            },
          })
        ),
      },
      {
        transactions: materialTransactions,
        mergedResult: combineMergedTransactionsWithPreparedJobs(
          mergedMaterials,
          prepareMaterialSyncJobs({
            transactions: mergedMaterials.transactions,
            header,
            acknowledgeCreate: async (offlineId, remoteId, sequences) => {
              await MaterialLocalSynchronizer.acknowledgeCreate(
                offlineId,
                remoteId,
                sequences
              );
              for (const pending of [
                ...transactions,
                ...mergedMaterials.transactions,
                ...mergedRoutineRelations.transactions,
              ]) {
                pending.body = replaceMaterialId(
                  pending.body,
                  offlineId,
                  remoteId
                );
                pending.affected = replaceMaterialId(
                  pending.affected,
                  offlineId,
                  remoteId
                );
              }
            },
            mutators: {
              createMaterialMutator,
              updateMaterialMutator,
              moveMaterialMutator,
              restoreMaterialMutator,
              restoreMaterialsMutator,
              deleteMaterialMutator,
              deleteMaterialsMutator,
              hardDeleteMaterialsMutator,
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
        transactions: stationMembershipTransactions,
        mergedResult: prepareStationMembershipSyncJobs({
          transactions: stationMembershipTransactions,
          header,
          mutators: {
            transferStationMutator,
            leaveStationMutator,
          },
        }),
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
              linkRoutineTaskMutator,
              linkRoutineTasksMutator,
            },
          })
        ),
      },
      {
        transactions: routineTaskTransactions,
        mergedResult: prepareRoutineTaskSyncJobs({
          transactions: routineTaskTransactions,
          header,
          acknowledge: async (acknowledged, routineId, expected, confirmed) => {
            const advanced =
              await RoutineTaskLocalSynchronizer.acknowledgeMutation(
                acknowledged,
                routineId,
                expected,
                confirmed
              );
            for (const successor of advanced) {
              const prepared = routineTaskTransactions.find(
                entry => entry.sequence === successor.sequence
              );
              if (prepared) prepared.body = successor.body;
            }
          },
          mutators: {
            createRoutineTaskMutator,
            updateRoutineTaskMutator,
            hardDeleteRoutineTaskMutator,
          },
        }),
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
    hardDeleteRootShelvesMutator,
    upsertRootShelfPermissionMutator,
    deleteRootShelfPermissionsMutator,
    transferRootShelfMutator,
    leaveRootShelfMutator,
    createSubShelvesMutator,
    updateSubShelvesMutator,
    moveSubShelvesMutator,
    restoreSubShelvesMutator,
    deleteSubShelvesMutator,
    hardDeleteSubShelvesMutator,
    createBlockPacksMutator,
    updateBlockPacksMutator,
    moveBlockPacksMutator,
    restoreBlockPacksMutator,
    deleteBlockPacksMutator,
    hardDeleteBlockPacksMutator,
    createMaterialMutator,
    updateMaterialMutator,
    moveMaterialMutator,
    restoreMaterialMutator,
    restoreMaterialsMutator,
    deleteMaterialMutator,
    deleteMaterialsMutator,
    hardDeleteMaterialsMutator,
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
    transferStationMutator,
    leaveStationMutator,
    createRoutineTaskMutator,
    updateRoutineTaskMutator,
    hardDeleteRoutineTaskMutator,
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
    linkRoutineTaskMutator,
    linkRoutineTasksMutator,
    createRoutineTagMutator,
    createRoutineTagsMutator,
    updateRoutineTagMutator,
    updateRoutineTagsMutator,
    hardDeleteRoutineTagMutator,
    hardDeleteRoutineTagsMutator,
    syncPreparedSyncJobs,
  ]);

  const performSynchronizationRef = useRef(performSynchronization);
  useEffect(() => {
    performSynchronizationRef.current = performSynchronization;
  }, [performSynchronization]);

  const synchronizeTransactions = useCallback(() => {
    if (activeSynchronizationRef.current)
      return activeSynchronizationRef.current;
    const synchronization = performSynchronizationRef.current().finally(() => {
      activeSynchronizationRef.current = null;
      setSynchronizationRevision(revision => revision + 1);
    });
    activeSynchronizationRef.current = synchronization;
    return synchronization;
  }, []);

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
    if (localDB.isReadOnly) {
      setStatus("unsynchronized");
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
        safelySetStatus("migrating");
        const migrationResult = await localDB.ensureReady({
          targetVersion: latestMigrationVersion,
        });

        if (migrationResult.finalVersion !== latestMigrationVersion) {
          throw new Error(
            `Local database migration stopped at version ${migrationResult.finalVersion}; expected ${latestMigrationVersion}.`
          );
        }

        localDB.transitionDiagnostics("checking-transaction-queue");
        const transactionCount = await getTransactionCount();
        if (transactionCount > 0) {
          safelySetStatus("synchronizing");
          localDB.transitionDiagnostics("resynchronizing");
          await synchronizeTransactions();
        }

        hasBootstrappedRef.current = true;
        localDB.transitionDiagnostics("ready", {
          result: "success",
          recoverability: "success",
        });
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
        isVirtualMode() ||
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
        synchronizationRevision,
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
