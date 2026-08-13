import {
  RoutinePeriod,
  RoutineTaskPurpose,
  RoutineTaskRecordStatus,
  RoutineTaskStatus,
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
  costUnit: number;
  payload: any;
  priority: number;
  status: RoutineTaskStatus;
  executionStatus?: RoutineTaskRecordStatus | null;
  attempts: number;
  maxAttempts: number;
  period: RoutinePeriod | null;
  nextScheduledAt: Date;
  scheduledAt: Date;
  actualStartedAt: Date | null;
  actualEndedAt: Date | null;
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
  purpose: RoutineTaskPurpose.AppendBlock,
  costUnit: 0,
  payload: {},
  priority: 0,
  status: RoutineTaskStatus.Idle,
  attempts: 0,
  maxAttempts: 1,
  period: null,
  nextScheduledAt: new Date(),
  scheduledAt: new Date(),
  actualStartedAt: null,
  actualEndedAt: null,
  updatedAt: new Date(),
  createdAt: new Date(),
});
