import React, { useState } from "react";
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
import { ModalProps } from "@/providers/ModalProvider";

interface CreateShelfItemDialogProps extends ModalProps {
  dialogHeader: React.ReactNode;
  dialogDescription: React.ReactNode;
  disableInput?: boolean;
  inputPlaceholder?: string;
  submitLabel?: string;
  onCreate: (value: string) => void | Promise<void>;
  onCancel: () => void;
}

const CreateShelfItemDialog = ({
  isOpen,
  onClose,
  dialogHeader,
  dialogDescription,
  disableInput = false,
  inputPlaceholder,
  submitLabel,
  onCreate,
  onCancel,
}: CreateShelfItemDialogProps) => {
  const { t } = useTranslation();
  const [value, setValue] = useState<string>("");
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const createShelfItem = async () => {
    try {
      setIsCreating(true);
      await onCreate(value);
      setValue("");
      onClose();
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-4/5">
        <DialogHeader className="w-full">
          <DialogTitle>{dialogHeader}</DialogTitle>
        </DialogHeader>
        <DialogDescription>{dialogDescription}</DialogDescription>
        {!disableInput && (
          <Input
            placeholder={inputPlaceholder}
            value={value}
            autoComplete="off"
            onChange={e => setValue(e.target.value)}
            className="w-full"
          />
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="destructive"
            disabled={isCreating}
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
            disabled={isCreating}
            onClick={createShelfItem}
          >
            {isCreating && <Spinner />}
            {submitLabel ?? t("common.create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateShelfItemDialog;
