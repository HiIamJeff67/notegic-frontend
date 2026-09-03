export enum RoutinePhase {
  Claimed = "Claimed",
  Plan = "Plan",
  Execution = "Execution",
  Recovery = "Recovery",
  Analysis = "Analysis",
}

export const AllRoutinePhases: RoutinePhase[] = Object.values(RoutinePhase);
