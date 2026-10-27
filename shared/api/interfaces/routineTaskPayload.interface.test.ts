import { RoutineTaskPurpose } from "@shared/api/interfaces/enums";
import { RoutineTaskPayloadSchema } from "@shared/api/interfaces/routineTaskPayload.interface";
import {
  parseRoutineTaskDefinition,
  UpdateMyRoutineTaskByIdRequestSchema,
} from "./routineTask.interface";

const block = {
  id: "73b3a848-bca0-44e4-8fb4-cf6cc6ca6aee",
  type: "paragraph",
  props: {},
  content: [],
  children: [],
};

test("legacy task updates retain the outer purpose without rewriting their payload", () => {
  const body = {
    routineTaskId: block.id,
    values: {
      purpose: RoutineTaskPurpose.GetSubShelf,
      payload: { subShelfId: block.id },
    },
  };
  expect(UpdateMyRoutineTaskByIdRequestSchema.parse({ body }).body).toEqual(
    body
  );
  const conflict = UpdateMyRoutineTaskByIdRequestSchema.safeParse({
    body: {
      ...body,
      values: {
        ...body.values,
        payload: {
          subShelfId: block.id,
          purpose: RoutineTaskPurpose.DeleteSubShelf,
        },
      },
    },
  });
  if (conflict.success) throw new Error("Expected conflicting purposes");
  expect(conflict.error.issues[0].message).toBe("validation.payloadPurpose");
});

describe("RoutineTaskPayloadSchema", () => {
  test("matches the four operations across the four supported objects", () => {
    expect(Object.values(RoutineTaskPurpose)).toEqual([
      "GetSubShelf",
      "CreateSubShelf",
      "UpdateSubShelf",
      "DeleteSubShelf",
      "GetBlockPack",
      "CreateBlockPack",
      "UpdateBlockPack",
      "DeleteBlockPack",
      "GetRoutine",
      "CreateRoutine",
      "UpdateRoutine",
      "DeleteRoutine",
      "GetMaterial",
      "CreateMaterial",
      "UpdateMaterial",
      "DeleteMaterial",
    ]);
  });

  test("requires wrapped CreateBlockPack template blocks", () => {
    const payload = {
      targetSubShelfId: "09311e30-6adc-4979-84e1-2912dd200fa4",
      template: {
        name: "Routine block pack",
        blocks: [
          {
            clientId: block.id,
            prevClientId: null,
            arborizedEditableBlock: block,
          },
        ],
      },
    };

    expect(
      RoutineTaskPayloadSchema.safeParse({
        purpose: RoutineTaskPurpose.CreateBlockPack,
        payload,
      }).success
    ).toBe(true);
    expect(
      RoutineTaskPayloadSchema.safeParse({
        purpose: RoutineTaskPurpose.CreateBlockPack,
        payload: {
          ...payload,
          template: { ...payload.template, blocks: [block] },
        },
      }).success
    ).toBe(false);
  });

  test("accepts fake references for deterministic object creation", () => {
    const fakeSubShelfId = "f_0123456789abcdef0123456789abcdef";
    const template = {
      name: "Routine block pack",
      blocks: [
        {
          clientId: block.id,
          prevClientId: null,
          arborizedEditableBlock: block,
        },
      ],
    };

    expect(
      RoutineTaskPayloadSchema.safeParse({
        purpose: RoutineTaskPurpose.CreateSubShelf,
        payload: {
          fakeId: fakeSubShelfId,
          rootShelfId: "09311e30-6adc-4979-84e1-2912dd200fa4",
          prevSubShelfId: fakeSubShelfId,
          name: "Nested shelf",
        },
      }).success
    ).toBe(true);
    expect(
      RoutineTaskPayloadSchema.safeParse({
        purpose: RoutineTaskPurpose.CreateBlockPack,
        payload: {
          targetSubShelfId: fakeSubShelfId,
          template,
        },
      }).success
    ).toBe(true);
    expect(
      RoutineTaskPayloadSchema.safeParse({
        purpose: RoutineTaskPurpose.CreateMaterial,
        payload: {
          parentSubShelfId: fakeSubShelfId,
          name: "Routine material",
          contentKey: "routine-material",
        },
      }).success
    ).toBe(true);
  });

  test("rejects malformed deterministic object references", () => {
    expect(
      RoutineTaskPayloadSchema.safeParse({
        purpose: RoutineTaskPurpose.CreateSubShelf,
        payload: {
          fakeId: "fake-shelf",
          rootShelfId: "09311e30-6adc-4979-84e1-2912dd200fa4",
          name: "Invalid shelf",
        },
      }).success
    ).toBe(false);
    expect(
      RoutineTaskPayloadSchema.safeParse({
        purpose: RoutineTaskPurpose.CreateMaterial,
        payload: {
          parentSubShelfId: "fake-shelf",
          name: "Invalid material",
          contentKey: "invalid-material",
        },
      }).success
    ).toBe(false);
  });

  test("validates UpdateBlockPack items independently", () => {
    const blockId = "73b3a848-bca0-44e4-8fb4-cf6cc6ca6aee";
    const payload = {
      blockPackId: "09311e30-6adc-4979-84e1-2912dd200fa4",
      blocks: [
        {
          blockId,
          arborizedEditableBlock: block,
        },
      ],
    };

    expect(
      RoutineTaskPayloadSchema.safeParse({
        purpose: RoutineTaskPurpose.UpdateBlockPack,
        payload,
      }).success
    ).toBe(true);
    expect(
      RoutineTaskPayloadSchema.safeParse({
        purpose: RoutineTaskPurpose.UpdateBlockPack,
        payload: {
          ...payload,
          blocks: [{ ...payload.blocks[0], blockId: "invalid" }],
        },
      }).success
    ).toBe(false);
  });

  test("requires the correct identifier for get and delete operations", () => {
    expect(
      RoutineTaskPayloadSchema.safeParse({
        purpose: RoutineTaskPurpose.GetMaterial,
        payload: { materialId: block.id },
      }).success
    ).toBe(true);
    expect(
      RoutineTaskPayloadSchema.safeParse({
        purpose: RoutineTaskPurpose.DeleteMaterial,
        payload: { blockPackId: block.id },
      }).success
    ).toBe(false);
  });
});

describe("canonical Action payload metadata", () => {
  const payload = {
    schemaVersion: 1,
    purpose: RoutineTaskPurpose.GetRoutine,
    routineId: "09311e30-6adc-4979-84e1-2912dd200fa4",
  };

  test("accepts aligned metadata and rejects conflicting purpose or version", () => {
    expect(
      RoutineTaskPayloadSchema.safeParse({
        purpose: RoutineTaskPurpose.GetRoutine,
        payload,
      }).success
    ).toBe(true);
    expect(
      RoutineTaskPayloadSchema.safeParse({
        purpose: RoutineTaskPurpose.DeleteRoutine,
        payload,
      }).success
    ).toBe(false);
    expect(
      RoutineTaskPayloadSchema.safeParse({
        purpose: RoutineTaskPurpose.GetRoutine,
        payload: { ...payload, schemaVersion: 2 },
      }).success
    ).toBe(false);
  });
});

describe("canonical local node projection", () => {
  const input = {
    id: "22345678-1234-4234-8234-123456789abc",
    routineId: "12345678-1234-4234-8234-123456789abc",
    title: "Read routine",
    payload: {
      schemaVersion: 1,
      purpose: RoutineTaskPurpose.GetRoutine,
      routineId: "12345678-1234-4234-8234-123456789abc",
    },
  };
  it("keeps the discriminator only in canonical payload", () => {
    const definition = parseRoutineTaskDefinition(input);
    expect(definition).not.toHaveProperty("purpose");
    expect(definition.payload.purpose).toBe(RoutineTaskPurpose.GetRoutine);
  });
  it("parses legacy input without losing operation fields", () => {
    const definition = parseRoutineTaskDefinition({
      ...input,
      purpose: RoutineTaskPurpose.GetRoutine,
      payload: { routineId: input.routineId },
    });
    expect(definition.payload).toEqual(input.payload);
  });
  it("keeps Start purpose empty and rejects conflicting or unsupported metadata", () => {
    expect(
      parseRoutineTaskDefinition({
        ...input,
        kind: "Start",
        payload: { isActive: false },
      }).payload
    ).not.toHaveProperty("purpose");
    expect(() =>
      parseRoutineTaskDefinition({
        ...input,
        purpose: RoutineTaskPurpose.DeleteRoutine,
      })
    ).toThrow();
    expect(() =>
      parseRoutineTaskDefinition({
        ...input,
        payload: { ...input.payload, schemaVersion: 2 },
      })
    ).toThrow();
    expect(() =>
      parseRoutineTaskDefinition({
        ...input,
        kind: "Start",
        payload: input.payload,
      })
    ).toThrow();
  });
});
