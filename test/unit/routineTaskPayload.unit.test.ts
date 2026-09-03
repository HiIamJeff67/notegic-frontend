import { RoutineTaskPurpose } from "@shared/api/interfaces/enums";
import { RoutineTaskPayloadSchema } from "@shared/api/interfaces/routineTaskPayload.interface";

const block = {
  id: "73b3a848-bca0-44e4-8fb4-cf6cc6ca6aee",
  type: "paragraph",
  props: {},
  content: [],
  children: [],
};

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
