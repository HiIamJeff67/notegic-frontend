import { useCreateRoutineTag } from "@shared/api/hooks/routineTag.hook";
import type { SupportedIcon } from "@shared/api/interfaces/enums";
import SupportedIconTable from "@shared/components/commons/SupportedIconTable/SupportedIconTable";
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
import { Label } from "@shared/components/shadcn/label";
import { Spinner } from "@shared/components/shadcn/spinner";
import toast from "@shared/components/toast/toast";
import { useTranslation } from "@shared/hooks/useTranslation";
import { tError } from "@shared/i18n/error";
import { useEffect, useState } from "react";
import { CreateRoutineTag } from "../../api/functions/routineTag.function";
import type { ModalProps } from "../../providers/ModalProvider";

const CreateRoutineTagDialog = ({ isOpen, onClose }: ModalProps) => {
  const { t } = useTranslation();
  const createTag = useCreateRoutineTag(CreateRoutineTag);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#6b7280");
  const [icon, setIcon] = useState<SupportedIcon | null>(null);

  useEffect(() => {
    if (isOpen) return;
    setName("");
    setColor("#6b7280");
    setIcon(null);
  }, [isOpen]);

  const submit = async () => {
    const trimmedName = name.trim();
    if (trimmedName.length === 0) return;
    try {
      await createTag.mutateAsync({
        body: { name: trimmedName, color, icon },
      });
      toast.success(
        t("workspace.notifications.created", { name: trimmedName })
      );
      onClose();
    } catch (error) {
      toast.error(tError(error, t));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="rounded-sm sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("workspace.routineTag.createTitle")}</DialogTitle>
          <DialogDescription>
            {t("workspace.routineTag.createDescription")}
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={event => {
            event.preventDefault();
            void submit();
          }}
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="routine-tag-name">
              {t("workspace.routineTag.name")}
            </Label>
            <Input
              id="routine-tag-name"
              value={name}
              autoFocus
              maxLength={128}
              onChange={event => setName(event.currentTarget.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="routine-tag-color">
              {t("workspace.routineTag.color")}
            </Label>
            <Input
              id="routine-tag-color"
              type="color"
              value={color}
              onChange={event => setColor(event.currentTarget.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>{t("workspace.routineTag.icon")}</Label>
            <SupportedIconTable
              value={icon}
              onValueChange={setIcon}
              disabled={createTag.isPending}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="destructive"
              disabled={createTag.isPending}
              onClick={onClose}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={createTag.isPending || name.trim().length === 0}
            >
              {createTag.isPending && <Spinner />}
              {t("common.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRoutineTagDialog;
