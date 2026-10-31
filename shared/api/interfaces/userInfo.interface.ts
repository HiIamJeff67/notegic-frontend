import { Country, UserGender } from "@shared/api/interfaces/enums";
import { UserInfoSchema } from "@shared/api/interfaces/types/user.type";
import { z } from "zod";
import {
  NotegicRequestSchema,
  NotegicResponseSchema,
} from "./context.interface";

/* ============================== GetMyInfo ============================== */

export const GetMyInfoRequestSchema = NotegicRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
});

export type GetMyInfoRequest = z.infer<typeof GetMyInfoRequestSchema>;

export const GetMyInfoResponseSchema = NotegicResponseSchema.extend({
  data: UserInfoSchema,
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type GetMyInfoResponse = z.infer<typeof GetMyInfoResponseSchema>;

/* ============================== UpdateMyInfo ============================== */

export const UpdateMyInfoRequestSchema = NotegicRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  body: z.object({
    values: z.object({
      header: z
        .string({ error: "validation.headline" })
        .max(64, { error: "validation.headline" })
        .nullable()
        .optional(),
      introduction: z
        .string({ error: "validation.introduction" })
        .max(256, { error: "validation.introduction" })
        .nullable()
        .optional(),
      gender: z.enum(UserGender).optional(),
      country: z.enum(Country).nullable().optional(),
      birthDate: z.coerce
        .date({ error: "validation.birthDate" })
        .refine(date => date <= new Date(), { error: "validation.birthDate" })
        .optional(),
    }),
    setNull: z.record(z.string(), z.boolean()).optional(),
    avatarFile: z.file().optional(),
    coverBackgroundFile: z.file().optional(),
  }),
});

export type UpdateMyInfoRequest = z.infer<typeof UpdateMyInfoRequestSchema>;

export const UpdateMyInfoResponseSchema = NotegicResponseSchema.extend({
  data: z.object({
    updatedAt: z.coerce.date(),
  }),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type UpdateMyInfoResponse = z.infer<typeof UpdateMyInfoResponseSchema>;
