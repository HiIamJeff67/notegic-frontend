import toast from "@shared/lib/toast";
import type { UUID } from "crypto";
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
import { Spinner } from "@/components/ui/spinner";
import { useStationRoutine } from "@/hooks";
import { translateError } from "@shared/i18n/error";
import type { ModalProps } from "@/providers/ModalProvider";

interface DeleteRoutineDialogProps extends ModalProps {
  routineId: UUID;
  routineTitle: string;
  onDeleted?: () => void | Promise<void>;
}

const DeleteRoutineDialog = ({
  isOpen,
  onClose,
  routineId,
  routineTitle,
  onDeleted,
}: DeleteRoutineDialogProps) => {
  const { t } = useTranslation();
  const stationRoutineManager = useStationRoutine();

  const deleteRoutine = async () => {
    try {
      await stationRoutineManager.deleteRoutine(routineId);
      await onDeleted?.();
      toast.success(t("workspace.routine.deleted"));
      onClose();
    } catch (error) {
      toast.error(translateError(error, t));
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (!open && !stationRoutineManager.isDeletingRoutine) onClose();
      }}
    >
      <DialogContent className="rounded-sm sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("workspace.routine.deleteTitle")}</DialogTitle>
          <DialogDescription>
            {t("workspace.routine.deleteDescription", { title: routineTitle })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={stationRoutineManager.isDeletingRoutine}
            onClick={onClose}
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={stationRoutineManager.isDeletingRoutine}
            onClick={deleteRoutine}
          >
            {stationRoutineManager.isDeletingRoutine && <Spinner />}
            {t("common.delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteRoutineDialog;
