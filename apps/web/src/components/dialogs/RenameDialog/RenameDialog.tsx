import React, { useState } from "react";
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
import { useTranslation } from "@/hooks/useTranslation";
import { ModalProps } from "@/providers/ModalProvider";

interface RenameDialogProps extends ModalProps {
  dialogHeader: React.ReactNode;
  dialogDescription: React.ReactNode;
  currentName: string;
  inputPlaceholder?: string;
  submitLabel?: string;
  onRename: (name: string) => void | Promise<void>;
  onCancel: () => void;
}

const RenameDialog = ({
  isOpen,
  onClose,
  dialogHeader,
  dialogDescription,
  currentName,
  inputPlaceholder,
  submitLabel,
  onRename,
  onCancel,
}: RenameDialogProps) => {
  const { t } = useTranslation();
  const [value, setValue] = useState<string>(currentName);
  const [isRenaming, setIsRenaming] = useState<boolean>(false);

  const rename = async () => {
    try {
      setIsRenaming(true);
      await onRename(value);
      setValue("");
      onClose();
    } finally {
      setIsRenaming(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-4/5">
        <DialogHeader className="w-full">
          <DialogTitle>{dialogHeader}</DialogTitle>
        </DialogHeader>
        <DialogDescription>{dialogDescription}</DialogDescription>
        <Input
          placeholder={inputPlaceholder}
          value={value}
          autoComplete="off"
          onChange={e => setValue(e.target.value)}
          className="w-full"
        />

        <DialogFooter>
          <Button
            type="button"
            variant="destructive"
            disabled={isRenaming}
            onClick={() => {
              onCancel();
              onClose();
            }}
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="button"
            variant="default"
            disabled={isRenaming}
            onClick={rename}
          >
            {isRenaming && <Spinner />}
            {submitLabel ?? t("workspace.menu.rename")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RenameDialog;
