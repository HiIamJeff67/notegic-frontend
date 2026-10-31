import { tError } from "@shared/i18n/error";
import { useTranslation } from "@shared/i18n/useTranslation";
import toast from "@shared/lib/toast/toast";
import React, { useRef, useState } from "react";
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
import { ModalProps } from "@/providers/ModalProvider";

interface DeleteShelfItemDialogProps extends ModalProps {
  dialogHeader: React.ReactNode;
  dialogDescription: React.ReactNode;
  confirmKeyword?: string;
  inputPlaceholder?: string;
  confirmLabel?: string;
  onDelete: () => void | boolean | Promise<void | boolean>;
  onCancel: () => void;
}

const DeleteShelfItemDialog = ({
  isOpen,
  onClose,
  dialogHeader,
  dialogDescription,
  confirmKeyword,
  inputPlaceholder,
  confirmLabel,
  onDelete,
  onCancel,
}: DeleteShelfItemDialogProps) => {
  const { t } = useTranslation();
  const [value, setValue] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const deleting = useRef(false);

  const deleteShelfItem = async () => {
    if (
      deleting.current ||
      (confirmKeyword !== undefined && value !== confirmKeyword)
    )
      return;

    try {
      deleting.current = true;
      setIsDeleting(true);
      if ((await onDelete()) === false) return;
      setValue("");
      onClose();
    } catch (error) {
      toast.error(tError(error, t));
    } finally {
      deleting.current = false;
      setIsDeleting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (!open && !deleting.current) onClose();
      }}
    >
      <DialogContent showCloseButton={!isDeleting}>
        <DialogHeader>
          <DialogTitle>{dialogHeader}</DialogTitle>
        </DialogHeader>
        <DialogDescription>{dialogDescription}</DialogDescription>
        {confirmKeyword !== undefined && (
          <Input
            placeholder={inputPlaceholder}
            value={value}
            autoComplete="off"
            aria-label={inputPlaceholder ?? confirmKeyword}
            disabled={isDeleting}
            onChange={e => setValue(e.target.value)}
            className={`w-full ${value === confirmKeyword ? "" : "border-2 border-destructive/50"}`}
          />
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isDeleting}
            onClick={() => {
              onCancel();
              onClose();
            }}
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={
              isDeleting ||
              (confirmKeyword !== undefined && value !== confirmKeyword)
            }
            onClick={deleteShelfItem}
          >
            {isDeleting && <Spinner />}
            {confirmLabel ?? t("common.delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteShelfItemDialog;
