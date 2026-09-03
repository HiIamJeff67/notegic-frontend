import {
  RoutinePeriod,
  RoutinePhase,
  RoutineRecordStatus,
  RoutineStatus,
  RoutineTaskPurpose,
  RoutineTaskRecordStatus,
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

export const translateRoutineTaskRecordStatus = (
  status: RoutineTaskRecordStatus,
  t: TFunction
): string => {
  switch (status) {
    case RoutineTaskRecordStatus.Success:
      return t("workspace.status.success");
    case RoutineTaskRecordStatus.Failed:
      return t("workspace.status.failed");
    case RoutineTaskRecordStatus.Blocked:
      return t("workspace.status.blocked");
    case RoutineTaskRecordStatus.Ready:
      return t("workspace.status.ready");
    case RoutineTaskRecordStatus.Cancel:
      return t("workspace.status.cancelled");
    default:
      return t("workspace.status.running");
  }
};

export const translateRoutineRecordStatus = (
  status: RoutineRecordStatus,
  t: TFunction
): string => {
  switch (status) {
    case RoutineRecordStatus.Pending:
      return t("workspace.status.waiting");
    case RoutineRecordStatus.Running:
      return t("workspace.status.running");
    case RoutineRecordStatus.Success:
      return t("workspace.status.success");
    case RoutineRecordStatus.Failed:
      return t("workspace.status.failed");
    case RoutineRecordStatus.Blocked:
      return t("workspace.status.blocked");
    case RoutineRecordStatus.Canceled:
      return t("workspace.status.cancelled");
    default:
      return t("workspace.status.waiting");
  }
};

export const translateRoutinePhase = (
  phase: RoutinePhase,
  t: TFunction
): string => {
  switch (phase) {
    case RoutinePhase.Claimed:
      return t("workspace.phase.claimed");
    case RoutinePhase.Plan:
      return t("workspace.phase.plan");
    case RoutinePhase.Execution:
      return t("workspace.phase.execution");
    case RoutinePhase.Recovery:
      return t("workspace.phase.recovery");
    case RoutinePhase.Analysis:
      return t("workspace.phase.analysis");
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
    .match(/^(Get|Create|Update|Delete)(.+)$/)
    ?.slice(1) ?? ["", purpose];
  const actionLabel =
    action === "Get"
      ? t("workspace.fields.get")
      : action === "Create"
        ? t("workspace.fields.create")
        : action === "Update"
          ? t("workspace.fields.update")
          : t("workspace.fields.delete");
  const targetLabel =
    target === "SubShelf"
      ? t("workspace.trash.subShelf")
      : target === "BlockPack"
        ? t("workspace.trash.blockPack")
        : target === "Routine"
          ? t("workspace.trash.routine")
          : t("workspace.trash.material");

  return `${actionLabel} · ${targetLabel}`;
};
