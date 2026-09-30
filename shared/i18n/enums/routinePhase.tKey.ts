import { RoutinePhase } from "@shared/api/interfaces/enums";

export const routinePhaseTKeys = {
  [RoutinePhase.Plan]: "workspace.phase.plan",
  [RoutinePhase.Execution]: "workspace.phase.execution",
  [RoutinePhase.Recovery]: "workspace.phase.recovery",
  [RoutinePhase.Analysis]: "workspace.phase.analysis",
} as const satisfies Record<RoutinePhase, string>;
