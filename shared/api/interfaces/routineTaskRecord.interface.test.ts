import { GetMyRoutineTaskRecordsByRoutineTaskIdResponseSchema } from "./routineTaskRecord.interface";

const response = {
  success: true,
  exception: null,
  embedded: { publicId: "fixture" },
  data: [
    {
      id: "12345678-1234-4234-8234-123456789abc",
      routineRecordId: "22345678-1234-4234-8234-123456789abc",
      routineTaskId: "32345678-1234-4234-8234-123456789abc",
      purpose: "CreateBlockPack",
      status: "Failed",
      errorCode: "NoQuota",
      errorReason: "The current plan's quota has been reached",
      attempts: 1,
      payloadSnapshot: {},
      resultSnapshot: {},
      actualStartedAt: "2026-10-25T00:00:00.000Z",
      actualEndedAt: "2026-10-25T00:00:01.000Z",
      createdAt: "2026-10-25T00:00:00.000Z",
      updatedAt: "2026-10-25T00:00:01.000Z",
    },
  ],
};

test.each([
  "NoQuota",
  "OutOfUsage",
  "DependencyUnavailable",
  "PlanLimitExceeded",
  "HandlerFailed",
  null,
])("accepts the backend task-record error code %s", errorCode => {
  const parsed = GetMyRoutineTaskRecordsByRoutineTaskIdResponseSchema.parse({
    ...response,
    data: [{ ...response.data[0], errorCode }],
  });

  expect(parsed.data[0].errorCode).toBe(errorCode);
  expect(parsed.data[0].actualEndedAt).toBeInstanceOf(Date);
});

test("rejects an unsupported task-record error code", () => {
  expect(
    GetMyRoutineTaskRecordsByRoutineTaskIdResponseSchema.safeParse({
      ...response,
      data: [{ ...response.data[0], errorCode: "UnsupportedError" }],
    }).success
  ).toBe(false);
});
