import { NotegicException, NotegicExceptionSchema } from "@shared/api/exceptions";
import { z } from "zod";

export const NotegicRequestSchema = z.object({
  header: z.object({}).optional(),
  // contextFields: z.object({}).optional(), // this field is only exist in the backend
  body: z.object({}).optional(),
  param: z.object({}).optional(),
  affected: z.object({}).optional(), // this field is only exist in the frontend(for cache strategy)
});

export type NotegicRequest = z.infer<typeof NotegicRequestSchema>;

export const NotegicResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().nullable(),
  refreshableTokens: z
    .object({
      newCSRFToken: z.string().optional(),
    })
    .optional(),
  embedded: z
    .object({
      publicId: z.string().optional(),
    })
    .optional(),
  exception: NotegicExceptionSchema.nullable(),
});

export type NotegicResponse = z.infer<typeof NotegicResponseSchema>;

export const duplicateResponse = <T>(
  response: NotegicResponse,
  success?: boolean,
  data?: T,
  newCSRFToken?: string,
  exception?: NotegicException | null
): NotegicResponse => {
  return {
    ...response,
    ...(success !== undefined && { success: success }),
    ...(data !== undefined && { data: data }),
    ...(newCSRFToken !== undefined && {
      refreshableTokens: {
        ...(response.refreshableTokens ?? {}),
        newCSRFToken,
      },
    }),
    ...(exception !== undefined && { exception: exception }),
  };
};
