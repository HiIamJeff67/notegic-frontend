import { RoutineTaskPurpose } from "@shared/api/interfaces/enums";

export const routineTaskPurposeTKeys = {
  [RoutineTaskPurpose.GetSubShelf]: {
    action: "workspace.fields.get",
    target: "workspace.trash.subShelf",
  },
  [RoutineTaskPurpose.CreateSubShelf]: {
    action: "workspace.fields.create",
    target: "workspace.trash.subShelf",
  },
  [RoutineTaskPurpose.UpdateSubShelf]: {
    action: "workspace.fields.update",
    target: "workspace.trash.subShelf",
  },
  [RoutineTaskPurpose.DeleteSubShelf]: {
    action: "workspace.fields.delete",
    target: "workspace.trash.subShelf",
  },
  [RoutineTaskPurpose.GetBlockPack]: {
    action: "workspace.fields.get",
    target: "workspace.trash.blockPack",
  },
  [RoutineTaskPurpose.CreateBlockPack]: {
    action: "workspace.fields.create",
    target: "workspace.trash.blockPack",
  },
  [RoutineTaskPurpose.UpdateBlockPack]: {
    action: "workspace.fields.update",
    target: "workspace.trash.blockPack",
  },
  [RoutineTaskPurpose.DeleteBlockPack]: {
    action: "workspace.fields.delete",
    target: "workspace.trash.blockPack",
  },
  [RoutineTaskPurpose.GetRoutine]: {
    action: "workspace.fields.get",
    target: "workspace.trash.routine",
  },
  [RoutineTaskPurpose.CreateRoutine]: {
    action: "workspace.fields.create",
    target: "workspace.trash.routine",
  },
  [RoutineTaskPurpose.UpdateRoutine]: {
    action: "workspace.fields.update",
    target: "workspace.trash.routine",
  },
  [RoutineTaskPurpose.DeleteRoutine]: {
    action: "workspace.fields.delete",
    target: "workspace.trash.routine",
  },
  [RoutineTaskPurpose.GetMaterial]: {
    action: "workspace.fields.get",
    target: "workspace.trash.material",
  },
  [RoutineTaskPurpose.CreateMaterial]: {
    action: "workspace.fields.create",
    target: "workspace.trash.material",
  },
  [RoutineTaskPurpose.UpdateMaterial]: {
    action: "workspace.fields.update",
    target: "workspace.trash.material",
  },
  [RoutineTaskPurpose.DeleteMaterial]: {
    action: "workspace.fields.delete",
    target: "workspace.trash.material",
  },
} as const satisfies Record<
  RoutineTaskPurpose,
  { action: string; target: string }
>;
