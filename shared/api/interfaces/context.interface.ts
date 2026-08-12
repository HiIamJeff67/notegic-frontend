import { NotezyException, NotezyExceptionSchema } from "@shared/api/exceptions";
import { z } from "zod";

export const NotezyRequestSchema = z.object({
  header: z.object({}).optional(),
  // contextFields: z.object({}).optional(), // this field is only exist in the backend
  body: z.object({}).optional(),
  param: z.object({}).optional(),
  affected: z.object({}).optional(), // this field is only exist in the frontend(for cache strategy)
});

export type NotezyRequest = z.infer<typeof NotezyRequestSchema>;

export const NotezyResponseSchema = z.object({
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
  exception: NotezyExceptionSchema.nullable(),
});

export type NotezyResponse = z.infer<typeof NotezyResponseSchema>;

export const duplicateResponse = <T>(
  response: NotezyResponse,
  success?: boolean,
  data?: T,
  newCSRFToken?: string,
  exception?: NotezyException | null
): NotezyResponse => {
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
