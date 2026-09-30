import { CreateRoutineByStationIdRequestSchema } from "./routine.interface";

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
