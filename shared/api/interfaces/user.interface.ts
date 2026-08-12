import { UserStatus } from "@shared/api/interfaces/enums";
import { UserDataSchema, UserSchema } from "@shared/types/user.type";
import { z } from "zod";
import { NotezyRequestSchema, NotezyResponseSchema } from "./context.interface";

/* ============================== GetUserData ============================== */

export const GetUserDataRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
});

export type GetUserDataRequest = z.infer<typeof GetUserDataRequestSchema>;

export const GetUserDataResponseSchema = NotezyResponseSchema.extend({
  data: UserDataSchema,
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type GetUserDataResponse = z.infer<typeof GetUserDataResponseSchema>;

/* ============================== GetMe ============================== */

export const GetMeRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
});

export type GetMeRequest = z.infer<typeof GetMeRequestSchema>;

export const GetMeResponseSchema = NotezyResponseSchema.extend({
  data: UserSchema,
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type GetMeResponse = z.infer<typeof GetMeResponseSchema>;

/* ============================== UpdateMe ============================== */

export const UpdateMeRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  body: z.object({
    values: z
      .object({
        displayName: z
          .string()
          .min(6)
          .max(32)
          .regex(/^(?=.*[a-zA-Z])(?=.*\d).+$/),
        status: z.enum(UserStatus),
      })
      .partial(),
    setNull: z.record(z.string(), z.boolean()).optional(),
  }),
});

export type UpdateMeRequest = z.infer<typeof UpdateMeRequestSchema>;

export const UpdateMeResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    updatedAt: z.coerce.date(),
  }),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type UpdateMeResponse = z.infer<typeof UpdateMeResponseSchema>;
