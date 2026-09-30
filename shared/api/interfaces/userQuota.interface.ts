import { UserQuotaSchema } from "@shared/types/userQuota.type";
import { z } from "zod";
import {
  NotegicRequestSchema,
  NotegicResponseSchema,
} from "./context.interface";

export const GetMyQuotaRequestSchema = NotegicRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
});

export type GetMyQuotaRequest = z.infer<typeof GetMyQuotaRequestSchema>;

export const GetMyQuotaResponseSchema = NotegicResponseSchema.extend({
  data: UserQuotaSchema,
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type GetMyQuotaResponse = z.infer<typeof GetMyQuotaResponseSchema>;
