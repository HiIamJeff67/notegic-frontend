import {
  Language,
  UserSettingDensity,
  UserSettingStartSurface,
} from "@shared/api/interfaces/enums";
import { z } from "zod";
import {
  NotegicRequestSchema,
  NotegicResponseSchema,
} from "./context.interface";

export const UserSettingSchema = z.object({
  language: z.enum(Language),
  density: z.enum(UserSettingDensity),
  startSurface: z.enum(UserSettingStartSurface),
  reduceMotion: z.boolean(),
  lineWrap: z.boolean(),
  quickInsert: z.boolean(),
  privatePreviews: z.boolean(),
  routineNudges: z.boolean(),
  syncNotifications: z.boolean(),
  quietMode: z.boolean(),
  quietModeStartMinute: z.number().int().min(0).max(1439),
  quietModeEndMinute: z.number().int().min(0).max(1439),
});

export type UserSetting = z.infer<typeof UserSettingSchema>;

const UserSettingHeaderSchema = z.object({
  userAgent: z.string().min(1).optional(),
  csrfToken: z.string().optional(),
});

export const GetMySettingRequestSchema = NotegicRequestSchema.extend({
  header: UserSettingHeaderSchema.optional(),
});

export type GetMySettingRequest = z.infer<typeof GetMySettingRequestSchema>;

export const GetMySettingResponseSchema = NotegicResponseSchema.extend({
  data: UserSettingSchema,
  embedded: z.object({ publicId: z.string() }),
});

export type GetMySettingResponse = z.infer<typeof GetMySettingResponseSchema>;

export const UpdateMySettingRequestSchema = NotegicRequestSchema.extend({
  header: UserSettingHeaderSchema.optional(),
  body: z.object({
    values: UserSettingSchema.partial(),
    setNull: z.record(z.string(), z.boolean()).optional(),
  }),
});

export type UpdateMySettingRequest = z.infer<
  typeof UpdateMySettingRequestSchema
>;

export const UpdateMySettingResponseSchema = NotegicResponseSchema.extend({
  data: z.object({ updatedAt: z.coerce.date() }),
  embedded: z.object({ publicId: z.string() }),
});

export type UpdateMySettingResponse = z.infer<
  typeof UpdateMySettingResponseSchema
>;
