import toast from "@shared/lib/toast";
import type { UUID } from "crypto";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useStationRoutine } from "@/hooks";
import { translateError } from "@shared/i18n/error";
import type { ModalProps } from "@/providers/ModalProvider";

interface DeleteStationDialogProps extends ModalProps {
  stationId: UUID;
  stationName: string;
  onDeleted?: () => void | Promise<void>;
}

const DeleteStationDialog = ({
  isOpen,
  onClose,
  stationId,
  stationName,
  onDeleted,
}: DeleteStationDialogProps) => {
  const { t } = useTranslation();
  const stationRoutineManager = useStationRoutine();
  const [confirmation, setConfirmation] = useState<string>("");

  useEffect(() => {
    if (!isOpen) setConfirmation("");
  }, [isOpen]);

  const deleteStation = async () => {
    if (confirmation !== stationName) return;

    try {
      await stationRoutineManager.deleteStation(stationId);
      await onDeleted?.();
      toast.success(t("workspace.station.deleted"));
      onClose();
    } catch (error) {
      toast.error(translateError(error, t));
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (!open && !stationRoutineManager.isDeletingStation) onClose();
      }}
    >
      <DialogContent className="rounded-sm sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("workspace.station.deleteTitle")}</DialogTitle>
          <DialogDescription>
            {t("workspace.station.deleteDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Input
              id="delete-station-confirmation"
              value={confirmation}
              autoComplete="off"
              autoFocus
              onChange={event => setConfirmation(event.currentTarget.value)}
              aria-invalid={
                confirmation.length > 0 && confirmation !== stationName
              }
              placeholder={t("workspace.station.deletePlaceholder", {
                name: stationName,
              })}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={stationRoutineManager.isDeletingStation}
              onClick={onClose}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={
                stationRoutineManager.isDeletingStation ||
                confirmation !== stationName
              }
              onClick={deleteStation}
            >
              {stationRoutineManager.isDeletingStation && <Spinner />}
              {t("common.delete")}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteStationDialog;
