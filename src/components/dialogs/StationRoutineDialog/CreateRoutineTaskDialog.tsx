import {
  AllRoutinePeriods,
  RoutinePeriod,
  RoutineTaskPurpose,
  UserPlan,
} from "@shared/api/interfaces/enums";
import { CreateRoutineTaskByRoutineIdRequestSchema } from "@shared/api/interfaces/routineTask.interface";
import { PlanLimitations } from "@shared/constants";
import toast from "@shared/lib/toast";
import type { UUID } from "crypto";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import DatePicker from "@/components/commons/DatePicker/DatePicker";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useStationRoutine, useUser } from "@/hooks";
import { translateError } from "@/i18n/error";
import {
  translateRoutinePeriod,
  translateRoutineTaskPurpose,
} from "@/i18n/workspace";
import type { ModalProps } from "@/providers/ModalProvider";
import CreateRoutineTaskDialogSkeleton from "./CreateRoutineTaskDialogSkeleton";

const RoutineTaskPayloadEditor = lazy(
  () =>
    import(
      "@/components/core/RoutineOverviewer/RoutineTaskPayloadEditors/RoutineTaskPayloadEditor"
    )
);

interface CreateRoutineTaskDialogProps extends ModalProps {
  routineId: UUID;
  stationName?: string;
  routineTitle?: string;
  onCreated?: (routineTaskId: UUID) => void | Promise<void>;
}

const CreateRoutineTaskDialog = ({
  isOpen,
  onClose,
  routineId,
  stationName,
  routineTitle,
  onCreated,
}: CreateRoutineTaskDialogProps) => {
  const { i18n, t } = useTranslation();
  const stationRoutineManager = useStationRoutine();
  const userManager = useUser();
  const payloadPreviewRef = useRef<HTMLPreElement>(null);

  const [title, setTitle] = useState<string>("");
  const [purpose, setPurpose] = useState<RoutineTaskPurpose>(
    RoutineTaskPurpose.CreateBlockPack
  );
  const [payload, setPayload] = useState<string>("{}");
  const [priority, setPriority] = useState<string>("0");
  const [maxAttempts, setMaxAttempts] = useState<string>("1");
  const [nextScheduledAt, setNextScheduledAt] = useState<Date | undefined>();
  const [period, setPeriod] = useState<RoutinePeriod | null>(null);
  const [payloadError, setPayloadError] = useState<string>("");
  const [isPayloadEditorOpen, setIsPayloadEditorOpen] =
    useState<boolean>(false);
  const [isPayloadExpanded, setIsPayloadExpanded] = useState<boolean>(false);
  const [isPayloadOverflowing, setIsPayloadOverflowing] =
    useState<boolean>(false);
  const [payloadTextareaHeight, setPayloadTextareaHeight] =
    useState<number>(160);
  const [isOpening, setIsOpening] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) return;
    setTitle("");
    setPurpose(RoutineTaskPurpose.CreateBlockPack);
    setPayload("{}");
    setPriority("0");
    setMaxAttempts("1");
    setNextScheduledAt(undefined);
    setPeriod(null);
    setPayloadError("");
    setIsPayloadEditorOpen(false);
    setIsPayloadExpanded(false);
    setIsPayloadOverflowing(false);
    setPayloadTextareaHeight(160);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setIsOpening(true);
    const frame = window.requestAnimationFrame(() => setIsOpening(false));
    return () => window.cancelAnimationFrame(frame);
  }, [isOpen]);

  useEffect(() => {
    const payloadPreview = payloadPreviewRef.current;
    if (!payloadPreview) return;

    const isOverflowing = payloadPreview.scrollHeight > 164;
    setIsPayloadOverflowing(isOverflowing);

    if (!isOverflowing && isPayloadExpanded) {
      setIsPayloadExpanded(false);
      setPayloadTextareaHeight(160);
      return;
    }

    setPayloadTextareaHeight(
      isPayloadExpanded ? Math.max(160, payloadPreview.scrollHeight) : 160
    );
  }, [isOpen, isPayloadExpanded, payload]);

  const estimatedPayloadCostUnit = useMemo(() => {
    try {
      const parsedPayload =
        payload.trim().length === 0 ? {} : JSON.parse(payload);
      return Math.ceil(
        new Blob([JSON.stringify(parsedPayload ?? {})]).size / 1024
      );
    } catch {
      return null;
    }
  }, [payload]);

  const routineTaskMonthlyCostUnitUsed = Number(
    userManager.userAccount?.routineTaskCostUnitCount ?? 0
  );
  const maxRoutineTaskCostUnitCount =
    PlanLimitations[userManager.userData?.plan ?? UserPlan.Free]
      .maxRoutineTaskCostUnitCount;

  const validation = useMemo(() => {
    try {
      return CreateRoutineTaskByRoutineIdRequestSchema.safeParse({
        body: {
          routineId,
          title: title.trim(),
          purpose,
          payload: JSON.parse(payload),
          priority: Number(priority),
          maxAttempts: Number(maxAttempts),
          period,
          nextScheduledAt,
        },
      });
    } catch {
      return null;
    }
  }, [
    maxAttempts,
    nextScheduledAt,
    payload,
    period,
    priority,
    purpose,
    routineId,
    title,
  ]);

  const createRoutineTask = async () => {
    if (validation === null) {
      setPayloadError(t("workspace.validation.invalidJson"));
      return;
    }
    if (!validation.success) {
      setPayloadError(
        validation.error.issues[0]?.message ??
          t("workspace.validation.invalidPayload")
      );
      return;
    }
    setPayloadError("");

    try {
      const routineTaskNode = await stationRoutineManager.createRoutineTask(
        validation.data.body.routineId as UUID,
        validation.data.body.title,
        validation.data.body.purpose,
        validation.data.body.nextScheduledAt,
        validation.data.body.period ?? null,
        validation.data.body.payload,
        validation.data.body.priority ?? 0,
        validation.data.body.maxAttempts ?? 1
      );
      await onCreated?.(routineTaskNode.id);
      toast.success(t("workspace.routineTask.created"));
      onClose();
    } catch (error) {
      toast.error(translateError(error, t));
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (!open && !stationRoutineManager.isCreatingRoutineTask) onClose();
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-visible rounded-sm sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("workspace.routineTask.createTitle")}</DialogTitle>
          <DialogDescription>
            {routineTitle || stationName
              ? t("workspace.routineTask.createDescriptionFor", {
                  name: routineTitle ?? stationName ?? "",
                })
              : t("workspace.routineTask.createDescription")}
          </DialogDescription>
        </DialogHeader>

        <form
          autoComplete="off"
          className="flex max-h-[calc(90vh-112px)] flex-col gap-4 overflow-y-auto px-1 pb-4"
          onSubmit={async event => {
            event.preventDefault();
            await createRoutineTask();
          }}
        >
          {isOpening ? (
            <CreateRoutineTaskDialogSkeleton />
          ) : (
            <>
              <div className="flex flex-col gap-2">
                <Label htmlFor="routine-task-title">
                  {t("workspace.fields.title")}
                </Label>
                <Input
                  id="routine-task-title"
                  value={title}
                  autoComplete="off"
                  maxLength={128}
                  autoFocus
                  onChange={event => setTitle(event.currentTarget.value)}
                  placeholder={t("workspace.routineTask.titlePlaceholder")}
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex min-w-0 flex-[1.35] flex-col gap-2">
                  <Label>{t("workspace.fields.purpose")}</Label>
                  <Select
                    value={purpose}
                    onValueChange={value =>
                      setPurpose(value as RoutineTaskPurpose)
                    }
                  >
                    <SelectTrigger className="w-full rounded-sm">
                      <SelectValue>
                        {translateRoutineTaskPurpose(purpose, t)}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="z-[160]">
                      <SelectGroup>
                        <SelectLabel>
                          {t("workspace.fields.create")}
                        </SelectLabel>
                        <SelectItem value={RoutineTaskPurpose.CreateRootShelf}>
                          {t("workspace.trash.rootShelf")}
                        </SelectItem>
                        <SelectItem value={RoutineTaskPurpose.CreateSubShelf}>
                          {t("workspace.trash.subShelf")}
                        </SelectItem>
                        <SelectItem value={RoutineTaskPurpose.CreateBlockPack}>
                          {t("workspace.trash.blockPack")}
                        </SelectItem>
                        <SelectItem value={RoutineTaskPurpose.CreateRoutine}>
                          {t("workspace.trash.routine")}
                        </SelectItem>
                      </SelectGroup>
                      <SelectSeparator />
                      <SelectGroup>
                        <SelectLabel>
                          {t("workspace.fields.append")}
                        </SelectLabel>
                        <SelectItem value={RoutineTaskPurpose.AppendBlock}>
                          {t("workspace.fields.block")}
                        </SelectItem>
                      </SelectGroup>
                      <SelectSeparator />
                      <SelectGroup>
                        <SelectLabel>
                          {t("workspace.fields.update")}
                        </SelectLabel>
                        <SelectItem value={RoutineTaskPurpose.UpdateRootShelf}>
                          {t("workspace.trash.rootShelf")}
                        </SelectItem>
                        <SelectItem value={RoutineTaskPurpose.UpdateSubShelf}>
                          {t("workspace.trash.subShelf")}
                        </SelectItem>
                        <SelectItem value={RoutineTaskPurpose.UpdateBlockPack}>
                          {t("workspace.trash.blockPack")}
                        </SelectItem>
                        <SelectItem value={RoutineTaskPurpose.UpdateBlock}>
                          {t("workspace.fields.block")}
                        </SelectItem>
                        <SelectItem value={RoutineTaskPurpose.UpdateRoutine}>
                          {t("workspace.trash.routine")}
                        </SelectItem>
                      </SelectGroup>
                      <SelectSeparator />
                      <SelectGroup>
                        <SelectLabel>{t("workspace.fields.reset")}</SelectLabel>
                        <SelectItem value={RoutineTaskPurpose.ResetRootShelf}>
                          {t("workspace.trash.rootShelf")}
                        </SelectItem>
                        <SelectItem value={RoutineTaskPurpose.ResetSubShelf}>
                          {t("workspace.trash.subShelf")}
                        </SelectItem>
                        <SelectItem value={RoutineTaskPurpose.ResetBlockPack}>
                          {t("workspace.trash.blockPack")}
                        </SelectItem>
                        <SelectItem value={RoutineTaskPurpose.ResetBlock}>
                          {t("workspace.fields.block")}
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex min-w-36 flex-1 flex-col gap-2">
                  <Label>{t("workspace.fields.recurring")}</Label>
                  <Select
                    value={period ?? "OneShot"}
                    onValueChange={value =>
                      setPeriod(
                        value === "OneShot" ? null : (value as RoutinePeriod)
                      )
                    }
                  >
                    <SelectTrigger className="w-full rounded-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-[160]">
                      <SelectItem value="OneShot">
                        {t("workspace.fields.oneShot")}
                      </SelectItem>
                      {AllRoutinePeriods.map(routinePeriod => (
                        <SelectItem key={routinePeriod} value={routinePeriod}>
                          {translateRoutinePeriod(routinePeriod, t)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label>{t("workspace.fields.nextScheduledAt")}</Label>
                <DatePicker
                  value={nextScheduledAt}
                  onValueChange={value => {
                    if (!value) return;
                    value.setSeconds(0, 0);
                    setNextScheduledAt(value);
                  }}
                  placeholder={t("workspace.fields.selectNextExecutionTime")}
                  className="bg-card/45 hover:bg-card/60"
                  contentClassName="bg-card"
                />
                {nextScheduledAt && (
                  <span className="text-xs text-muted-foreground">
                    {t("workspace.inspector.nextExpectedRun", {
                      date: nextScheduledAt.toLocaleString(
                        i18n.resolvedLanguage
                      ),
                    })}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="routine-task-payload">
                  {t("workspace.fields.payload")}
                </Label>
                <div
                  id="routine-task-payload"
                  role="button"
                  tabIndex={0}
                  aria-invalid={payloadError.length > 0}
                  className={`group relative cursor-pointer overflow-hidden border bg-card/45 ${
                    isPayloadOverflowing ? "rounded-b-none" : "rounded-b-sm"
                  }`}
                  style={{ height: payloadTextareaHeight }}
                  onClick={async () => {
                    try {
                      const clipboardText =
                        await navigator.clipboard.readText();
                      setPayload(
                        JSON.stringify(JSON.parse(clipboardText), null, 2)
                      );
                      setPayloadError("");
                      toast.success(
                        t("workspace.payload.importedFromClipboard")
                      );
                    } catch {
                      const message = t(
                        "workspace.payload.clipboardMustContainValidJson"
                      );
                      setPayloadError(message);
                      toast.error(message);
                    }
                  }}
                  onPaste={event => {
                    event.preventDefault();
                    try {
                      setPayload(
                        JSON.stringify(
                          JSON.parse(event.clipboardData.getData("text")),
                          null,
                          2
                        )
                      );
                      setPayloadError("");
                      toast.success(
                        t("workspace.payload.importedFromClipboard")
                      );
                    } catch {
                      const message = t(
                        "workspace.payload.pastedMustBeValidJson"
                      );
                      setPayloadError(message);
                      toast.error(message);
                    }
                  }}
                  onDragOver={event => {
                    event.preventDefault();
                    event.dataTransfer.dropEffect = "copy";
                  }}
                  onDrop={event => {
                    event.preventDefault();
                    const droppedFile = event.dataTransfer.files[0];
                    if (droppedFile) {
                      void droppedFile
                        .text()
                        .then(droppedText => {
                          setPayload(
                            JSON.stringify(JSON.parse(droppedText), null, 2)
                          );
                          setPayloadError("");
                          toast.success(
                            t("workspace.payload.importedFromFile")
                          );
                        })
                        .catch(() => {
                          const message = t(
                            "workspace.payload.droppedFileMustContainValidJson"
                          );
                          setPayloadError(message);
                          toast.error(message);
                        });
                      return;
                    }

                    try {
                      setPayload(
                        JSON.stringify(
                          JSON.parse(event.dataTransfer.getData("text")),
                          null,
                          2
                        )
                      );
                      setPayloadError("");
                      toast.success(t("workspace.payload.imported"));
                    } catch {
                      const message = t(
                        "workspace.payload.droppedContentMustBeValidJson"
                      );
                      setPayloadError(message);
                      toast.error(message);
                    }
                  }}
                >
                  <pre
                    ref={payloadPreviewRef}
                    className={`h-full whitespace-pre-wrap break-words p-3 font-mono text-xs ${
                      isPayloadExpanded ? "overflow-hidden" : "overflow-y-auto"
                    }`}
                  >
                    {payload}
                  </pre>
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-card/35 px-6 text-center text-foreground text-xs opacity-0 backdrop-blur-[2px] transition-opacity group-hover:opacity-100 group-focus:opacity-100">
                    <span className="rounded-sm bg-card/70 px-3 py-1.5 shadow-sm">
                      {t("workspace.payload.importHint")}
                    </span>
                  </div>
                </div>
                {isPayloadOverflowing && (
                  <button
                    type="button"
                    className="flex h-8 items-center justify-center gap-1 rounded-b-sm border border-t-0 bg-card/45 text-xs text-muted-foreground transition-colors hover:bg-card/65 hover:text-foreground"
                    onClick={() =>
                      setIsPayloadExpanded(
                        previousIsPayloadExpanded => !previousIsPayloadExpanded
                      )
                    }
                  >
                    {isPayloadExpanded ? (
                      <ChevronUpIcon className="size-3.5" />
                    ) : (
                      <ChevronDownIcon className="size-3.5" />
                    )}
                    {isPayloadExpanded
                      ? t("workspace.payload.collapse")
                      : t("workspace.payload.expand")}
                  </button>
                )}
                <div className="flex items-start justify-between gap-3 rounded-sm border bg-card/45 px-3 py-2">
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="text-xs text-muted-foreground">
                      {t("workspace.payload.usage", {
                        used: userManager.userAccount
                          ? routineTaskMonthlyCostUnitUsed
                          : t("workspace.payload.notLoaded"),
                        limit: maxRoutineTaskCostUnitCount,
                      })}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {estimatedPayloadCostUnit === null
                        ? t("workspace.payload.estimateInvalid")
                        : t("workspace.payload.estimatedUsage", {
                            count: estimatedPayloadCostUnit,
                          })}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {t("workspace.payload.hardLimit")}
                    </span>
                    {payloadError.length > 0 && (
                      <span className="text-destructive text-xs">
                        {payloadError}
                      </span>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    onClick={() => setIsPayloadEditorOpen(true)}
                  >
                    {t("workspace.payload.edit")}
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex w-full flex-col gap-2 sm:w-40 sm:shrink-0">
                  <Label htmlFor="routine-task-priority">
                    {t("workspace.fields.priority")}
                  </Label>
                  <Input
                    id="routine-task-priority"
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    value={priority}
                    autoComplete="off"
                    onChange={event => setPriority(event.currentTarget.value)}
                  />
                </div>
                <div className="flex w-full flex-col gap-2 sm:w-40 sm:shrink-0">
                  <Label htmlFor="routine-task-max-attempts">
                    {t("workspace.fields.maxAttempts")}
                  </Label>
                  <Input
                    id="routine-task-max-attempts"
                    type="number"
                    min={1}
                    max={20}
                    step={1}
                    value={maxAttempts}
                    autoComplete="off"
                    onChange={event =>
                      setMaxAttempts(event.currentTarget.value)
                    }
                  />
                </div>
              </div>
            </>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="destructive"
              disabled={stationRoutineManager.isCreatingRoutineTask}
              onClick={onClose}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={
                stationRoutineManager.isCreatingRoutineTask ||
                validation?.success !== true
              }
            >
              {stationRoutineManager.isCreatingRoutineTask && <Spinner />}
              {t("common.create")}
            </Button>
          </DialogFooter>
        </form>
        {isPayloadEditorOpen && (
          <Suspense fallback={null}>
            <RoutineTaskPayloadEditor
              isOpen={isPayloadEditorOpen}
              purpose={purpose}
              initialPayload={payload}
              onClose={() => setIsPayloadEditorOpen(false)}
              onConfirm={nextPayload => {
                setPayload(nextPayload);
                setPayloadError("");
              }}
            />
          </Suspense>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateRoutineTaskDialog;
