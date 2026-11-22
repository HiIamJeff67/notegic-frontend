import { Button } from "@shared/components/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@shared/components/shadcn/dialog";
import { Input } from "@shared/components/shadcn/input";
import { Spinner } from "@shared/components/shadcn/spinner";
import { useTranslation } from "@shared/hooks/useTranslation";
import { type ReactNode, useState } from "react";

export type CreateShelfItemDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  dialogHeader: ReactNode;
  dialogDescription: ReactNode;
  disableInput?: boolean;
  inputPlaceholder?: string;
  submitLabel?: string;
  onCreate: (value: string) => void | Promise<void>;
  onCancel: () => void;
};

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
  const [value, setValue] = useState("");
  const [isCreating, setIsCreating] = useState(false);

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
            onChange={event => setValue(event.target.value)}
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
            onClick={() => void createShelfItem()}
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
