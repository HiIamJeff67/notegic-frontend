import { UserPlan } from "@shared/api/interfaces/enums";
import { PlanLimitations } from "./planLimitation.type";

test("execution-minute limits match every plan", () => {
  expect(
    [
      UserPlan.Free,
      UserPlan.Pro,
      UserPlan.Premium,
      UserPlan.Ultimate,
      UserPlan.Enterprise,
    ].map(plan => PlanLimitations[plan].maxRoutineTaskExecutionMinutes)
  ).toEqual([100, 300, 500, 1000, 2000]);
});
