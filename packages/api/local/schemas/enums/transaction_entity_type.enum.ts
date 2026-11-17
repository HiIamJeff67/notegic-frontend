export enum TransactionEntityType {
  RootShelf = "RootShelf",
  SubShelf = "SubShelf",
  BlockPack = "BlockPack",
  Material = "Material",
  Block = "Block",
  Station = "Station",
  Routine = "Routine",
  RoutineTask = "RoutineTask",
  RoutineTag = "RoutineTag",
  RoutinesToItems = "RoutinesToItems",
  RoutinesToTags = "RoutinesToTags",
  RoutinesToTasks = "RoutinesToTasks",
  RootShelfPermission = "RootShelfPermission",
  StationMembership = "StationMembership",
}

export const AllTransactionEntityTypes = Object.values(TransactionEntityType);
