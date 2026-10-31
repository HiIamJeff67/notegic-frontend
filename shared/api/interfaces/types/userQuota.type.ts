import { z } from "zod";

export const UserQuotaSchema = z.object({
  rootShelfCount: z.number().int().min(0),
  blockPackCount: z.number().int().min(0),
  blockCount: z.number().int().min(0),
  materialCount: z.number().int().min(0),
  workflowCount: z.number().int().min(0),
  additionalItemCount: z.number().int().min(0),
  stationCount: z.number().int().min(0),
  routineCount: z.number().int().min(0),
  routineTagCount: z.number().int().min(0),
  routineTaskExecutionMinutesUsed: z.number().int().min(0),
  cycleStartedAt: z.coerce.date(),
  nextResetAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type UserQuota = z.infer<typeof UserQuotaSchema>;
