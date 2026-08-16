import {
  NotegicRequestSchema,
  NotegicResponseSchema,
} from "@shared/api/interfaces/context.interface";
import { AllAccessControlPermissions } from "@shared/api/interfaces/enums";
import { z } from "zod";

export const VisualizeRequestHeaderSchema = z
  .object({
    userAgent: z.string().min(1).optional(),
    csrfToken: z.string().optional(),
  })
  .optional();

export const VisualizePermissionParamSchema = z.object({
  permission: z.enum(AllAccessControlPermissions),
});

export const VisualizeTimeBucketParamSchema =
  VisualizePermissionParamSchema.extend({
    timeHourUnit: z.coerce.number().int().min(1).max(24),
    queryRangeStartedAt: z.coerce.date(),
    queryRangeEndedAt: z.coerce.date(),
  })
    .refine(
      param => param.queryRangeEndedAt > param.queryRangeStartedAt,
      "queryRangeEndedAt must be after queryRangeStartedAt"
    )
    .refine(
      param =>
        param.queryRangeEndedAt.getTime() -
          param.queryRangeStartedAt.getTime() <=
        360 * 24 * 60 * 60 * 1000,
      "visualize query range cannot exceed 360 days"
    );

export const TwoDimensionalDatumSchema = z.object({
  id: z.string(),
  x: z.string(),
  value: z.number().int(),
  meta: z.json().nullable().optional(),
});

export const TwoDimensionalDataSchema = z.object({
  data: z.array(TwoDimensionalDatumSchema),
});

export const VisualizePermissionRequestSchema = NotegicRequestSchema.extend({
  header: VisualizeRequestHeaderSchema,
  param: VisualizePermissionParamSchema,
});

export const VisualizeTimeBucketRequestSchema = NotegicRequestSchema.extend({
  header: VisualizeRequestHeaderSchema,
  param: VisualizeTimeBucketParamSchema,
});

export const VisualizeResponseSchema = NotegicResponseSchema.extend({
  data: TwoDimensionalDataSchema,
});

export type TwoDimensionalDatum = z.infer<typeof TwoDimensionalDatumSchema>;
export type TwoDimensionalData = z.infer<typeof TwoDimensionalDataSchema>;
