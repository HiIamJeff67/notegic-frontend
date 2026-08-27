import { getClientRequestHeaders } from "@/api/clientHeaders";
import { useGetMyRoutineTaskById } from "@/api/hooks/routineTask.hook";
import {
  AllRoutinePeriods,
  RoutinePeriod,
  RoutineTaskPurpose,
  UserPlan,
} from "@shared/api/interfaces/enums";
import { PlanLimitations } from "@shared/constants";
import toast from "@shared/lib/toast";
import type { RoutineTaskNode } from "@shared/types/routineTaskNode.type";
import type { UUID } from "crypto";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import ContainableSelect from "@/components/commons/ContainableSelect/ContainableSelect";
import DatePicker from "@/components/commons/DatePicker/DatePicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { useStationRoutine, useUser } from "@/hooks";
import { translateError } from "@shared/i18n/error";
import {
  translateRoutinePeriod,
  translateRoutineTaskPurpose,
  translateRoutineTaskStatus,
} from "@shared/i18n/workspace";
import InspectorLoadingCover from "./InspectorLoadingCover";

const RoutineTaskPayloadEditor = lazy(
  () =>
    import(
      "@/components/core/RoutineOverviewer/RoutineTaskPayloadEditors/RoutineTaskPayloadEditor"
    )
);

interface RoutineTaskInspectorProps {
  routineTaskId: UUID;
  isOpen: boolean;
  onClose: () => void;
}

const RoutineTaskInspector = ({
  routineTaskId,
  isOpen,
  onClose,
}: RoutineTaskInspectorProps) => {
  const { i18n, t } = useTranslation();
  const stationRoutineManager = useStationRoutine();
  const userManager = useUser();
  const getRoutineTaskQuerier = useGetMyRoutineTaskById();

  const routineTaskNode =
    stationRoutineManager.getRoutineTaskById(routineTaskId);

  const [isLoadingRoutineTaskDetail, setIsLoadingRoutineTaskDetail] =
    useState(false);
  const [values, setValues] = useState<{
    title: string;
    purpose: RoutineTaskPurpose;
    payload: string;
    priority: number;
    maxAttempts: number;
    nextScheduledAt: Date;
    scheduledAt: Date;
    period: RoutinePeriod | null;
    costUnit: number;
  }>({
    title: "",
    purpose: RoutineTaskPurpose.CreateBlockPack,
    payload: "{}",
    priority: 0,
    maxAttempts: 1,
    nextScheduledAt: new Date(),
    scheduledAt: new Date(),
    period: null,
    costUnit: 0,
  });
  const [isPayloadEditorOpen, setIsPayloadEditorOpen] =
    useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setValues({
      title: "",
      purpose: RoutineTaskPurpose.CreateBlockPack,
      payload: "{}",
      priority: 0,
      maxAttempts: 1,
      nextScheduledAt: new Date(),
      scheduledAt: new Date(),
      period: null,
      costUnit: 0,
    });
    setIsPayloadEditorOpen(false);

    setIsLoadingRoutineTaskDetail(true);
    getRoutineTaskQuerier
      .fetch({
        header: getClientRequestHeaders(navigator.userAgent),
        param: {
          routineTaskId,
        },
      })
      .then(response => {
        if (cancelled || !response.data) return;
        const parentRoutine = stationRoutineManager.getRoutineById(
          response.data.routineId as UUID
        );
        const routineTaskNode: RoutineTaskNode = {
          id: response.data.id as UUID,
          routineId: response.data.routineId as UUID,
          stationId: parentRoutine?.stationId ?? ("" as UUID),
          title: response.data.title,
          purpose: response.data.purpose,
          costUnit: response.data.costUnit,
          payload: response.data.payload,
          priority: response.data.priority,
          status: response.data.status,
          attempts: response.data.attempts,
          maxAttempts: response.data.maxAttempts,
          period: response.data.period,
          nextScheduledAt: response.data.nextScheduledAt,
          scheduledAt: response.data.scheduledAt,
          actualStartedAt: response.data.actualStartedAt,
          actualEndedAt: response.data.actualEndedAt,
          updatedAt: response.data.updatedAt,
          createdAt: response.data.createdAt,
        };
        stationRoutineManager.upsertRoutineTaskNode(routineTaskNode);
        setValues({
          title: response.data.title,
          purpose: response.data.purpose,
          payload: JSON.stringify(response.data.payload ?? {}, null, 2),
          priority: response.data.priority,
          maxAttempts: response.data.maxAttempts,
          nextScheduledAt: response.data.nextScheduledAt,
          scheduledAt: response.data.scheduledAt,
          period: response.data.period,
          costUnit: response.data.costUnit,
        });
      })
      .catch(error => {
        if (!cancelled) toast.error(translateError(error, t));
      })
      .finally(() => {
        if (!cancelled) setIsLoadingRoutineTaskDetail(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, routineTaskId]);

  const estimatedPayloadCostUnit = useMemo(() => {
    try {
      const parsedPayload =
        values.payload.trim().length === 0 ? {} : JSON.parse(values.payload);
      return Math.ceil(
        new Blob([JSON.stringify(parsedPayload ?? {})]).size / 1024
      );
    } catch {
      return null;
    }
  }, [values.payload]);

  const routineTaskMonthlyCostUnitUsed = Number(
    userManager.userAccount?.routineTaskCostUnitCount ?? 0
  );
  const maxRoutineTaskCostUnitCount =
    PlanLimitations[userManager.userData?.plan ?? UserPlan.Free]
      .maxRoutineTaskCostUnitCount;

  const saveRoutineTask = async () => {
    const title = values.title.trim();
    if (title.length === 0) return;
    let payload: unknown;
    try {
      payload =
        values.payload.trim().length === 0 ? {} : JSON.parse(values.payload);
    } catch {
      toast.error(t("workspace.validation.invalidJson"));
      return;
    }
    if (
      new TextEncoder().encode(JSON.stringify(payload ?? {})).length >
      16_777_216
    ) {
      toast.error(t("workspace.validation.payloadTooLarge"));
      return;
    }
    try {
      await stationRoutineManager.updateRoutineTask(
        routineTaskId,
        {
          title,
          purpose: values.purpose,
          payload,
          priority: values.priority,
          maxAttempts: values.maxAttempts,
          nextScheduledAt: values.nextScheduledAt,
          ...(values.period === null ? {} : { period: values.period }),
        },
        {
          Period: values.period === null,
        }
      );
      void userManager.fetchUserAccount();
      toast.success(t("workspace.routineTask.updated"));
      onClose();
    } catch (error) {
      toast.error(translateError(error, t));
    }
  };

  return (
    <Sheet
      open={isOpen}
      onOpenChange={open => {
        if (!open && !stationRoutineManager.isUpdatingRoutineTask) onClose();
      }}
    >
      <SheetContent
        overlayClassName="z-[110]"
        className="inspector-surface z-[110] flex h-full w-full flex-col gap-0 bg-sidebar p-0 sm:max-w-md"
      >
        <div className="relative flex h-full min-h-0 w-full flex-col">
          <SheetHeader className="min-w-0 shrink-0 border-b border-border px-6 py-5 pr-12">
            <SheetTitle className="flex min-w-0 items-center gap-2">
              <span className="shrink-0">
                {t("workspace.inspector.editRoutineTaskOf")}
              </span>
              <span className="min-w-0 truncate text-foreground">
                "{values.title || t("workspace.table.task")}"
              </span>
            </SheetTitle>
            <SheetDescription>
              {t("workspace.inspector.routineTaskDescription")}
            </SheetDescription>
          </SheetHeader>
          <form
            autoComplete="off"
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={async event => {
              event.preventDefault();
              await saveRoutineTask();
            }}
          >
            <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="routine-task-inspector-title">
                  {t("workspace.fields.title")}
                </Label>
                <Input
                  id="routine-task-inspector-title"
                  value={values.title}
                  autoComplete="off"
                  maxLength={128}
                  autoFocus
                  onChange={event => {
                    const title = event.currentTarget.value;
                    setValues(current => ({
                      ...current,
                      title,
                    }));
                  }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label>{t("workspace.fields.purpose")}</Label>
                <ContainableSelect
                  value={values.purpose}
                  onValueChange={purpose =>
                    setValues(current => ({
                      ...current,
                      purpose: purpose as RoutineTaskPurpose,
                    }))
                  }
                  valueLabel={translateRoutineTaskPurpose(values.purpose, t)}
                >
                  <SelectGroup>
                    <SelectLabel>{t("workspace.fields.create")}</SelectLabel>
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
                    <SelectLabel>{t("workspace.fields.append")}</SelectLabel>
                    <SelectItem value={RoutineTaskPurpose.AppendBlock}>
                      {t("workspace.fields.block")}
                    </SelectItem>
                  </SelectGroup>
                  <SelectSeparator />
                  <SelectGroup>
                    <SelectLabel>{t("workspace.fields.update")}</SelectLabel>
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
                </ContainableSelect>
              </div>

              <div className="flex gap-4">
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <Label htmlFor="routine-task-inspector-priority">
                    {t("workspace.fields.priority")}
                  </Label>
                  <Input
                    id="routine-task-inspector-priority"
                    type="number"
                    min={0}
                    value={values.priority}
                    onChange={event => {
                      const priority = event.currentTarget.valueAsNumber;
                      setValues(current => ({
                        ...current,
                        priority: Math.max(0, priority),
                      }));
                    }}
                  />
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <Label htmlFor="routine-task-inspector-attempts">
                    {t("workspace.fields.maxAttempts")}
                  </Label>
                  <Input
                    id="routine-task-inspector-attempts"
                    type="number"
                    min={1}
                    max={20}
                    value={values.maxAttempts}
                    onChange={event => {
                      const maxAttempts = event.currentTarget.valueAsNumber;
                      setValues(current => ({
                        ...current,
                        maxAttempts: Math.min(20, Math.max(1, maxAttempts)),
                      }));
                    }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label>{t("workspace.fields.nextScheduledAt")}</Label>
                <DatePicker
                  value={values.nextScheduledAt}
                  onValueChange={nextScheduledAt => {
                    if (!nextScheduledAt) return;
                    nextScheduledAt.setSeconds(0, 0);
                    setValues(current => ({
                      ...current,
                      nextScheduledAt,
                    }));
                  }}
                  placeholder={t("workspace.fields.selectNextExecutionTime")}
                />
                <span className="text-xs text-muted-foreground">
                  {t("workspace.inspector.nextExpectedRun", {
                    date: values.nextScheduledAt.toLocaleString(
                      i18n.resolvedLanguage
                    ),
                  })}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t("workspace.inspector.systemClaimableTime", {
                    date: values.scheduledAt.toLocaleString(
                      i18n.resolvedLanguage
                    ),
                  })}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <Label>{t("workspace.fields.recurring")}</Label>
                <ContainableSelect
                  value={values.period ?? "OneShot"}
                  onValueChange={period =>
                    setValues(current => ({
                      ...current,
                      period:
                        period === "OneShot" ? null : (period as RoutinePeriod),
                    }))
                  }
                  options={[
                    {
                      value: "OneShot",
                      label: t("workspace.fields.oneShot"),
                    },
                    ...AllRoutinePeriods.map(routinePeriod => ({
                      value: routinePeriod,
                      label: translateRoutinePeriod(routinePeriod, t),
                    })),
                  ]}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="routine-task-inspector-payload">
                  {t("workspace.fields.payload")}
                </Label>
                <div
                  id="routine-task-inspector-payload"
                  className="max-h-64 overflow-y-auto rounded-sm border bg-background p-3"
                >
                  <pre className="whitespace-pre-wrap break-words font-mono text-xs text-muted-foreground">
                    {values.payload}
                  </pre>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-fit"
                  onClick={() => setIsPayloadEditorOpen(true)}
                >
                  {t("workspace.payload.edit")}
                </Button>
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
              </div>

              <div className="flex items-center justify-between gap-4 rounded-sm border border-border px-3 py-3 text-sm">
                <span className="text-muted-foreground">
                  {t("workspace.inspector.currentStatus")}
                </span>
                <span className="font-medium">
                  {routineTaskNode
                    ? translateRoutineTaskStatus(routineTaskNode.status, t)
                    : t("workspace.fields.loading")}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-sm border border-border px-3 py-3 text-sm">
                <span className="text-muted-foreground">
                  {t("workspace.inspector.costUnit")}
                </span>
                <span className="font-medium tabular-nums">
                  {values.costUnit}
                </span>
              </div>
            </div>

            <SheetFooter className="shrink-0 flex-col gap-2 border-t border-border px-6 py-5 sm:flex-col sm:space-x-0">
              <Button
                type="submit"
                className="w-full"
                disabled={
                  stationRoutineManager.isUpdatingRoutineTask ||
                  isLoadingRoutineTaskDetail ||
                  values.title.trim().length === 0 ||
                  estimatedPayloadCostUnit === null
                }
              >
                {stationRoutineManager.isUpdatingRoutineTask && <Spinner />}
                {t("common.save")}
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="w-full"
                disabled={stationRoutineManager.isUpdatingRoutineTask}
                onClick={onClose}
              >
                {t("common.cancel")}
              </Button>
            </SheetFooter>
          </form>
          {isPayloadEditorOpen && (
            <Suspense fallback={null}>
              <RoutineTaskPayloadEditor
                isOpen={isPayloadEditorOpen}
                purpose={values.purpose}
                initialPayload={values.payload}
                onClose={() => setIsPayloadEditorOpen(false)}
                onConfirm={payload => {
                  setValues(current => ({
                    ...current,
                    payload,
                  }));
                }}
              />
            </Suspense>
          )}
          <InspectorLoadingCover
            label={t("common.loading")}
            show={isLoadingRoutineTaskDetail}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default RoutineTaskInspector;
