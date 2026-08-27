import type { SupportedIcon } from "@shared/api/interfaces/enums";
import toast from "@shared/lib/toast";
import type { UUID } from "crypto";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ColorSelector from "@/components/commons/ColorSelector/ColorSelector";
import SupportedIconTable from "@/components/commons/SupportedIconTable/SupportedIconTable";
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
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useStationRoutine } from "@/hooks";
import { translateError } from "@shared/i18n/error";
import type { ModalProps } from "@/providers/ModalProvider";
import CreateRoutineTagDialogSkeleton from "./CreateRoutineTagDialogSkeleton";

interface CreateRoutineTagDialogProps extends ModalProps {
  onCreated?: (routineTagId: UUID) => void | Promise<void>;
}

const CreateRoutineTagDialog = ({
  isOpen,
  onClose,
  onCreated,
}: CreateRoutineTagDialogProps) => {
  const { t } = useTranslation();
  const stationRoutineManager = useStationRoutine();

  const [name, setName] = useState<string>("");
  const [color, setColor] = useState<string>("#6b7280");
  const [icon, setIcon] = useState<SupportedIcon | null>(null);
  const [isOpening, setIsOpening] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) return;
    setName("");
    setColor("#6b7280");
    setIcon(null);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setIsOpening(true);
    const frame = window.requestAnimationFrame(() => setIsOpening(false));
    return () => window.cancelAnimationFrame(frame);
  }, [isOpen]);

  const createRoutineTag = async () => {
    const trimmedName = name.trim();
    if (trimmedName.length === 0) return;

    try {
      const routineTagNode = await stationRoutineManager.createRoutineTag(
        trimmedName,
        color,
        icon
      );
      await onCreated?.(routineTagNode.id);
      toast.success(t("workspace.routineTag.created"));
      onClose();
    } catch (error) {
      toast.error(translateError(error, t));
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (!open && !stationRoutineManager.isCreatingRoutineTag) onClose();
      }}
    >
      <DialogContent className="rounded-sm sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("workspace.routineTag.createTitle")}</DialogTitle>
          <DialogDescription>
            {t("workspace.routineTag.createDescription")}
          </DialogDescription>
        </DialogHeader>

        <form
          autoComplete="off"
          className="flex flex-col gap-4"
          onSubmit={async event => {
            event.preventDefault();
            await createRoutineTag();
          }}
        >
          {isOpening ? (
            <CreateRoutineTagDialogSkeleton />
          ) : (
            <>
              <div className="flex flex-col gap-2">
                <Label htmlFor="routine-tag-name">
                  {t("workspace.routineTag.name")}
                </Label>
                <Input
                  id="routine-tag-name"
                  value={name}
                  autoComplete="off"
                  maxLength={128}
                  autoFocus
                  onChange={event => setName(event.currentTarget.value)}
                  placeholder={t("workspace.routineTag.namePlaceholder")}
                />
              </div>

              <div className="flex items-end gap-3">
                <div className="flex shrink-0 flex-col gap-2">
                  <Label>{t("workspace.routineTag.icon")}</Label>
                  <SupportedIconTable
                    value={icon}
                    onValueChange={setIcon}
                    disabled={stationRoutineManager.isCreatingRoutineTag}
                  />
                </div>

                <div className="flex shrink-0 flex-col gap-2">
                  <Label>{t("workspace.routineTag.color")}</Label>
                  <ColorSelector
                    value={color}
                    onValueChange={setColor}
                    disabled={stationRoutineManager.isCreatingRoutineTag}
                  />
                </div>
              </div>
            </>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="destructive"
              disabled={stationRoutineManager.isCreatingRoutineTag}
              onClick={onClose}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={
                stationRoutineManager.isCreatingRoutineTag ||
                name.trim().length === 0
              }
            >
              {stationRoutineManager.isCreatingRoutineTag && <Spinner />}
              {t("common.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRoutineTagDialog;
