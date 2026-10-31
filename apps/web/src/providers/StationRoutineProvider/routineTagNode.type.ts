import { SupportedIcon } from "@shared/api/interfaces/enums";
import type { UUID } from "crypto";
import type { RoutineNode } from "./routineNode.type";

export interface RoutineTagNode {
  id: UUID;
  name: string;
  color: string;
  icon: SupportedIcon | null;
  updatedAt: Date;
  createdAt: Date;

  routines: RoutineNode[];
  routineCount: number;

  isOpen: boolean;
  isExpanded: boolean;
}

export const getDefaultRoutineTagNode = (
  routineTagId: UUID
): RoutineTagNode => ({
  id: routineTagId,
  name: "Undefined",
  color: "#000000",
  icon: null,
  updatedAt: new Date(),
  createdAt: new Date(),

  isOpen: false,
  isExpanded: false,

  routines: [],
  routineCount: 0,
});
