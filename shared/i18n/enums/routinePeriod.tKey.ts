import { RoutinePeriod } from "@shared/api/interfaces/enums";

export const routinePeriodTKeys = {
  [RoutinePeriod.Daily]: "workspace.period.daily",
  [RoutinePeriod.Weekly]: "workspace.period.weekly",
  [RoutinePeriod.Monthly]: "workspace.period.monthly",
  none: "workspace.period.none",
} as const satisfies Record<RoutinePeriod | "none", string>;
