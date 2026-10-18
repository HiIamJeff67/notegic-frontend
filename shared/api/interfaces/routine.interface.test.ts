import {
  GetMyRoutineByIdResponseSchema,
  RoutineAdmissionStates,
} from "./routine.interface";

const routine = {
  id: "09311e30-6adc-4979-84e1-2912dd200fa4",
  stationId: "73b3a848-bca0-44e4-8fb4-cf6cc6ca6aee",
  title: "Daily notes",
  description: "",
  timeoutSeconds: 300,
  phase: null,
  isActive: false,
  definitionVersion: 1,
  isPinned: false,
  scheduledStartAt: "2026-10-18T01:00:00Z",
  scheduledEndAt: "2026-10-18T02:00:00Z",
  period: null,
  timezone: "UTC",
  deletedAt: null,
  updatedAt: "2026-10-18T00:00:00Z",
  createdAt: "2026-10-18T00:00:00Z",
  tagIds: [],
  taskIds: [],
  itemIds: [],
};

describe("Routine response admission reasons", () => {
  const schema = GetMyRoutineByIdResponseSchema.shape.data;

  test("accepts every supported reason without changing activation", () => {
    for (const admissionState of RoutineAdmissionStates) {
      const parsed = schema.parse({ ...routine, admissionState });
      expect(parsed.admissionState).toBe(admissionState);
      expect(parsed.isActive).toBe(false);
    }
  });

  test("falls back to Unknown for an older or newer backend response", () => {
    expect(schema.parse(routine).admissionState).toBe("Unknown");
    expect(
      schema.parse({ ...routine, admissionState: "FutureReason" })
        .admissionState
    ).toBe("Unknown");
  });
});
