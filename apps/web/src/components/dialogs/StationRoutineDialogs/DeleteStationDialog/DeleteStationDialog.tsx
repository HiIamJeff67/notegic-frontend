import { tError } from "@shared/i18n/error";
import toast from "@shared/lib/toast/toast";
import type { UUID } from "crypto";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useStationRoutine } from "@/hooks";
import { useTranslation } from "@/hooks/useTranslation";
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

  const deleteStation = async () => {
    try {
      await stationRoutineManager.deleteStation(stationId);
      await onDeleted?.();
      toast.success(
        t("workspace.notifications.deleted", { name: stationName })
      );
      onClose();
    } catch (error) {
      toast.error(tError(error, t));
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (!open && !stationRoutineManager.isDeletingStation) onClose();
      }}
    >
      <DialogContent className="w-4/5">
        <DialogHeader className="w-full">
          <DialogTitle>{t("workspace.station.deleteTitle")}</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          {t("workspace.station.deleteDescription")}
        </DialogDescription>
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
            disabled={stationRoutineManager.isDeletingStation}
            onClick={deleteStation}
          >
            {stationRoutineManager.isDeletingStation && <Spinner />}
            {t("common.delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteStationDialog;
