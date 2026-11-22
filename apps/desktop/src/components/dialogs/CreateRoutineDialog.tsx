import { useCreateRoutineByStationId } from "@shared/api/hooks/routine.hook";
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
import { Switch } from "@shared/components/shadcn/switch";
import { Textarea } from "@shared/components/shadcn/textarea";
import toast from "@shared/components/toast/toast";
import { useTranslation } from "@shared/hooks/useTranslation";
import { tError } from "@shared/i18n/error";
import type { UUID } from "crypto";
import { useEffect, useState } from "react";
import { CreateRoutineByStationId } from "../../api/functions/routine.function";
import type { ModalProps } from "../../providers/ModalProvider";

type CreateRoutineDialogProps = ModalProps & {
  stationId: UUID;
  stationName?: string;
  onCreated?: (routineId: string) => void;
};

const CreateRoutineDialog = ({
  isOpen,
  onClose,
  stationId,
  stationName,
  onCreated,
}: CreateRoutineDialogProps) => {
  const { t } = useTranslation();
  const createRoutine = useCreateRoutineByStationId(CreateRoutineByStationId);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeoutMinutes, setTimeoutMinutes] = useState(5);
  const [isPinned, setIsPinned] = useState(false);
  const [hasCustomSchedule, setHasCustomSchedule] = useState(false);
  const [scheduledStartAt, setScheduledStartAt] = useState("");
  const [scheduledEndAt, setScheduledEndAt] = useState("");

  useEffect(() => {
    if (isOpen) return;
    setTitle("");
    setDescription("");
    setTimeoutMinutes(5);
    setIsPinned(false);
    setHasCustomSchedule(false);
    setScheduledStartAt("");
    setScheduledEndAt("");
  }, [isOpen]);

  const submit = async () => {
    const trimmedTitle = title.trim();
    if (trimmedTitle.length === 0) return;
    try {
      const response = await createRoutine.mutateAsync({
        body: {
          stationId,
          title: trimmedTitle,
          description: description.trim(),
          timeoutSeconds: timeoutMinutes * 60,
          hasCustomSchedule,
          isPinned,
          ...(hasCustomSchedule
            ? {
                scheduledStartAt: new Date(scheduledStartAt),
                scheduledEndAt: new Date(scheduledEndAt),
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              }
            : {}),
        },
      });
      toast.success(
        t("workspace.notifications.created", { name: trimmedTitle })
      );
      onCreated?.(response.data.id);
      onClose();
    } catch (error) {
      toast.error(tError(error, t));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto rounded-sm sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("workspace.routine.createTitle")}</DialogTitle>
          <DialogDescription>
            {stationName
              ? t("workspace.routine.createDescriptionForStation", {
                  station: stationName,
                })
              : t("workspace.routine.createDescription")}
          </DialogDescription>
        </DialogHeader>
        <form
          noValidate
          autoComplete="off"
          className="flex flex-col gap-4"
          onSubmit={event => {
            event.preventDefault();
            void submit();
          }}
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="routine-title">{t("workspace.fields.name")}</Label>
            <Input
              id="routine-title"
              value={title}
              autoFocus
              maxLength={128}
              onChange={event => setTitle(event.currentTarget.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="routine-description">
              {t("workspace.station.description")}
            </Label>
            <Textarea
              id="routine-description"
              value={description}
              maxLength={1024}
              className="min-h-24 resize-none"
              onChange={event => setDescription(event.currentTarget.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="routine-timeout">
              {t("workspace.fields.executionTimeoutMinutes")}
            </Label>
            <Input
              id="routine-timeout"
              type="number"
              min={1}
              value={timeoutMinutes}
              onChange={event =>
                setTimeoutMinutes(Number(event.currentTarget.value))
              }
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="routine-pinned">{t("workspace.routine.pin")}</Label>
            <Switch
              id="routine-pinned"
              checked={isPinned}
              onCheckedChange={setIsPinned}
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="routine-schedule">
              {t("workspace.fields.customSchedule")}
            </Label>
            <Switch
              id="routine-schedule"
              checked={hasCustomSchedule}
              onCheckedChange={setHasCustomSchedule}
            />
          </div>
          {hasCustomSchedule ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                type="datetime-local"
                aria-label={t("workspace.fields.selectStartDateTime")}
                value={scheduledStartAt}
                onChange={event =>
                  setScheduledStartAt(event.currentTarget.value)
                }
              />
              <Input
                type="datetime-local"
                aria-label={t("workspace.fields.selectEndDateTime")}
                value={scheduledEndAt}
                onChange={event => setScheduledEndAt(event.currentTarget.value)}
              />
            </div>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="destructive"
              disabled={createRoutine.isPending}
              onClick={onClose}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={
                createRoutine.isPending ||
                title.trim().length === 0 ||
                (hasCustomSchedule && (!scheduledStartAt || !scheduledEndAt))
              }
            >
              {createRoutine.isPending && <Spinner />}
              {t("common.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRoutineDialog;
