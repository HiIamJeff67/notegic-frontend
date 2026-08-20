import {
  Country,
  UserGender,
  UserPlan,
  UserRole,
  UserStatus,
} from "@shared/api/interfaces/enums";
import { z } from "zod";

export const UserSchema = z.object({
  publicId: z.string(),
  name: z
    .string()
    .min(6)
    .max(32)
    .regex(/^[a-zA-Z0-9]+/),
  displayName: z
    .string()
    .min(6)
    .max(32)
    .regex(/^[a-zA-Z0-9]+/),
  email: z.email(),
  role: z.enum(UserRole),
  plan: z.enum(UserPlan),
  status: z.enum(UserStatus),
  updatedAt: z.coerce.date(),
  createdAt: z.coerce.date(),
});

export type User = z.infer<typeof UserSchema>;

export const UserInfoSchema = z.object({
  avatarURL: z.url().nullable(),
  coverBackgroundURL: z.url().nullable(),
  header: z.string().min(0).max(64).nullable(),
  introduction: z.string().min(0).max(256).nullable(),
  gender: z.enum(UserGender),
  country: z.enum(Country).nullable(),
  birthDate: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type UserInfo = z.infer<typeof UserInfoSchema>;

export const UserAccountSchema = z.object({
  countryCode: z.string().nullable(),
  phoneNumber: z.string().nullable(),
  googleCredential: z.string().nullable(),
  discordCredential: z.string().nullable(),
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
});

export type UserAccount = z.infer<typeof UserAccountSchema>;

/**
 * This type is the same as the user data cache
 * (or UserDataCache) in the backend redis cache
 */
export const UserDataSchema = z.object({
  publicId: z.string(),
  name: z
    .string()
    .min(6)
    .max(32)
    .regex(/^[a-zA-Z0-9]+/),
  displayName: z
    .string()
    .min(6)
    .max(32)
    .regex(/^[a-zA-Z0-9]+/),
  email: z.email(),
  role: z.enum(UserRole),
  plan: z.enum(UserPlan),
  status: z.enum(UserStatus),
  avatarURL: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type UserData = z.infer<typeof UserDataSchema>;
