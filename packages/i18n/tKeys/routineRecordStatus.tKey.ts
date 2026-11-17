import { RoutineRecordStatus } from "@shared/api/interfaces/enums";

export const routineRecordStatusTKeys = {
  [RoutineRecordStatus.Running]: "workspace.status.running",
  [RoutineRecordStatus.Success]: "workspace.status.success",
  [RoutineRecordStatus.Failed]: "workspace.status.failed",
  [RoutineRecordStatus.Cancel]: "workspace.status.cancelled",
} as const satisfies Record<RoutineRecordStatus, string>;
