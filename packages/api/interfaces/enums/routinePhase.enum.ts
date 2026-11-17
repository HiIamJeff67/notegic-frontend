export enum RoutinePhase {
  Plan = "Plan",
  Execution = "Execution",
  Recovery = "Recovery",
  Analysis = "Analysis",
}

export const AllRoutinePhases: RoutinePhase[] = Object.values(RoutinePhase);
