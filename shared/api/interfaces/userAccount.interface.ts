import {
  NotegicRequestSchema,
  NotegicResponseSchema,
} from "@shared/api/interfaces/context.interface";
import { CountryCode } from "@shared/api/interfaces/enums";
import z from "zod";

/* ============================== GetMyAccount Context ============================== */

export const GetMyAccountRequestSchema = NotegicRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
});

export type GetMyAccountRequest = z.infer<typeof GetMyAccountRequestSchema>;

export const GetMyAccountResponseSchema = NotegicResponseSchema.extend({
  data: z.object({
    countryCode: z.string().nullable(),
    phoneNumber: z.string().nullable(),
    googleCredential: z
      .string()
      .nullish()
      .transform(value => value ?? null),
    discordCredential: z
      .string()
      .nullish()
      .transform(value => value ?? null),
    rootShelfCount: z.int32().min(0),
    blockPackCount: z.int32().min(0),
    blockCount: z.int32().min(0),
    materialCount: z.int32().min(0),
    workflowCount: z.int32().min(0),
    additionalItemCount: z.int32().min(0),
    stationCount: z.number().int().min(0),
    routineCount: z.number().int().min(0),
    routineTaskCostUnitCount: z.number().int().min(0),
    routineTagCount: z.number().int().min(0),
    updatedAt: z.coerce.date(),
  }),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type GetMyAccountResponse = z.infer<typeof GetMyAccountResponseSchema>;

/* ============================== UpdateMyAccount Context ============================== */

export const UpdateMyAccountRequestSchema = NotegicRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1).optional(),

    csrfToken: z.string(),
  }),
  body: z.object({
    authCode: z.string().length(6),
    values: z
      .object({
        countryCode: z.enum(CountryCode).nullable(),
        backupEmail: z.email().nullable(),
        phoneNumber: z.string().min(1).max(15).regex(/^\d+$/).nullable(),
      })
      .partial(),
    setNull: z.record(z.string(), z.boolean()).optional(),
  }),
});

export type UpdateMyAccountRequest = z.infer<
  typeof UpdateMyAccountRequestSchema
>;

export const UpdateMyAccountResponseSchema = NotegicResponseSchema.extend({
  data: z.object({
    updatedAt: z.coerce.date(),
  }),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type UpdateMyAccountResponse = z.infer<
  typeof UpdateMyAccountResponseSchema
>;

/* ============================== BindGoogleAccount Context ============================== */

export const BindGoogleAccountRequestSchema = NotegicRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  body: z.object({
    authorizationCode: z.string(),
  }),
});

export type BindGoogleAccountRequest = z.infer<
  typeof BindGoogleAccountRequestSchema
>;

export const BindGoogleAccountResponseSchema = NotegicResponseSchema.extend({
  data: z.object({
    updatedAt: z.coerce.date(),
  }),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type BindGoogleAccountResponse = z.infer<
  typeof BindGoogleAccountResponseSchema
>;

/* ============================== UnbindGoogleAccount Context ============================== */

export const UnbindGoogleAccountRequestSchema = NotegicRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  body: z.object({
    authorizationCode: z.string(),
  }),
});

export type UnbindGoogleAccountRequest = z.infer<
  typeof UnbindGoogleAccountRequestSchema
>;

export const UnbindGoogleAccountResponseSchema = NotegicResponseSchema.extend({
  data: z.object({
    updatedAt: z.coerce.date(),
  }),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type UnbindGoogleAccountResponse = z.infer<
  typeof UnbindGoogleAccountResponseSchema
>;
