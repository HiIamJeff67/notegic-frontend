import {
  RoutinePeriod,
  RoutinePhase,
  RoutineStatus,
} from "@shared/api/interfaces/enums";
import type { UUID } from "crypto";
import type { RoutineTaskNode } from "./routineTaskNode.type";

export interface RoutineNode {
  id: UUID;
  stationId: UUID;
  title: string;
  description: string;
  status: RoutineStatus;
  phase: RoutinePhase | null;
  isPinned: boolean;
  scheduledStartAt: Date;
  scheduledEndAt: Date;
  period: RoutinePeriod | null;
  timezone: string;
  deletedAt: Date | null;
  updatedAt: Date;
  createdAt: Date;

  isOpen: boolean;
  isExpanded: boolean;

  routineTagIds: UUID[];
  routineTaskIds: UUID[];
  itemIds: UUID[];
  routineTasks: RoutineTaskNode[];
}

export const getDefaultRoutineNode = (
  routineId: UUID,
  stationId: UUID
): RoutineNode => ({
  id: routineId,
  stationId,
  title: "Untitled",
  description: "",
  status: RoutineStatus.Scheduled,
  phase: null,
  isPinned: false,
  scheduledStartAt: new Date(),
  scheduledEndAt: new Date(),
  period: null,
  timezone: "",
  deletedAt: null,
  updatedAt: new Date(),
  createdAt: new Date(),

  isOpen: false,
  isExpanded: false,

  routineTagIds: [],
  routineTaskIds: [],
  itemIds: [],
  routineTasks: [],
});
