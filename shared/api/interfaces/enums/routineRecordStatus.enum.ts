export enum RoutineRecordStatus {
  Running = "Running",
  Success = "Success",
  Failed = "Failed",
  Cancel = "Cancel",
}

export const AllRoutineRecordStatuses: RoutineRecordStatus[] =
  Object.values(RoutineRecordStatus);
