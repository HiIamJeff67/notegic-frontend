import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  onDelete: () => void | Promise<void>;
  onCancel: () => void;
}

const DeleteShelfItemDialog = ({
  isOpen,
  onClose,
  dialogHeader,
  dialogDescription,
  confirmKeyword,
  inputPlaceholder,
  onDelete,
  onCancel,
}: DeleteShelfItemDialogProps) => {
  const { t } = useTranslation();
  const [value, setValue] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const deleteShelfItem = async () => {
    if (confirmKeyword !== undefined && value !== confirmKeyword) return;

    try {
      setIsDeleting(true);
      await onDelete();
      setValue("");
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dialogHeader}</DialogTitle>
        </DialogHeader>
        <DialogDescription>{dialogDescription}</DialogDescription>
        {confirmKeyword !== undefined && (
          <Input
            placeholder={inputPlaceholder}
            value={value}
            autoComplete="off"
            onChange={e => setValue(e.target.value)}
            className={`w-full ${value === confirmKeyword ? "" : "border-2 border-destructive/50"}`}
          />
        )}

        <div className="w-full flex flex-row justify-center gap-4">
          <Button
            type="button"
            disabled={isDeleting}
            onClick={deleteShelfItem}
            className="w-3/10"
          >
            {isDeleting && <Spinner />}
            {t("common.delete")}
          </Button>
          <Button
            disabled={isDeleting}
            className="w-3/10 bg-destructive hover:bg-destructive/90"
            onClick={() => {
              onCancel();
              onClose();
            }}
          >
            {t("common.cancel")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteShelfItemDialog;
