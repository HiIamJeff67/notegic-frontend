import {
  CreateRoutineByStationIdRequestSchema,
  GetMyRoutineByIdResponseSchema,
  GetMyRoutinesByStationIdResponseSchema,
  GetMyRoutinesByTimeRangeResponseSchema,
  RestoreMyRoutineByIdResponseSchema,
  RestoreMyRoutinesByIdsResponseSchema,
} from "./routine.interface";

const body = {
  stationId: "00000000-0000-4000-8000-000000000001",
  title: "Morning routine",
  description: "",
};

test("routine execution timeout accepts 1–60 minutes only", () => {
  expect(
    CreateRoutineByStationIdRequestSchema.safeParse({
      body: { ...body, timeoutSeconds: 60 },
    }).success
  ).toBe(true);
  expect(
    CreateRoutineByStationIdRequestSchema.safeParse({
      body: { ...body, timeoutSeconds: 3600 },
    }).success
  ).toBe(true);
  expect(
    CreateRoutineByStationIdRequestSchema.safeParse({
      body: { ...body, timeoutSeconds: 59 },
    }).success
  ).toBe(false);
  expect(
    CreateRoutineByStationIdRequestSchema.safeParse({
      body: { ...body, timeoutSeconds: 3601 },
    }).success
  ).toBe(false);
});

test("response timeout validation stays separate from editable input hints", () => {
  for (const schema of [
    GetMyRoutineByIdResponseSchema.shape.data.shape.timeoutSeconds,
    GetMyRoutinesByStationIdResponseSchema.shape.data.element.shape
      .timeoutSeconds,
    GetMyRoutinesByTimeRangeResponseSchema.shape.data.element.shape
      .timeoutSeconds,
    RestoreMyRoutineByIdResponseSchema.shape.data.shape.timeoutSeconds,
    RestoreMyRoutinesByIdsResponseSchema.shape.data.element.shape
      .timeoutSeconds,
  ]) {
    const result = schema.safeParse(0);
    if (result.success) throw new Error("Expected an invalid response timeout");
    expect(result.error.issues[0].message).not.toMatch(/^validation\./);
  }
});
