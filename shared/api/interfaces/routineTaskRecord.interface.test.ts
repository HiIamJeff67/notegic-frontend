import {
  ExecutionItemResultSchema,
  ExecutionResultSchema,
} from "@shared/api/interfaces/routineTaskRecord.interface";

describe("RoutineTaskRecord execution result contract", () => {
  test("accepts empty and partial execution snapshots", () => {
    expect(ExecutionResultSchema.safeParse({}).success).toBe(true);
    expect(
      ExecutionResultSchema.safeParse({
        updated: 1,
        skipped: 2,
        failed: 1,
        items: [
          {
            itemId: "block-1",
            status: "skipped",
            reason: "Block does not exist",
          },
        ],
        at: "2026-09-02T00:00:00.000Z",
        futureField: { preserved: true },
      }).success
    ).toBe(true);
  });

  test("rejects invalid execution item statuses and identifiers", () => {
    expect(
      ExecutionItemResultSchema.safeParse({
        itemId: "block-1",
        status: "pending",
      }).success
    ).toBe(false);
    expect(
      ExecutionItemResultSchema.safeParse({
        itemId: "",
        status: "updated",
      }).success
    ).toBe(false);
  });
});
