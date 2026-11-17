import { z } from "zod";

export const RequestHeaderSchema = z.object({
  userAgent: z.string().min(1).optional(),
  csrfToken: z.string().optional(),
});

export type RequestHeader = z.infer<typeof RequestHeaderSchema>;
