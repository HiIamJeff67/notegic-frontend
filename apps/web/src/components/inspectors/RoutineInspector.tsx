import {
  RoutinePeriod,
  RoutinePhase,
  RoutineStatus,
} from "@shared/api/interfaces/enums";
import { translateError } from "@shared/i18n/error";
import {
  translateRoutinePeriod,
  translateRoutinePhase,
  translateRoutineStatus,
} from "@shared/i18n/workspace";
import toast from "@shared/lib/toast";
import type { RoutineNode } from "@shared/types/routineNode.type";
import type { RoutineTaskNode } from "@shared/types/routineTaskNode.type";
import type { UUID } from "crypto";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getClientRequestHeaders } from "@/api/clientHeaders";
import { useGetMyRoutineById } from "@/api/hooks/routine.hook";
import ContainableSelect from "@/components/commons/ContainableSelect/ContainableSelect";
import DatePicker from "@/components/commons/DatePicker/DatePicker";
import MonthlyDayPicker from "@/components/commons/MonthlyDayPicker/MonthlyDayPicker";
import TimePicker from "@/components/commons/TimePicker/TimePicker";
import TimezoneSelector, {
  SupportedTimezones,
} from "@/components/commons/TimezoneSelector/TimezoneSelector";
import WeekdayPicker from "@/components/commons/WeekdayPicker/WeekdayPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useStationRoutine } from "@/hooks";
import InspectorLoadingCover from "./InspectorLoadingCover";

interface RoutineInspectorProps {
  routineId: UUID;
  isOpen: boolean;
  onClose: () => void;
}

const RoutineInspector = ({
  routineId,
  isOpen,
  onClose,
}: RoutineInspectorProps) => {
  const { t } = useTranslation();
  const stationRoutineManager = useStationRoutine();
  const getRoutineQuerier = useGetMyRoutineById();

  const [isLoadingRoutineDetail, setIsLoadingRoutineDetail] = useState(false);
  const [values, setValues] = useState<{
    title: string;
    description: string;
    status: RoutineStatus;
    phase: RoutinePhase | null;
    isPinned: boolean;
    scheduledStartAt: Date;
    scheduledEndAt: Date;
    period: RoutinePeriod | null;
    timezone: string;
  }>({
    title: "",
    description: "",
    status: RoutineStatus.Scheduled,
    phase: null,
    isPinned: false,
    scheduledStartAt: new Date(),
    scheduledEndAt: new Date(),
    period: null,
    timezone: "",
  });
  const [weekdayRange, setWeekdayRange] = useState<{
    start: number;
    end: number;
  }>({ start: 1, end: 1 });
  const [monthlyDayRange, setMonthlyDayRange] = useState<{
    start: number;
    end: number;
  }>({ start: 1, end: 1 });
  const hasInvalidSchedule =
    values.period !== RoutinePeriod.Weekly &&
    values.period !== RoutinePeriod.Monthly &&
    (values.period === RoutinePeriod.Daily
      ? values.scheduledEndAt.getHours() * 60 +
          values.scheduledEndAt.getMinutes() <=
        values.scheduledStartAt.getHours() * 60 +
          values.scheduledStartAt.getMinutes()
      : values.scheduledEndAt <= values.scheduledStartAt);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    const scheduledStartAt = new Date();
    const scheduledEndAt = new Date(
      scheduledStartAt.getTime() + 60 * 60 * 1000
    );
    setValues({
      title: "",
      description: "",
      status: RoutineStatus.Scheduled,
      phase: null,
      isPinned: false,
      scheduledStartAt,
      scheduledEndAt,
      period: null,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
    setWeekdayRange({ start: 1, end: 1 });
    setMonthlyDayRange({ start: 1, end: 1 });

    setIsLoadingRoutineDetail(true);
    getRoutineQuerier
      .fetch({
        header: getClientRequestHeaders(navigator.userAgent),
        param: {
          routineId,
        },
      })
      .then(response => {
        if (cancelled || response.success === false || !response.data) return;
        const routineTasks = response.data.taskIds
          .map(taskId =>
            stationRoutineManager.getRoutineTaskById(taskId as UUID)
          )
          .filter(
            (routineTask): routineTask is RoutineTaskNode =>
              routineTask !== undefined
          );
        const routineNode: RoutineNode = {
          id: response.data.id as UUID,
          stationId: response.data.stationId as UUID,
          title: response.data.title,
          description: response.data.description,
          status: response.data.status,
          phase: response.data.phase,
          isPinned: response.data.isPinned,
          scheduledStartAt: response.data.scheduledStartAt,
          scheduledEndAt: response.data.scheduledEndAt,
          period: response.data.period,
          timezone: response.data.timezone,
          deletedAt: response.data.deletedAt,
          updatedAt: response.data.updatedAt,
          createdAt: response.data.createdAt,
          isOpen: false,
          isExpanded: true,
          routineTagIds: response.data.tagIds as UUID[],
          routineTaskIds: response.data.taskIds as UUID[],
          itemIds: response.data.itemIds as UUID[],
          routineTasks,
        };
        stationRoutineManager.upsertRoutineNode(routineNode);
        if (response.data.period === RoutinePeriod.Weekly) {
          const startWeekday = response.data.scheduledStartAt.getDay() || 7;
          const endWeekday = response.data.scheduledEndAt.getDay() || 7;
          setWeekdayRange({
            start: Math.min(startWeekday, endWeekday),
            end: Math.max(startWeekday, endWeekday),
          });
        }
        if (response.data.period === RoutinePeriod.Monthly) {
          const startDay = Math.min(
            28,
            Math.max(1, response.data.scheduledStartAt.getDate())
          );
          const endDay = Math.min(
            28,
            Math.max(1, response.data.scheduledEndAt.getDate())
          );
          setMonthlyDayRange({
            start: Math.min(startDay, endDay),
            end: Math.max(startDay, endDay),
          });
        }
        setValues({
          title: response.data.title,
          description: response.data.description,
          status: response.data.status,
          phase: response.data.phase,
          isPinned: response.data.isPinned,
          scheduledStartAt: response.data.scheduledStartAt,
          scheduledEndAt: response.data.scheduledEndAt,
          period: response.data.period,
          timezone: response.data.timezone,
        });
      })
      .catch(error => {
        if (!cancelled) toast.error(translateError(error, t));
      })
      .finally(() => {
        if (!cancelled) setIsLoadingRoutineDetail(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, routineId]);

  const saveRoutine = async () => {
    const title = values.title.trim();
    if (title.length === 0) return;
    const weekStartAt = new Date(2026, 0, 4 + weekdayRange.start);
    weekStartAt.setHours(0, 0, 0, 0);
    const weekEndAt = new Date(2026, 0, 4 + weekdayRange.end);
    weekEndAt.setHours(23, 59, 0, 0);
    const monthStartAt = new Date(2026, 0, monthlyDayRange.start);
    monthStartAt.setHours(0, 0, 0, 0);
    const monthEndAt = new Date(2026, 0, monthlyDayRange.end);
    monthEndAt.setHours(23, 59, 0, 0);
    const today = new Date();
    const dailyStartAt = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      values.scheduledStartAt.getHours(),
      values.scheduledStartAt.getMinutes(),
      0,
      0
    );
    const dailyEndAt = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      values.scheduledEndAt.getHours(),
      values.scheduledEndAt.getMinutes(),
      0,
      0
    );
    const scheduledStartAt =
      values.period === RoutinePeriod.Weekly
        ? weekStartAt
        : values.period === RoutinePeriod.Monthly
          ? monthStartAt
          : values.period === RoutinePeriod.Daily
            ? dailyStartAt
            : values.scheduledStartAt;
    const scheduledEndAt =
      values.period === RoutinePeriod.Weekly
        ? weekEndAt
        : values.period === RoutinePeriod.Monthly
          ? monthEndAt
          : values.period === RoutinePeriod.Daily
            ? dailyEndAt
            : values.scheduledEndAt;

    if (hasInvalidSchedule) {
      toast.error(t("workspace.validation.invalidSchedule"));
      return;
    }
    if (!SupportedTimezones.includes(values.timezone)) {
      toast.error(t("workspace.validation.unsupportedTimezone"));
      return;
    }

    try {
      await stationRoutineManager.updateRoutine(
        routineId,
        {
          title,
          description: values.description.trim(),
          isPinned: values.isPinned,
          scheduledStartAt,
          scheduledEndAt,
          ...(values.period === null ? {} : { period: values.period }),
          timezone: values.timezone.trim(),
        },
        {
          period: values.period === null,
        }
      );
      toast.success(t("workspace.routine.updated"));
      onClose();
    } catch (error) {
      toast.error(translateError(error, t));
    }
  };

  return (
    <Sheet
      open={isOpen}
      onOpenChange={open => {
        if (!open && !stationRoutineManager.isUpdatingRoutine) onClose();
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
                {t("workspace.inspector.editRoutineOf")}
              </span>
              <span className="min-w-0 truncate text-foreground">
                "{values.title || t("workspace.trash.routine")}"
              </span>
            </SheetTitle>
            <SheetDescription>
              {t("workspace.inspector.routineDescription")}
            </SheetDescription>
          </SheetHeader>
          <form
            autoComplete="off"
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={async event => {
              event.preventDefault();
              await saveRoutine();
            }}
          >
            <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="routine-inspector-title">
                  {t("workspace.fields.title")}
                </Label>
                <Input
                  id="routine-inspector-title"
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
                <Label htmlFor="routine-inspector-description">
                  {t("workspace.fields.description")}
                </Label>
                <Textarea
                  id="routine-inspector-description"
                  value={values.description}
                  maxLength={1024}
                  className="min-h-48 max-h-72 resize-y overflow-y-auto"
                  onChange={event => {
                    const description = event.currentTarget.value;
                    setValues(current => ({
                      ...current,
                      description,
                    }));
                  }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label>{t("workspace.table.status")}</Label>
                <div className="rounded-sm border border-border bg-muted px-3 py-2 text-sm">
                  {translateRoutineStatus(values.status, t)}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label>{t("workspace.table.phase")}</Label>
                <div className="rounded-sm border border-border bg-muted px-3 py-2 text-sm">
                  {values.phase
                    ? translateRoutinePhase(values.phase, t)
                    : t("workspace.period.none")}
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-sm border border-border px-3 py-3">
                <div className="flex min-w-0 flex-col gap-1">
                  <Label htmlFor="routine-inspector-pinned">
                    {t("workspace.inspector.pinned")}
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    {t("workspace.inspector.pinnedDescription")}
                  </span>
                </div>
                <Switch
                  id="routine-inspector-pinned"
                  checked={values.isPinned}
                  onCheckedChange={isPinned =>
                    setValues(current => ({ ...current, isPinned }))
                  }
                />
              </div>

              <div className="flex flex-col gap-2">
                {values.period === RoutinePeriod.Weekly ? (
                  <>
                    <Label>{t("workspace.fields.weekdays")}</Label>
                    <WeekdayPicker
                      value={weekdayRange}
                      onValueChange={setWeekdayRange}
                    />
                  </>
                ) : values.period === RoutinePeriod.Monthly ? (
                  <>
                    <Label>{t("workspace.fields.monthDays")}</Label>
                    <MonthlyDayPicker
                      value={monthlyDayRange}
                      onValueChange={setMonthlyDayRange}
                    />
                    <span className="text-xs text-muted-foreground">
                      {t("workspace.fields.monthDaysDescription")}
                    </span>
                  </>
                ) : (
                  <>
                    <Label>{t("workspace.inspector.start")}</Label>
                    {values.period === RoutinePeriod.Daily ? (
                      <TimePicker
                        value={values.scheduledStartAt}
                        onValueChange={scheduledStartAt => {
                          if (!scheduledStartAt) return;
                          setValues(current => ({
                            ...current,
                            scheduledStartAt,
                          }));
                        }}
                        placeholder={t("workspace.fields.selectStartTime")}
                      />
                    ) : (
                      <DatePicker
                        value={values.scheduledStartAt}
                        onValueChange={scheduledStartAt => {
                          if (!scheduledStartAt) return;
                          setValues(current => ({
                            ...current,
                            scheduledStartAt,
                          }));
                        }}
                        placeholder={t("workspace.fields.selectStartDateTime")}
                      />
                    )}

                    <Label>{t("workspace.inspector.end")}</Label>
                    {values.period === RoutinePeriod.Daily ? (
                      <TimePicker
                        value={values.scheduledEndAt}
                        onValueChange={scheduledEndAt => {
                          if (!scheduledEndAt) return;
                          setValues(current => ({
                            ...current,
                            scheduledEndAt,
                          }));
                        }}
                        isInvalid={hasInvalidSchedule}
                        placeholder={t("workspace.fields.selectEndTime")}
                      />
                    ) : (
                      <DatePicker
                        value={values.scheduledEndAt}
                        onValueChange={scheduledEndAt => {
                          if (!scheduledEndAt) return;
                          setValues(current => ({
                            ...current,
                            scheduledEndAt,
                          }));
                        }}
                        disabled={{ before: values.scheduledStartAt }}
                        isInvalid={hasInvalidSchedule}
                        placeholder={t("workspace.fields.selectEndDateTime")}
                      />
                    )}
                  </>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label>{t("workspace.fields.repeat")}</Label>
                <ContainableSelect
                  value={values.period ?? "None"}
                  onValueChange={period =>
                    setValues(current => ({
                      ...current,
                      period:
                        period === "None" ? null : (period as RoutinePeriod),
                    }))
                  }
                  options={[
                    {
                      value: "None",
                      label: translateRoutinePeriod(null, t),
                    },
                    {
                      value: RoutinePeriod.Daily,
                      label: translateRoutinePeriod(RoutinePeriod.Daily, t),
                    },
                    {
                      value: RoutinePeriod.Weekly,
                      label: translateRoutinePeriod(RoutinePeriod.Weekly, t),
                    },
                    {
                      value: RoutinePeriod.Monthly,
                      label: translateRoutinePeriod(RoutinePeriod.Monthly, t),
                    },
                  ]}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label>{t("workspace.inspector.timezone")}</Label>
                <TimezoneSelector
                  value={values.timezone}
                  onValueChange={timezone =>
                    setValues(current => ({
                      ...current,
                      timezone,
                    }))
                  }
                />
              </div>
            </div>

            <SheetFooter className="shrink-0 flex-col gap-2 border-t border-border px-6 py-5 sm:flex-col sm:space-x-0">
              <Button
                type="submit"
                className="w-full"
                disabled={
                  stationRoutineManager.isUpdatingRoutine ||
                  isLoadingRoutineDetail ||
                  values.title.trim().length === 0 ||
                  hasInvalidSchedule ||
                  !SupportedTimezones.includes(values.timezone)
                }
              >
                {stationRoutineManager.isUpdatingRoutine && <Spinner />}
                {t("common.save")}
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="w-full"
                disabled={stationRoutineManager.isUpdatingRoutine}
                onClick={onClose}
              >
                {t("common.cancel")}
              </Button>
            </SheetFooter>
          </form>
          <InspectorLoadingCover
            label={t("common.loading")}
            show={isLoadingRoutineDetail}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default RoutineInspector;
