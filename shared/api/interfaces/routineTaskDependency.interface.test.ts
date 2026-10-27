import {
  UpdateRoutineTaskGraphByRoutineIdRequestSchema,
  UpdateRoutineTaskGraphByRoutineIdResponseSchema,
} from "./routineTaskDependency.interface";

const routineId = "12345678-1234-4234-8234-123456789abc";
const taskId = "22345678-1234-4234-8234-123456789abc";
const request = {
  header: { userAgent: "Mozilla/5.0", csrfToken: "fixture-csrf" },
  param: { routineId },
  body: {
    expectedDefinitionVersion: 7,
    tasks: {
      creates: [
        {
          id: taskId,
          routineId,
          kind: "Start",
          title: "Start",
          payload: { schemaVersion: 1, isActive: true },
        },
      ],
      updates: [],
      deletes: [],
    },
    dependencies: { creates: [], updates: [], deletes: [] },
  },
};

test("atomic graph contract keeps one version and stable node identities", () => {
  const parsed = UpdateRoutineTaskGraphByRoutineIdRequestSchema.parse(request);
  expect(parsed.body.expectedDefinitionVersion).toBe(7);
  expect(parsed.body.tasks.creates[0]).toMatchObject({
    id: taskId,
    routineId,
    kind: "Start",
    x: 0,
    y: 0,
  });
});

test("atomic graph contract rejects missing identities, invalid versions and positions", () => {
  const missingId = structuredClone(request);
  delete (missingId.body.tasks.creates[0] as { id?: string }).id;
  const missingVersion = structuredClone(request);
  missingVersion.body.expectedDefinitionVersion = 0;
  const invalidPosition = structuredClone(request);
  Object.assign(invalidPosition.body.tasks.creates[0], { x: Infinity });
  for (const invalid of [missingId, missingVersion, invalidPosition])
    expect(
      UpdateRoutineTaskGraphByRoutineIdRequestSchema.safeParse(invalid).success
    ).toBe(false);
});

test.each([
  ["tasks", "creates"],
  ["tasks", "updates"],
  ["tasks", "deletes"],
  ["dependencies", "creates"],
  ["dependencies", "updates"],
  ["dependencies", "deletes"],
] as const)("atomic graph contract rejects oversized %s.%s before validating its elements", (group, operation) => {
  const oversized = structuredClone(request);
  Object.assign(oversized.body[group], {
    [operation]: Array(1025).fill(null),
  });
  const result =
    UpdateRoutineTaskGraphByRoutineIdRequestSchema.safeParse(oversized);
  expect(result.success).toBe(false);
  expect(result.error?.issues).toEqual([
    expect.objectContaining({
      code: "too_big",
      maximum: 1024,
      path: ["body", group, operation],
    }),
  ]);
});

test("canonical graph response restores dates for local SQLite reconciliation", () => {
  const now = "2026-10-25T00:00:00.000Z";
  const response = UpdateRoutineTaskGraphByRoutineIdResponseSchema.parse({
    success: true,
    exception: null,
    embedded: { publicId: "fixture" },
    data: {
      definitionVersion: 8,
      updatedAt: now,
      tasks: [
        {
          ...request.body.tasks.creates[0],
          x: 0,
          y: 0,
          priority: 0,
          maxAttempts: 1,
          previousRoutineTaskIds: [],
          updatedAt: now,
          createdAt: now,
        },
      ],
      dependencies: [],
    },
  });
  expect(response.data.updatedAt).toBeInstanceOf(Date);
  expect(response.data.tasks[0].createdAt).toBeInstanceOf(Date);
  expect(response.data.tasks[0].id).toBe(taskId);
});
