import {
  RoutinePhase,
  RoutineTaskPurpose,
  RoutineTaskRecordStatus,
} from "@shared/api/interfaces/enums";
import type { UUID } from "crypto";

export interface RoutineTaskNode {
  id: UUID;
  routineId: UUID;
  // Backend no longer returns stationId for routine tasks. Keep this as a
  // UI-only denormalized field derived from the parent routine.
  stationId: UUID;
  title: string;
  purpose: RoutineTaskPurpose;
  phase: RoutinePhase | null;
  costUnit: number;
  payload: any;
  priority: number;
  previousRoutineTaskIds: UUID[];
  executionStatus?: RoutineTaskRecordStatus | null;
  maxAttempts: number;
  updatedAt: Date;
  createdAt: Date;
}

export const getDefaultRoutineTaskNode = (
  routineTaskId: UUID,
  routineId: UUID,
  stationId: UUID
): RoutineTaskNode => ({
  id: routineTaskId,
  routineId,
  stationId,
  title: "Untitled",
  purpose: RoutineTaskPurpose.GetBlockPack,
  phase: null,
  costUnit: 0,
  payload: {},
  priority: 0,
  previousRoutineTaskIds: [],
  maxAttempts: 1,
  updatedAt: new Date(),
  createdAt: new Date(),
});
