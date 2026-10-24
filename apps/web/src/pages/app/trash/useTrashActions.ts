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
  useRestoreMyBlockPackById,
} from "@/api/hooks/blockPack.hook";
import {
  useGetMyMaterialAndItsParentById,
  useRestoreMyMaterialById,
} from "@/api/hooks/material.hook";
import { useRestoreMyRootShelfById } from "@/api/hooks/rootShelf.hook";
import {
  useHardDeleteMyRoutineById,
  useRestoreMyRoutineById,
} from "@/api/hooks/routine.hook";
import {
  useHardDeleteMyStationById,
  useRestoreMyStationById,
} from "@/api/hooks/station.hook";
import { useRestoreMySubShelfById } from "@/api/hooks/subShelf.hook";

export type TrashEntry = {
  id: UUID;
  name: string;
  deletedAt?: Date | null;
} & (
  | { type: "rootShelf" | "station" | "routine" }
  | { type: "subShelf"; rootShelfId: UUID; prevSubShelfId?: UUID | null }
  | { type: "material" | "blockPack"; parentSubShelfId: UUID }
);

export const useTrashActions = (onChanged: () => Promise<void>) => {
  const { t } = useTranslation();
  const restoreRootShelf = useRestoreMyRootShelfById();
  const restoreSubShelf = useRestoreMySubShelfById();
  const restoreMaterial = useRestoreMyMaterialById();
  const restoreBlockPack = useRestoreMyBlockPackById();
  const restoreStation = useRestoreMyStationById();
  const restoreRoutine = useRestoreMyRoutineById();
  const deleteStation = useHardDeleteMyStationById();
  const deleteRoutine = useHardDeleteMyRoutineById();
  const material = useGetMyMaterialAndItsParentById(undefined, {
    retry: false,
  });
  const blockPack = useGetMyBlockPackById(undefined, { retry: false });
  const busy = useRef(false);
  const [pendingEntry, setPendingEntry] = useState<string | null>(null);
  const [completedEntries, setCompletedEntries] = useState<Map<string, number>>(
    new Map()
  );

  const perform = async (
    entry: TrashEntry,
    action: "restore" | "hardDelete"
  ) => {
    if (busy.current) return false;
    busy.current = true;
    const key = `${entry.type}-${entry.id}`;
    setPendingEntry(key);
    try {
      // Trash actions require a confirmed server result, not an offline simulation.
      if (!navigator.onLine)
        throw new NotegicFetchError(FetchClientExceptions.NetworkRequired());
      let response;
      if (action === "hardDelete") {
        if (entry.type === "station") {
          response = await deleteStation.mutateAsync({
            header: getClientMutationHeaders(),
            body: { stationId: entry.id },
          });
        } else if (entry.type === "routine") {
          response = await deleteRoutine.mutateAsync({
            header: getClientMutationHeaders(),
            body: { routineId: entry.id },
          });
        } else {
          throw new Error("workspace.trash.hardDeleteUnavailable");
        }
      } else {
        switch (entry.type) {
          case "rootShelf":
            response = await restoreRootShelf.mutateAsync({
              header: getClientMutationHeaders(),
              body: { rootShelfId: entry.id },
            });
            break;
          case "subShelf":
            response = await restoreSubShelf.mutateAsync({
              header: getClientMutationHeaders(),
              body: { subShelfId: entry.id },
              affected: {
                rootShelfId: entry.rootShelfId,
                prevSubShelfId: entry.prevSubShelfId ?? null,
              },
            });
            break;
          case "material": {
            const detail = await material.fetch({
              header: getClientMutationHeaders(),
              param: { materialId: entry.id, isDeleted: true },
            });
            if (!detail.success)
              throw detail.exception
                ? new NotegicAPIError(new NotegicException(detail.exception))
                : new Error("workspace.trash.actionFailed");
            response = await restoreMaterial.mutateAsync({
              header: getClientMutationHeaders(),
              body: { materialId: entry.id },
              affected: {
                rootShelfId: detail.data.rootShelfId,
                parentSubShelfId: detail.data.parentSubShelfId,
              },
            });
            break;
          }
          case "blockPack": {
            const detail = await blockPack.fetch({
              header: getClientMutationHeaders(),
              param: { blockPackId: entry.id, isDeleted: true },
            });
            if (!detail.success)
              throw detail.exception
                ? new NotegicAPIError(new NotegicException(detail.exception))
                : new Error("workspace.trash.actionFailed");
            response = await restoreBlockPack.mutateAsync({
              header: getClientMutationHeaders(),
              body: { blockPackId: entry.id },
              affected: {
                rootShelfId: detail.data.rootShelfId,
                parentSubShelfId: detail.data.parentSubShelfId,
              },
            });
            break;
          }
          case "station":
            response = await restoreStation.mutateAsync({
              header: getClientMutationHeaders(),
              body: { stationId: entry.id },
            });
            break;
          case "routine":
            response = await restoreRoutine.mutateAsync({
              header: getClientMutationHeaders(),
              body: { routineId: entry.id },
            });
            break;
        }
      }
      if (!response.success)
        throw response.exception
          ? new NotegicAPIError(new NotegicException(response.exception))
          : new Error("workspace.trash.actionFailed");
      setCompletedEntries(previous =>
        new Map(previous).set(key, new Date(entry.deletedAt ?? 0).getTime())
      );
      toast.success(
        action === "restore"
          ? t("workspace.trash.restored")
          : t("workspace.trash.hardDeleted")
      );
      // A refresh failure must not turn a completed deletion into a retryable action.
      try {
        await onChanged();
      } catch {
        toast.error(t("workspace.trash.refreshFailed"));
      }
      return true;
    } finally {
      busy.current = false;
      setPendingEntry(null);
    }
  };

  return { perform, pendingEntry, completedEntries };
};
