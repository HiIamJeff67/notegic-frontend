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

interface DeleteRoutineTagDialogProps extends ModalProps {
  routineTagId: UUID;
  routineTagName: string;
  onDeleted?: () => void | Promise<void>;
}

const DeleteRoutineTagDialog = ({
  isOpen,
  onClose,
  routineTagId,
  routineTagName,
  onDeleted,
}: DeleteRoutineTagDialogProps) => {
  const { t } = useTranslation();
  const stationRoutineManager = useStationRoutine();

  const deleteRoutineTag = async () => {
    try {
      await stationRoutineManager.hardDeleteRoutineTag(routineTagId);
      await onDeleted?.();
      toast.success(t("workspace.routineTag.deleted"));
      onClose();
    } catch (error) {
      toast.error(translateError(error, t));
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (!open && !stationRoutineManager.isHardDeletingRoutineTag) onClose();
      }}
    >
      <DialogContent className="rounded-sm sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("workspace.routineTag.deleteTitle")}</DialogTitle>
          <DialogDescription>
            {t("workspace.routineTag.deleteDescription", {
              name: routineTagName,
            })}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={stationRoutineManager.isHardDeletingRoutineTag}
            onClick={onClose}
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={stationRoutineManager.isHardDeletingRoutineTag}
            onClick={deleteRoutineTag}
          >
            {stationRoutineManager.isHardDeletingRoutineTag && <Spinner />}
            {t("common.delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteRoutineTagDialog;
