import { RoutinePeriod, RoutinePhase } from "@shared/api/interfaces/enums";
import type { RoutineAdmissionState } from "@shared/api/interfaces/routine.interface";
import type { UUID } from "crypto";
import type { RoutineTaskNode } from "./routineTaskNode.type";

export interface RoutineNode {
  id: UUID;
  stationId: UUID;
  title: string;
  description: string;
  phase: RoutinePhase | null;
  isActive?: boolean;
  hasCustomSchedule?: boolean;
  definitionVersion?: number;
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

  admissionState?: RoutineAdmissionState;
}

export const getDefaultRoutineNode = (
  routineId: UUID,
  stationId: UUID
): RoutineNode => ({
  id: routineId,
  stationId,
  title: "Untitled",
  description: "",
  phase: null,
  isActive: false,
  definitionVersion: 1,
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
