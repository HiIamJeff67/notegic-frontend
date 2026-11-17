export enum RoutineTaskRecordStatus {
  Waiting = "Waiting",
  Running = "Running",
  Success = "Success",
  Failed = "Failed",
  Blocked = "Blocked",
  Cancel = "Cancel",
}

export const AllRoutineTaskRecordStatuses: RoutineTaskRecordStatus[] =
  Object.values(RoutineTaskRecordStatus);
