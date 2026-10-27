import type { UUID } from "node:crypto";
import { NotegicAPIError, NotegicException } from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { useTranslation } from "@shared/i18n/useTranslation";
import toast from "@shared/lib/toast";
import { useRef, useState } from "react";
import { getClientMutationHeaders } from "@/api/clientHeaders";
import {
  useGetMyBlockPackById,
  useHardDeleteMyBlockPacksByIds,
  useRestoreMyBlockPacksByIds,
} from "@/api/hooks/blockPack.hook";
import {
  useGetMyMaterialAndItsParentById,
  useHardDeleteMyMaterialsByIds,
  useRestoreMyMaterialsByIds,
} from "@/api/hooks/material.hook";
import {
  useHardDeleteMyRootShelvesByIds,
  useRestoreMyRootShelvesByIds,
} from "@/api/hooks/rootShelf.hook";
import {
  useHardDeleteMyRoutinesByIds,
  useRestoreMyRoutinesByIds,
} from "@/api/hooks/routine.hook";
import {
  useHardDeleteMyStationsByIds,
  useRestoreMyStationsByIds,
} from "@/api/hooks/station.hook";
import {
  useHardDeleteMySubShelvesByIds,
  useRestoreMySubShelvesByIds,
} from "@/api/hooks/subShelf.hook";

export type TrashEntry = {
  id: UUID;
  name: string;
  deletedAt?: Date | null;
} & (
  | { type: "rootShelf" }
  | { type: "station" }
  | { type: "routine" }
  | {
      type: "subShelf";
      rootShelfId: UUID;
      prevSubShelfId?: UUID | null;
      path: UUID[];
    }
  | { type: "material"; parentSubShelfId: UUID }
  | { type: "blockPack"; parentSubShelfId: UUID }
);

export const getTrashEntryKey = (entry: TrashEntry) =>
  `${entry.type}-${entry.id}-${new Date(entry.deletedAt ?? 0).getTime()}`;

export const useTrashActions = (onChanged: () => Promise<void>) => {
  const { t } = useTranslation();
  const restoreRootShelves = useRestoreMyRootShelvesByIds({
    offlineFallback: false,
  });
  const restoreSubShelves = useRestoreMySubShelvesByIds({
    offlineFallback: false,
  });
  const restoreMaterials = useRestoreMyMaterialsByIds();
  const restoreBlockPacks = useRestoreMyBlockPacksByIds({
    offlineFallback: false,
  });
  const restoreStations = useRestoreMyStationsByIds({ offlineFallback: false });
  const restoreRoutines = useRestoreMyRoutinesByIds({ offlineFallback: false });
  const deleteRootShelves = useHardDeleteMyRootShelvesByIds();
  const deleteSubShelves = useHardDeleteMySubShelvesByIds();
  const deleteMaterials = useHardDeleteMyMaterialsByIds();
  const deleteBlockPacks = useHardDeleteMyBlockPacksByIds();
  const deleteStations = useHardDeleteMyStationsByIds({
    offlineFallback: false,
  });
  const deleteRoutines = useHardDeleteMyRoutinesByIds({
    offlineFallback: false,
  });
  const material = useGetMyMaterialAndItsParentById(undefined, {
    retry: false,
  });
  const blockPack = useGetMyBlockPackById(undefined, { retry: false });
  const busy = useRef(false);
  const [pendingEntry, setPendingEntry] = useState<string | null>(null);
  const [completedEntries, setCompletedEntries] = useState<Set<string>>(
    new Set()
  );

  const perform = async (
    entries: TrashEntry[],
    action: "restore" | "hardDelete"
  ) => {
    if (busy.current || entries.length === 0) return false;
    const remaining = entries.filter(
      entry => !completedEntries.has(getTrashEntryKey(entry))
    );
    if (remaining.length === 0) return true;
    busy.current = true;
    setPendingEntry(getTrashEntryKey(remaining[0]));
    let changed = false;
    let failure: unknown;
    try {
      if (!navigator.onLine)
        throw new NotegicFetchError(FetchClientExceptions.NetworkRequired());
      const rootShelfIds = new Map<UUID, UUID>();
      for (const entry of remaining)
        if (entry.type === "subShelf")
          rootShelfIds.set(entry.id, entry.rootShelfId);
      // Children run first so parent cascades cannot invalidate a later selected request.
      for (const type of [
        "material",
        "blockPack",
        "subShelf",
        "rootShelf",
        "routine",
        "station",
      ] as const) {
        const group = remaining.filter(entry => entry.type === type);
        const depths = [
          ...new Set(
            group.map(entry =>
              entry.type === "subShelf" ? entry.path.length : 0
            )
          ),
        ].sort((left, right) => right - left);
        for (const depth of depths) {
          const batch = group.filter(
            entry => entry.type !== "subShelf" || entry.path.length === depth
          );
          const ids = batch.map(entry => entry.id);
          const parents: UUID[] = [];
          const roots: UUID[] = [];
          if (action === "restore") {
            for (const entry of batch) {
              if (entry.type !== "material" && entry.type !== "blockPack")
                continue;
              let rootShelfId = rootShelfIds.get(entry.parentSubShelfId);
              if (!rootShelfId) {
                const detail =
                  entry.type === "material"
                    ? await material.fetch({
                        header: getClientMutationHeaders(),
                        param: { materialId: entry.id, isDeleted: true },
                      })
                    : await blockPack.fetch({
                        header: getClientMutationHeaders(),
                        param: { blockPackId: entry.id, isDeleted: true },
                      });
                if (!detail.success)
                  throw detail.exception
                    ? new NotegicAPIError(
                        new NotegicException(detail.exception)
                      )
                    : new Error("workspace.trash.actionFailed");
                rootShelfId = detail.data.rootShelfId as UUID;
                rootShelfIds.set(entry.parentSubShelfId, rootShelfId);
              }
              parents.push(entry.parentSubShelfId);
              roots.push(rootShelfId);
            }
          }
          let response;
          if (action === "hardDelete") {
            switch (type) {
              case "rootShelf":
                response = await deleteRootShelves.mutateAsync({
                  header: getClientMutationHeaders(),
                  body: { rootShelfIds: ids },
                });
                break;
              case "subShelf":
                response = await deleteSubShelves.mutateAsync({
                  header: getClientMutationHeaders(),
                  body: { subShelfIds: ids },
                });
                break;
              case "material":
                response = await deleteMaterials.mutateAsync({
                  header: getClientMutationHeaders(),
                  body: { materialIds: ids },
                });
                break;
              case "blockPack":
                response = await deleteBlockPacks.mutateAsync({
                  header: getClientMutationHeaders(),
                  body: { blockPackIds: ids },
                });
                break;
              case "station":
                response = await deleteStations.mutateAsync({
                  header: getClientMutationHeaders(),
                  body: { stationIds: ids },
                });
                break;
              case "routine":
                response = await deleteRoutines.mutateAsync({
                  header: getClientMutationHeaders(),
                  body: { routineIds: ids },
                });
                break;
            }
          } else {
            switch (type) {
              case "rootShelf":
                response = await restoreRootShelves.mutateAsync({
                  header: getClientMutationHeaders(),
                  body: { rootShelfIds: ids },
                });
                break;
              case "subShelf": {
                const shelves = batch.filter(
                  entry => entry.type === "subShelf"
                );
                response = await restoreSubShelves.mutateAsync({
                  header: getClientMutationHeaders(),
                  body: { subShelfIds: ids },
                  affected: {
                    rootShelfIds: shelves.map(entry => entry.rootShelfId),
                    prevSubShelfIds: shelves.flatMap(entry =>
                      entry.prevSubShelfId ? [entry.prevSubShelfId] : []
                    ),
                  },
                });
                break;
              }
              case "material":
                response = await restoreMaterials.mutateAsync({
                  header: getClientMutationHeaders(),
                  body: { materialIds: ids },
                  affected: { rootShelfIds: roots, parentSubShelfIds: parents },
                });
                break;
              case "blockPack":
                response = await restoreBlockPacks.mutateAsync({
                  header: getClientMutationHeaders(),
                  body: { blockPackIds: ids },
                  affected: { rootShelfIds: roots, parentSubShelfIds: parents },
                });
                break;
              case "station":
                response = await restoreStations.mutateAsync({
                  header: getClientMutationHeaders(),
                  body: { stationIds: ids },
                });
                break;
              case "routine":
                response = await restoreRoutines.mutateAsync({
                  header: getClientMutationHeaders(),
                  body: { routineIds: ids },
                });
                break;
            }
          }
          if (!response.success)
            throw response.exception
              ? new NotegicAPIError(new NotegicException(response.exception))
              : new Error("workspace.trash.actionFailed");
          const restoredIds = new Set(
            Array.isArray(response.data)
              ? response.data.map(item => item.id)
              : []
          );
          const confirmed =
            action === "hardDelete"
              ? batch
              : batch.filter(entry => restoredIds.has(entry.id));
          if (confirmed.length > 0) {
            changed = true;
            setCompletedEntries(
              previous =>
                new Set([...previous, ...confirmed.map(getTrashEntryKey)])
            );
          }
          if (confirmed.length !== batch.length)
            throw new Error("workspace.trash.actionFailed");
        }
      }
      toast.success(
        action === "restore"
          ? t("workspace.trash.restored")
          : t("workspace.trash.hardDeleted")
      );
    } catch (error) {
      failure = error;
    } finally {
      if (changed) {
        try {
          await onChanged();
        } catch {
          toast.error(t("workspace.trash.refreshFailed"));
        }
      }
      busy.current = false;
      setPendingEntry(null);
    }
    if (failure) throw failure;
    return true;
  };

  return { perform, pendingEntry, completedEntries };
};
