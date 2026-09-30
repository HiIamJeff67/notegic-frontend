import { GetMyAccountResponseSchema } from "./userAccount.interface";
import { GetMyQuotaResponseSchema } from "./userQuota.interface";
import { UserPlan } from "./enums";
import { PlanLimitations } from "@shared/constants";

describe("account and quota response contracts", () => {
  test("decodes account fields separately from quota counters", () => {
    const account = GetMyAccountResponseSchema.parse({
      success: true,
      data: {
        countryCode: null,
        phoneNumber: null,
        googleCredential: null,
        discordCredential: null,
        updatedAt: "2026-09-27T00:00:00.000Z",
      },
      embedded: { publicId: "00000000-0000-4000-8000-000000000001" },
      exception: null,
    });
    const quota = GetMyQuotaResponseSchema.parse({
      success: true,
      data: {
        rootShelfCount: 1,
        blockPackCount: 2,
        blockCount: 3,
        materialCount: 4,
        workflowCount: 5,
        additionalItemCount: 6,
        stationCount: 7,
        routineCount: 8,
        routineTagCount: 9,
        routineTaskExecutionMinutesUsed: 10,
        cycleStartedAt: "2026-09-01T00:00:00.000Z",
        nextResetAt: "2026-10-01T00:00:00.000Z",
        updatedAt: "2026-09-27T00:00:00.000Z",
      },
      embedded: { publicId: "00000000-0000-4000-8000-000000000001" },
      exception: null,
    });

    expect(account.data).not.toHaveProperty("rootShelfCount");
    expect(quota.data.routineTaskExecutionMinutesUsed).toBe(10);
  });
});

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
