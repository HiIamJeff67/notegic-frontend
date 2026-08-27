import {
  RoutinePeriod,
  RoutineStatus,
  RoutineTaskPurpose,
  RoutineTaskRecordStatus,
  RoutineTaskStatus,
} from "@shared/api/interfaces/enums";
import type { TFunction } from "i18next";

export const formatTimezoneDisplayName = (
  timezone: string,
  locale?: string
): string => {
  try {
    return (
      new Intl.DateTimeFormat(locale, {
        timeZone: timezone,
        timeZoneName: "longGeneric",
      })
        .formatToParts(new Date())
        .find(part => part.type === "timeZoneName")?.value ?? timezone
    );
  } catch {
    return timezone;
  }
};

export const translateRoutineStatus = (
  status: RoutineStatus,
  t: TFunction
): string => {
  switch (status) {
    case RoutineStatus.InProgress:
      return t("workspace.status.inProgress");
    case RoutineStatus.Completed:
      return t("workspace.status.completed");
    case RoutineStatus.OverDue:
      return t("workspace.status.overdue");
    default:
      return t("workspace.status.scheduled");
  }
};

export const translateRoutineTaskStatus = (
  status: RoutineTaskStatus,
  t: TFunction
): string => {
  switch (status) {
    case RoutineTaskStatus.Waiting:
      return t("workspace.status.waiting");
    case RoutineTaskStatus.Running:
      return t("workspace.status.running");
    case RoutineTaskStatus.Pause:
      return t("workspace.status.paused");
    default:
      return t("workspace.status.idle");
  }
};

export const translateRoutineTaskRecordStatus = (
  status: RoutineTaskRecordStatus,
  t: TFunction
): string => {
  switch (status) {
    case RoutineTaskRecordStatus.Success:
      return t("workspace.status.success");
    case RoutineTaskRecordStatus.Failed:
      return t("workspace.status.failed");
    case RoutineTaskRecordStatus.Cancel:
      return t("workspace.status.cancelled");
    default:
      return t("workspace.status.running");
  }
};

export const translateRoutinePeriod = (
  period: RoutinePeriod | null,
  t: TFunction
): string => {
  switch (period) {
    case RoutinePeriod.Daily:
      return t("workspace.period.daily");
    case RoutinePeriod.Weekly:
      return t("workspace.period.weekly");
    case RoutinePeriod.Monthly:
      return t("workspace.period.monthly");
    default:
      return t("workspace.period.none");
  }
};

export const translateRoutineTaskPurpose = (
  purpose: RoutineTaskPurpose,
  t: TFunction
): string => {
  const [action, target] = purpose
    .match(/^(Create|Append|Update|Reset)(.+)$/)
    ?.slice(1) ?? ["", purpose];
  const actionLabel =
    action === "Create"
      ? t("workspace.fields.create")
      : action === "Append"
        ? t("workspace.fields.append")
        : action === "Update"
          ? t("workspace.fields.update")
          : t("workspace.fields.reset");
  const targetLabel =
    target === "RootShelf"
      ? t("workspace.trash.rootShelf")
      : target === "SubShelf"
        ? t("workspace.trash.subShelf")
        : target === "BlockPack"
          ? t("workspace.trash.blockPack")
          : target === "Routine"
            ? t("workspace.trash.routine")
            : t("workspace.fields.block");

  return `${actionLabel} · ${targetLabel}`;
};
