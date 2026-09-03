export enum RoutineTaskPurpose {
  GetSubShelf = "GetSubShelf",
  CreateSubShelf = "CreateSubShelf",
  UpdateSubShelf = "UpdateSubShelf",
  DeleteSubShelf = "DeleteSubShelf",
  GetBlockPack = "GetBlockPack",
  CreateBlockPack = "CreateBlockPack",
  UpdateBlockPack = "UpdateBlockPack",
  DeleteBlockPack = "DeleteBlockPack",
  GetRoutine = "GetRoutine",
  CreateRoutine = "CreateRoutine",
  UpdateRoutine = "UpdateRoutine",
  DeleteRoutine = "DeleteRoutine",
  GetMaterial = "GetMaterial",
  CreateMaterial = "CreateMaterial",
  UpdateMaterial = "UpdateMaterial",
  DeleteMaterial = "DeleteMaterial",
}

export const RoutineTaskPurposeByAction = {
  Get: [
    RoutineTaskPurpose.GetSubShelf,
    RoutineTaskPurpose.GetBlockPack,
    RoutineTaskPurpose.GetRoutine,
    RoutineTaskPurpose.GetMaterial,
  ],
  Create: [
    RoutineTaskPurpose.CreateSubShelf,
    RoutineTaskPurpose.CreateBlockPack,
    RoutineTaskPurpose.CreateRoutine,
    RoutineTaskPurpose.CreateMaterial,
  ],
  Update: [
    RoutineTaskPurpose.UpdateSubShelf,
    RoutineTaskPurpose.UpdateBlockPack,
    RoutineTaskPurpose.UpdateRoutine,
    RoutineTaskPurpose.UpdateMaterial,
  ],
  Delete: [
    RoutineTaskPurpose.DeleteSubShelf,
    RoutineTaskPurpose.DeleteBlockPack,
    RoutineTaskPurpose.DeleteRoutine,
    RoutineTaskPurpose.DeleteMaterial,
  ],
} as const;

export const AllRoutineTaskPurposes: RoutineTaskPurpose[] =
  Object.values(RoutineTaskPurpose);
