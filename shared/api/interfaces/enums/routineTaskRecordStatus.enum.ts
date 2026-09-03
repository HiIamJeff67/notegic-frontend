export enum RoutineTaskRecordStatus {
  Waiting = "Waiting",
  Ready = "Ready",
  Running = "Running",
  Success = "Success",
  Failed = "Failed",
  Blocked = "Blocked",
  Cancel = "Cancel",
}

export const AllRoutineTaskRecordStatuses: RoutineTaskRecordStatus[] =
  Object.values(RoutineTaskRecordStatus);
