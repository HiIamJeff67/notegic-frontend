import {
  RoutineTaskPurpose,
  RoutineTaskPurposeByAction,
} from "@shared/api/interfaces/enums";
import { routineTaskPurposeTKeys } from "@shared/i18n/enums/routineTaskPurpose.tKey";
import { tError } from "@shared/i18n/error";
import toast from "@shared/lib/toast";
import type { UUID } from "crypto";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
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
  const { t } = useTranslation();
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

  const createRoutineTask = async () => {
    let parsedPayload: unknown;
    try {
      parsedPayload = JSON.parse(payload);
    } catch {
      setPayloadError(t("workspace.validation.invalidJson"));
      return;
    }
    setPayloadError("");

    let routineTaskId: UUID;
    try {
      const routineTaskNode = await stationRoutineManager.createRoutineTask(
        routineId,
        title,
        purpose,
        parsedPayload,
        Number(priority),
        Number(maxAttempts)
      );
      routineTaskId = routineTaskNode.id;
    } catch (error) {
      toast.error(tError(error, t));
      return;
    }

    toast.success(t("workspace.routineTask.created"));
    onClose();
    try {
      await onCreated?.(routineTaskId);
    } catch (error) {
      console.error("Failed to refresh after creating routine task", error);
    }
    try {
      await userManager.fetchUserQuota();
    } catch (error) {
      console.error(
        "Failed to refresh user quota after creating routine task",
        error
      );
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
                        {`${t(routineTaskPurposeTKeys[purpose].action)} · ${t(routineTaskPurposeTKeys[purpose].target)}`}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="z-[160]">
                      {Object.entries(RoutineTaskPurposeByAction).map(
                        ([action, purposes], index) => (
                          <SelectGroup key={action}>
                            {index > 0 && <SelectSeparator />}
                            <SelectLabel>
                              {action === "Get"
                                ? t("workspace.fields.get")
                                : action === "Create"
                                  ? t("workspace.fields.create")
                                  : action === "Update"
                                    ? t("workspace.fields.update")
                                    : t("workspace.fields.delete")}
                            </SelectLabel>
                            {purposes.map(taskPurpose => (
                              <SelectItem key={taskPurpose} value={taskPurpose}>
                                {`${t(routineTaskPurposeTKeys[taskPurpose].action)} · ${t(routineTaskPurposeTKeys[taskPurpose].target)}`}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="routine-task-payload">
                  {t("workspace.fields.payload")}
                </Label>
                <div className="flex flex-col">
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
                        isPayloadExpanded
                          ? "overflow-hidden"
                          : "overflow-y-auto"
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
                          previousIsPayloadExpanded =>
                            !previousIsPayloadExpanded
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
                </div>
                <div className="flex items-start justify-between gap-3 rounded-sm border bg-card/45 px-3 py-2">
                  <div className="flex min-w-0 flex-col gap-1">
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
              disabled={stationRoutineManager.isCreatingRoutineTask}
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
