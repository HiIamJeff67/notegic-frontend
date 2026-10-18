export enum TransactionEntityType {
  RootShelf = "RootShelf",
  SubShelf = "SubShelf",
  BlockPack = "BlockPack",
  Block = "Block",
  Station = "Station",
  Routine = "Routine",
  RoutineTask = "RoutineTask",
  RoutineTag = "RoutineTag",
  RoutinesToItems = "RoutinesToItems",
  RoutinesToTags = "RoutinesToTags",
}

export const AllTransactionEntityTypes = Object.values(TransactionEntityType);
