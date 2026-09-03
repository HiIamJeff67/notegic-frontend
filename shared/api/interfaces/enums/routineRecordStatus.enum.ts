export enum RoutineRecordStatus {
  Pending = "Pending",
  Running = "Running",
  Success = "Success",
  Failed = "Failed",
  Blocked = "Blocked",
  Canceled = "Canceled",
}

export const AllRoutineRecordStatuses: RoutineRecordStatus[] =
  Object.values(RoutineRecordStatus);
