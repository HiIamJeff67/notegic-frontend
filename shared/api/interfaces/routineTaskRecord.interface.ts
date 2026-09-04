import {
  NotegicRequestSchema,
  NotegicResponseSchema,
} from "@shared/api/interfaces/context.interface";
import {
  AllAccessControlPermissions,
  AllRoutineTaskPurposes,
  AllRoutineTaskRecordErrorCodes,
  AllRoutineTaskRecordStatuses,
} from "@shared/api/interfaces/enums";
import { z } from "zod";
import {
  TwoDimensionalDataSchema,
  VisualizeRequestHeaderSchema,
} from "./visualize.interface";

const ExecutionItemStatuses = [
  "updated",
  "skipped",
  "failed",
  "retrieved",
] as const;

export const ExecutionItemResultSchema = z.object({
  itemId: z.string().min(1),
  status: z.enum(ExecutionItemStatuses),
  reason: z.string().optional(),
  data: z.json().optional(),
});

export type ExecutionItemResult = z.infer<typeof ExecutionItemResultSchema>;

export const ExecutionResultSchema = z
  .object({
    retrieved: z.number().int().min(0).optional(),
    updated: z.number().int().min(0).optional(),
    skipped: z.number().int().min(0).optional(),
    failed: z.number().int().min(0).optional(),
    items: z.array(ExecutionItemResultSchema).optional(),
    at: z.coerce.date().optional(),
  })
  .catchall(z.json());

export type ExecutionResult = z.infer<typeof ExecutionResultSchema>;

const RoutineTaskRecordSchema = z.object({
  id: z.uuidv4(),
  routineRecordId: z.uuidv4(),
  routineTaskId: z.uuidv4(),
  purpose: z.enum(AllRoutineTaskPurposes),
  status: z.enum(AllRoutineTaskRecordStatuses),
  errorCode: z.enum(AllRoutineTaskRecordErrorCodes).nullable(),
  errorReason: z.string().nullable(),
  costUnit: z.number().int().min(0),
  attempts: z.number().int().min(0),
  payloadSnapshot: z.any(),
  resultSnapshot: ExecutionResultSchema,
  actualStartedAt: z.coerce.date().nullable(),
  actualEndedAt: z.coerce.date().nullable(),
  updatedAt: z.coerce.date(),
  createdAt: z.coerce.date(),
});

export type RoutineTaskRecord = z.infer<typeof RoutineTaskRecordSchema>;

export const GetMyRoutineTaskRecordsByRoutineTaskIdRequestSchema =
  NotegicRequestSchema.extend({
    header: z
      .object({
        userAgent: z.string().min(1).optional(),
        csrfToken: z.string().optional(),
      })
      .optional(),
    param: z.object({
      routineTaskId: z.uuidv4(),
      limit: z.number().int().min(1).max(500).optional(),
    }),
  });

export type GetMyRoutineTaskRecordsByRoutineTaskIdRequest = z.infer<
  typeof GetMyRoutineTaskRecordsByRoutineTaskIdRequestSchema
>;

export const GetMyRoutineTaskRecordsByRoutineTaskIdResponseSchema =
  NotegicResponseSchema.extend({
    data: z.array(RoutineTaskRecordSchema),
    embedded: z.object({
      publicId: z.string(),
    }),
  });

export type GetMyRoutineTaskRecordsByRoutineTaskIdResponse = z.infer<
  typeof GetMyRoutineTaskRecordsByRoutineTaskIdResponseSchema
>;

const RoutineTaskRecordVisualizeParamSchema = z.object({
  permission: z.enum(AllAccessControlPermissions),
  routineTaskIds: z.array(z.uuidv4()).optional(),
});

const RoutineTaskRecordVisualizeTimeBucketParamSchema =
  RoutineTaskRecordVisualizeParamSchema.extend({
    timeHourUnit: z.coerce.number().int().min(1),
    queryRangeStartedAt: z.coerce.date(),
    queryRangeEndedAt: z.coerce.date(),
  }).refine(
    param => param.queryRangeEndedAt > param.queryRangeStartedAt,
    "queryRangeEndedAt must be after queryRangeStartedAt"
  );

export const VisualizeMyRoutineTaskRecordCountRequestSchema =
  NotegicRequestSchema.extend({
    header: VisualizeRequestHeaderSchema,
    param: RoutineTaskRecordVisualizeParamSchema,
  });

export const VisualizeMyRoutineTaskRecordTimeCountRequestSchema =
  NotegicRequestSchema.extend({
    header: VisualizeRequestHeaderSchema,
    param: RoutineTaskRecordVisualizeTimeBucketParamSchema,
  });

export const VisualizeMyRoutineTaskRecordCountResponseSchema =
  NotegicResponseSchema.extend({
    data: TwoDimensionalDataSchema,
  });
export const VisualizeMyRoutineTaskRecordStatusCountResponseSchema =
  VisualizeMyRoutineTaskRecordCountResponseSchema;
export const VisualizeMyRoutineTaskRecordPurposeCountResponseSchema =
  VisualizeMyRoutineTaskRecordCountResponseSchema;
export const VisualizeMyRoutineTaskRecordScheduledAtCountResponseSchema =
  VisualizeMyRoutineTaskRecordCountResponseSchema;
export const VisualizeMyRoutineTaskRecordActualStartedAtCountResponseSchema =
  VisualizeMyRoutineTaskRecordCountResponseSchema;
export const VisualizeMyRoutineTaskRecordActualEndedAtCountResponseSchema =
  VisualizeMyRoutineTaskRecordCountResponseSchema;

export type VisualizeMyRoutineTaskRecordStatusCountRequest = z.infer<
  typeof VisualizeMyRoutineTaskRecordCountRequestSchema
>;
export type VisualizeMyRoutineTaskRecordStatusCountResponse = z.infer<
  typeof VisualizeMyRoutineTaskRecordCountResponseSchema
>;
export type VisualizeMyRoutineTaskRecordPurposeCountRequest = z.infer<
  typeof VisualizeMyRoutineTaskRecordCountRequestSchema
>;
export type VisualizeMyRoutineTaskRecordPurposeCountResponse = z.infer<
  typeof VisualizeMyRoutineTaskRecordCountResponseSchema
>;
export type VisualizeMyRoutineTaskRecordScheduledAtCountRequest = z.infer<
  typeof VisualizeMyRoutineTaskRecordTimeCountRequestSchema
>;
export type VisualizeMyRoutineTaskRecordScheduledAtCountResponse = z.infer<
  typeof VisualizeMyRoutineTaskRecordCountResponseSchema
>;
export type VisualizeMyRoutineTaskRecordActualStartedAtCountRequest = z.infer<
  typeof VisualizeMyRoutineTaskRecordTimeCountRequestSchema
>;
export type VisualizeMyRoutineTaskRecordActualStartedAtCountResponse = z.infer<
  typeof VisualizeMyRoutineTaskRecordCountResponseSchema
>;
export type VisualizeMyRoutineTaskRecordActualEndedAtCountRequest = z.infer<
  typeof VisualizeMyRoutineTaskRecordTimeCountRequestSchema
>;
export type VisualizeMyRoutineTaskRecordActualEndedAtCountResponse = z.infer<
  typeof VisualizeMyRoutineTaskRecordCountResponseSchema
>;
