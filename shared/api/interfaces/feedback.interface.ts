import {
  NotegicRequestSchema,
  NotegicResponseSchema,
} from "@shared/api/interfaces/context.interface";
import { z } from "zod";

export const FeedbackReportTypeSchema = z.enum([
  "bug",
  "feature_request",
  "other",
]);
export type FeedbackReportType = z.infer<typeof FeedbackReportTypeSchema>;

export const FeedbackBrowserContextSchema = z.object({
  locale: z.string().max(32),
  timeZone: z.string().max(64),
  platform: z.string().max(128),
  viewportWidth: z.number().int().min(0).max(10000),
  viewportHeight: z.number().int().min(0).max(10000),
});

export const SubmitFeedbackReportRequestSchema = NotegicRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1).optional(),
    csrfToken: z.string().optional(),
    idempotencyKey: z.uuid(),
  }),
  body: z.object({
    type: FeedbackReportTypeSchema,
    title: z.string().trim().min(1).max(200),
    description: z.string().trim().min(1).max(10000),
    route: z
      .string()
      .regex(/^\/[^?#\r\n]*$/)
      .max(255),
    browserContext: FeedbackBrowserContextSchema,
  }),
});
export type SubmitFeedbackReportRequest = z.infer<
  typeof SubmitFeedbackReportRequestSchema
>;

export const SubmitFeedbackReportResponseSchema = NotegicResponseSchema.extend({
  data: z.object({
    reportId: z.uuid(),
    status: z.string().min(1),
    createdAt: z.coerce.date(),
    replay: z.boolean(),
  }),
});
export type SubmitFeedbackReportResponse = z.infer<
  typeof SubmitFeedbackReportResponseSchema
>;
