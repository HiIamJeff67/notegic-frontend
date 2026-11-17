import { RequestHeaderSchema } from "@shared/api/interfaces/types/requestHeader.type";
import { UserQuotaSchema } from "@shared/api/interfaces/types/userQuota.type";
import { z } from "zod";
import {
  NotegicRequestSchema,
  NotegicResponseSchema,
} from "./context.interface";

/* ============================== GetMyQuota ============================== */

export const GetMyQuotaRequestSchema = NotegicRequestSchema.extend({
  header: RequestHeaderSchema.optional(),
});

export type GetMyQuotaRequest = z.infer<typeof GetMyQuotaRequestSchema>;

export const GetMyQuotaResponseSchema = NotegicResponseSchema.extend({
  data: UserQuotaSchema,
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type GetMyQuotaResponse = z.infer<typeof GetMyQuotaResponseSchema>;
