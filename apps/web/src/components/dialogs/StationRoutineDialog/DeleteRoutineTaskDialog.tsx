import { tError } from "@shared/i18n/error";
import { useTranslation } from "@shared/i18n/useTranslation";
import toast from "@shared/lib/toast";
import type { UUID } from "crypto";
import { getClientRequestHeaders } from "@/api/clientHeaders";
import { useHardDeleteMyRoutineTaskById } from "@/api/hooks/routineTask.hook";
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
import type { ModalProps } from "@/providers/ModalProvider";

interface DeleteRoutineTaskDialogProps extends ModalProps {
  routineTaskId: UUID;
  expectedDefinitionVersion?: number;
  routineTaskTitle: string;
  onDeleted?: () => void | Promise<void>;
}

const DeleteRoutineTaskDialog = ({
  isOpen,
  onClose,
  routineTaskId,
  routineTaskTitle,
  expectedDefinitionVersion,
  onDeleted,
}: DeleteRoutineTaskDialogProps) => {
  const { t } = useTranslation();
  const deleteRoutineTaskMutator = useHardDeleteMyRoutineTaskById();

  const deleteRoutineTask = async () => {
    try {
      const response = await deleteRoutineTaskMutator.mutateAsync({
        header: getClientRequestHeaders(navigator.userAgent),
        body: {
          routineTaskId,
          expectedDefinitionVersion,
        },
      });
      if (response.success === false) {
        toast.error(tError(response.exception, t));
        await onDeleted?.();
        onClose();
        return;
      }

      await onDeleted?.();
      toast.success(t("workspace.routineTask.deleted"));
      onClose();
    } catch (error) {
      toast.error(tError(error, t));
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (!open && !deleteRoutineTaskMutator.isPending) onClose();
      }}
    >
      <DialogContent className="rounded-sm sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("workspace.routineTask.deleteTitle")}</DialogTitle>
          <DialogDescription>
            {t("workspace.routineTask.deleteDescription", {
              title: routineTaskTitle,
            })}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={deleteRoutineTaskMutator.isPending}
            onClick={onClose}
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={deleteRoutineTaskMutator.isPending}
            onClick={deleteRoutineTask}
          >
            {deleteRoutineTaskMutator.isPending && <Spinner />}
            {t("common.delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteRoutineTaskDialog;
