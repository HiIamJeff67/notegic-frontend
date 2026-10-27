import { UserStatus } from "@shared/api/interfaces/enums";
import { UserDataSchema, UserSchema } from "@shared/types/user.type";
import { z } from "zod";
import {
  NotegicRequestSchema,
  NotegicResponseSchema,
} from "./context.interface";

/* ============================== GetUserData ============================== */

export const GetUserDataRequestSchema = NotegicRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
});

export type GetUserDataRequest = z.infer<typeof GetUserDataRequestSchema>;

export const GetUserDataResponseSchema = NotegicResponseSchema.extend({
  data: UserDataSchema,
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type GetUserDataResponse = z.infer<typeof GetUserDataResponseSchema>;

/* ============================== GetMe ============================== */

export const GetMeRequestSchema = NotegicRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
});

export type GetMeRequest = z.infer<typeof GetMeRequestSchema>;

export const GetMeResponseSchema = NotegicResponseSchema.extend({
  data: UserSchema,
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type GetMeResponse = z.infer<typeof GetMeResponseSchema>;

export const DisplayNameSchema = z
  .string({ error: "validation.displayNameLength" })
  .min(6, { error: "validation.displayNameLength" })
  .max(32, { error: "validation.displayNameLength" })
  .regex(/^(?=.*\p{L})(?=.*\p{Nd})[\p{L}\p{Nd}]+$/u, {
    error: "validation.displayNameFormat",
  });

/* ============================== UpdateMe ============================== */

export const UpdateMeRequestSchema = NotegicRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  body: z.object({
    values: z
      .object({
        displayName: DisplayNameSchema,
        status: z.enum(UserStatus),
      })
      .partial(),
    setNull: z.record(z.string(), z.boolean()).optional(),
  }),
});

export type UpdateMeRequest = z.infer<typeof UpdateMeRequestSchema>;

export const UpdateMeResponseSchema = NotegicResponseSchema.extend({
  data: z.object({
    updatedAt: z.coerce.date(),
  }),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type UpdateMeResponse = z.infer<typeof UpdateMeResponseSchema>;
