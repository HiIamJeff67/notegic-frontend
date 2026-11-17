import {
  AllRoutineTaskPurposes,
  RoutineTaskPurpose,
} from "@shared/api/interfaces/enums";
import { z } from "zod";

export const RoutineTaskPayloadSizeSchema = z.any().refine(value => {
  try {
    return (
      new TextEncoder().encode(JSON.stringify(value ?? {})).length <= 16_777_216
    );
  } catch {
    return false;
  }
}, "workspace.validation.payloadTooLarge");

const routineTaskObjectReferenceSchema = z.union([
  z.uuidv4(),
  z.string().regex(/^f_[0-9a-f]{32}$/i),
]);
const routineTaskFakeIdSchema = z.string().regex(/^f_[0-9a-f]{32}$/i);

export const RoutineTaskPayloadSchema = z
  .object({
    purpose: z.enum(AllRoutineTaskPurposes, {
      error: "validation.payloadPurpose",
    }),
    payload: RoutineTaskPayloadSizeSchema,
  })
  .superRefine(({ purpose, payload: rawPayload }, ctx) => {
    const uuidSchema = z.uuidv4();
    const payload =
      rawPayload !== null && typeof rawPayload === "object"
        ? (rawPayload as Record<string, any>)
        : {};
    const addPayloadIssue = (path: (string | number)[], message: string) =>
      ctx.addIssue({ code: "custom", path: ["payload", ...path], message });

    if (
      rawPayload === null ||
      typeof rawPayload !== "object" ||
      Array.isArray(rawPayload)
    ) {
      addPayloadIssue([], "validation.payloadObject");
      return;
    }
    if (payload.schemaVersion !== undefined && payload.schemaVersion !== 1) {
      addPayloadIssue(["schemaVersion"], "validation.payloadVersion");
    }
    if (payload.purpose !== undefined && payload.purpose !== purpose) {
      addPayloadIssue(["purpose"], "validation.payloadPurpose");
    }

    if (payload.pattern !== undefined) {
      if (typeof payload.pattern !== "object" || payload.pattern === null) {
        addPayloadIssue(["pattern"], "validation.patternBinding");
      } else {
        for (const [key, binding] of Object.entries(payload.pattern)) {
          if (typeof binding !== "object" || binding === null) {
            addPayloadIssue(["pattern", key], "validation.patternBinding");
            continue;
          }
          const source = (binding as Record<string, unknown>).source;
          if (
            source !== "scheduledAt" &&
            source !== "recordId" &&
            source !== "shortRecordId" &&
            source !== "routineTaskId" &&
            source !== "blockText" &&
            source !== "blockCheckboxCount"
          ) {
            addPayloadIssue(
              ["pattern", key, "source"],
              "validation.patternSource"
            );
          }
          if (
            source === "blockText" &&
            !uuidSchema.safeParse((binding as Record<string, unknown>).blockId)
              .success
          ) {
            addPayloadIssue(["pattern", key, "blockId"], "validation.blockId");
          }
          if (
            source === "blockCheckboxCount" &&
            !uuidSchema.safeParse(
              (binding as Record<string, unknown>).blockPackId
            ).success
          ) {
            addPayloadIssue(
              ["pattern", key, "blockPackId"],
              "validation.blockPackId"
            );
          }
        }
      }
    }

    if (
      (purpose === RoutineTaskPurpose.GetSubShelf ||
        purpose === RoutineTaskPurpose.DeleteSubShelf ||
        purpose === RoutineTaskPurpose.UpdateSubShelf) &&
      !uuidSchema.safeParse(payload.subShelfId).success
    ) {
      addPayloadIssue(["subShelfId"], "validation.subShelfRequired");
    }
    if (
      purpose === RoutineTaskPurpose.CreateSubShelf &&
      (!routineTaskFakeIdSchema.safeParse(payload.fakeId).success ||
        !uuidSchema.safeParse(payload.rootShelfId).success ||
        (payload.prevSubShelfId !== undefined &&
          payload.prevSubShelfId !== null &&
          !routineTaskObjectReferenceSchema.safeParse(payload.prevSubShelfId)
            .success) ||
        typeof payload.name !== "string" ||
        payload.name.trim().length === 0)
    ) {
      addPayloadIssue([], "validation.rootShelfName");
    }
    if (
      purpose === RoutineTaskPurpose.CreateBlockPack &&
      (!routineTaskObjectReferenceSchema.safeParse(payload.targetSubShelfId)
        .success ||
        typeof payload.template?.name !== "string" ||
        payload.template.name.trim().length === 0 ||
        !Array.isArray(payload.template?.blocks) ||
        payload.template.blocks.length === 0)
    ) {
      addPayloadIssue([], "validation.templateRequired");
    }
    if (
      purpose === RoutineTaskPurpose.CreateBlockPack &&
      Array.isArray(payload.template?.blocks)
    ) {
      payload.template.blocks.forEach((block: unknown, index: number) => {
        const templateBlock =
          block !== null && typeof block === "object"
            ? (block as Record<string, unknown>)
            : {};
        if (
          typeof templateBlock.clientId !== "string" ||
          templateBlock.clientId.trim() === ""
        ) {
          addPayloadIssue(
            ["template", "blocks", index, "clientId"],
            "validation.templateContent"
          );
        }
        if (
          typeof templateBlock.arborizedEditableBlock !== "object" ||
          templateBlock.arborizedEditableBlock === null
        ) {
          addPayloadIssue(
            ["template", "blocks", index, "arborizedEditableBlock"],
            "validation.templateContent"
          );
        }
      });
    }
    if (
      (purpose === RoutineTaskPurpose.GetBlockPack ||
        purpose === RoutineTaskPurpose.DeleteBlockPack ||
        purpose === RoutineTaskPurpose.UpdateBlockPack) &&
      !uuidSchema.safeParse(payload.blockPackId).success
    ) {
      addPayloadIssue(["blockPackId"], "validation.blockPackId");
    }
    if (
      purpose === RoutineTaskPurpose.UpdateBlockPack &&
      (!Array.isArray(payload.blocks) ||
        payload.blocks.length === 0 ||
        payload.blocks.length > 1000)
    ) {
      addPayloadIssue(["blocks"], "validation.blockCount");
    }
    if (
      purpose === RoutineTaskPurpose.UpdateBlockPack &&
      Array.isArray(payload.blocks)
    ) {
      payload.blocks.forEach((block: unknown, index: number) => {
        const updatedBlock =
          block !== null && typeof block === "object"
            ? (block as Record<string, unknown>)
            : {};
        if (!uuidSchema.safeParse(updatedBlock.blockId).success) {
          addPayloadIssue(["blocks", index, "blockId"], "validation.blockId");
        }
        if (
          typeof updatedBlock.arborizedEditableBlock !== "object" ||
          updatedBlock.arborizedEditableBlock === null
        ) {
          addPayloadIssue(
            ["blocks", index, "arborizedEditableBlock"],
            "validation.templateContent"
          );
        }
      });
    }
    if (
      (purpose === RoutineTaskPurpose.GetRoutine ||
        purpose === RoutineTaskPurpose.DeleteRoutine ||
        purpose === RoutineTaskPurpose.UpdateRoutine) &&
      !uuidSchema.safeParse(payload.routineId).success
    ) {
      addPayloadIssue(["routineId"], "validation.routineRequired");
    }
    if (
      purpose === RoutineTaskPurpose.CreateRoutine &&
      (!uuidSchema.safeParse(payload.stationId).success ||
        typeof payload.title !== "string" ||
        payload.title.trim().length === 0)
    ) {
      addPayloadIssue([], "validation.stationTitle");
    }
    if (
      (purpose === RoutineTaskPurpose.GetMaterial ||
        purpose === RoutineTaskPurpose.DeleteMaterial ||
        purpose === RoutineTaskPurpose.UpdateMaterial) &&
      !uuidSchema.safeParse(payload.materialId).success
    ) {
      addPayloadIssue(["materialId"], "validation.materialRequired");
    }
    if (
      purpose === RoutineTaskPurpose.CreateMaterial &&
      (!routineTaskObjectReferenceSchema.safeParse(payload.parentSubShelfId)
        .success ||
        typeof payload.name !== "string" ||
        payload.name.trim().length === 0 ||
        typeof payload.contentKey !== "string" ||
        payload.contentKey.trim().length === 0)
    ) {
      addPayloadIssue([], "validation.materialContent");
    }
  });
