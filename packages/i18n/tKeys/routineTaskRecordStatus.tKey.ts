import { RoutineTaskRecordStatus } from "@shared/api/interfaces/enums";

export const routineTaskRecordStatusTKeys = {
  [RoutineTaskRecordStatus.Waiting]: "workspace.status.waiting",
  [RoutineTaskRecordStatus.Running]: "workspace.status.running",
  [RoutineTaskRecordStatus.Success]: "workspace.status.success",
  [RoutineTaskRecordStatus.Failed]: "workspace.status.failed",
  [RoutineTaskRecordStatus.Blocked]: "workspace.status.blocked",
  [RoutineTaskRecordStatus.Cancel]: "workspace.status.cancelled",
} as const satisfies Record<RoutineTaskRecordStatus, string>;
