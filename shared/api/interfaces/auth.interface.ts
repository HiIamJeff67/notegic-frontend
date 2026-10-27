import {
  NotegicRequestSchema,
  NotegicResponseSchema,
} from "@shared/api/interfaces/context.interface";
import z from "zod";

export const PasswordSchema = z
  .string({ error: "auth.validation.passwordRequired" })
  .min(1, { error: "auth.validation.passwordRequired" })
  .min(8, { error: "auth.validation.passwordTooShort" })
  .refine(password => password.trim().length >= 8, {
    error: "auth.validation.passwordTooShort",
  })
  .max(1024, { error: "auth.validation.passwordTooLong" })
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s])/, {
    error: "auth.validation.passwordStrength",
  });

export const AccountSchema = z
  .string({ error: "auth.validation.accountRequired" })
  .min(1, { error: "auth.validation.accountRequired" })
  .refine(
    account =>
      z.email().safeParse(account).success ||
      (/^[\p{L}\p{N}]+$/u.test(account) &&
        /[a-zA-Z]/.test(account) &&
        /\d/.test(account)),
    { error: "auth.validation.accountFormat" }
  );

export const AuthCodeSchema = z
  .string({ error: "validation.authCode" })
  .regex(/^\d{6}$/, { error: "validation.authCode" });

/* ============================== Register Context ============================== */

export const RegisterRequestSchema = NotegicRequestSchema.extend({
  header: z
    .object({
      userAgent: z
        .string({ error: "auth.validation.invalidInput" })
        .min(1, { error: "auth.validation.invalidInput" })
        .optional(),
      turnstileToken: z
        .string({ error: "auth.turnstileRequired" })
        .min(1, { error: "auth.turnstileRequired" })
        .optional(),
    })
    .optional(),
  body: z.object(
    {
      name: z
        .string({ error: "auth.validation.nameLength" })
        .min(6, { error: "auth.validation.nameLength" })
        .max(32, { error: "auth.validation.nameLength" })
        .regex(/^(?=.*\p{L})(?=.*\p{Nd})[\p{L}\p{Nd}]+$/u, {
          error: "auth.validation.nameFormat",
        }),
      email: z.email({ error: "auth.validation.emailFormat" }),
      password: PasswordSchema,
    },
    { error: "auth.validation.invalidInput" }
  ),
});

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

export const RegisterResponseSchema = NotegicResponseSchema.extend({
  data: z.object({
    publicId: z.string(),
    name: z.string(),
    displayName: z.string(),
    email: z.email(),
    csrfToken: z.string(),
    createdAt: z.coerce.date(),
  }),
});

export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;

/* ============================== RegisterViaGoogle Context ============================== */

export const RegisterViaGoogleRequestSchema = NotegicRequestSchema.extend({
  header: z
    .object({
      userAgent: z
        .string({ error: "auth.validation.invalidInput" })
        .min(1, { error: "auth.validation.invalidInput" })
        .optional(),
      turnstileToken: z
        .string({ error: "auth.turnstileRequired" })
        .min(1, { error: "auth.turnstileRequired" })
        .optional(),
    })
    .optional(),
  body: z.object(
    {
      authorizationCode: z
        .string({ error: "auth.validation.oauthCodeInvalid" })
        .min(1, { error: "auth.validation.oauthCodeInvalid" }),
    },
    { error: "auth.validation.invalidInput" }
  ),
});

export type RegisterViaGoogleRequest = z.infer<
  typeof RegisterViaGoogleRequestSchema
>;

export const RegisterViaGoogleResponseSchema = NotegicResponseSchema.extend({
  data: z.object({
    publicId: z.string(),
    name: z.string(),
    displayName: z.string(),
    email: z.email(),
    csrfToken: z.string(),
    createdAt: z.coerce.date(),
  }),
});

export type RegisterViaGoogleResponse = z.infer<
  typeof RegisterViaGoogleResponseSchema
>;

/* ============================== Login Context ============================== */

export const LoginRequestSchema = NotegicRequestSchema.extend({
  header: z
    .object({
      userAgent: z
        .string({ error: "auth.validation.invalidInput" })
        .min(1, { error: "auth.validation.invalidInput" })
        .optional(),
      turnstileToken: z
        .string({ error: "auth.turnstileRequired" })
        .min(1, { error: "auth.turnstileRequired" })
        .optional(),
    })
    .optional(),
  body: z.object(
    {
      account: AccountSchema,
      password: PasswordSchema,
    },
    { error: "auth.validation.invalidInput" }
  ),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const LoginResponseSchema = NotegicResponseSchema.extend({
  data: z.object({
    publicId: z.string(),
    name: z.string(),
    displayName: z.string(),
    email: z.email(),
    csrfToken: z.string(),
    updatedAt: z.coerce.date(),
    createdAt: z.coerce.date(),
  }),
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;

/* ============================== LoginViaGoogle Context ============================== */

export const LoginViaGoogleRequestSchema = NotegicRequestSchema.extend({
  header: z
    .object({
      userAgent: z
        .string({ error: "auth.validation.invalidInput" })
        .min(1, { error: "auth.validation.invalidInput" })
        .optional(),
      turnstileToken: z
        .string({ error: "auth.turnstileRequired" })
        .min(1, { error: "auth.turnstileRequired" })
        .optional(),
    })
    .optional(),
  body: z.object(
    {
      authorizationCode: z
        .string({ error: "auth.validation.oauthCodeInvalid" })
        .min(1, { error: "auth.validation.oauthCodeInvalid" }),
    },
    { error: "auth.validation.invalidInput" }
  ),
});

export type LoginViaGoogleRequest = z.infer<typeof LoginViaGoogleRequestSchema>;

export const LoginViaGoogleResponseSchema = NotegicResponseSchema.extend({
  data: z.object({
    publicId: z.string(),
    name: z.string(),
    displayName: z.string(),
    email: z.email(),
    csrfToken: z.string(),
    updatedAt: z.coerce.date(),
    createdAt: z.coerce.date(),
  }),
});

export type LoginViaGoogleResponse = z.infer<
  typeof LoginViaGoogleResponseSchema
>;

/* ============================== Logout Context ============================== */

export const LogoutRequestSchema = NotegicRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
});

export type LogoutRequest = z.infer<typeof LogoutRequestSchema>;

export const LogoutResponseSchema = NotegicResponseSchema.extend({
  data: z.object({
    updatedAt: z.coerce.date(),
  }),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type LogoutResponse = z.infer<typeof LogoutResponseSchema>;

/* ============================== SendAuthCode Context ============================== */

export const SendAuthCodeRequestSchema = NotegicRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
      turnstileToken: z.string().min(1).optional(),
    })
    .optional(),
  body: z.object({
    email: z.email({ error: "auth.validation.emailFormat" }),
  }),
});

export type SendAuthCodeRequest = z.infer<typeof SendAuthCodeRequestSchema>;

export const SendAuthCodeResponseSchema = NotegicResponseSchema.extend({
  data: z.object({
    authCodeExpiredAt: z.coerce.date(),
    blockAuthCodeUntil: z.coerce.date(),
    updatedAt: z.coerce.date(),
  }),
});

export type SendAuthCodeResponse = z.infer<typeof SendAuthCodeResponseSchema>;

/* ============================== ValidateEmail Context ============================== */

export const ValidateEmailRequestSchema = NotegicRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1).optional(),

    csrfToken: z.string(),
  }),
  body: z.object({
    authCode: AuthCodeSchema,
  }),
});

export type ValidateEmailRequest = z.infer<typeof ValidateEmailRequestSchema>;

export const ValidateEmailResponseSchema = NotegicResponseSchema.extend({
  data: z.object({
    updatedAt: z.coerce.date(),
  }),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type ValidateEmailResponse = z.infer<typeof ValidateEmailResponseSchema>;

/* ============================== ResetEmail Context ============================== */

export const ResetEmailRequestSchema = NotegicRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1).optional(),

    csrfToken: z.string(),
  }),
  body: z.object({
    newEmail: z.email({ error: "auth.validation.emailFormat" }),
    authCode: AuthCodeSchema,
  }),
});

export type ResetEmailRequest = z.infer<typeof ResetEmailRequestSchema>;

export const ResetEmailResponseSchema = NotegicResponseSchema.extend({
  data: z.object({
    updatedAt: z.coerce.date(),
  }),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type ResetEmailResponse = z.infer<typeof ResetEmailResponseSchema>;

/* ============================== ForgetPassword Context ============================== */

export const ForgetPasswordRequestSchema = NotegicRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  body: z.object({
    account: AccountSchema,
    newPassword: PasswordSchema,
    authCode: AuthCodeSchema,
  }),
});

export type ForgetPasswordRequest = z.infer<typeof ForgetPasswordRequestSchema>;

export const ForgetPasswordResponseSchema = NotegicResponseSchema.extend({
  data: z.object({
    updatedAt: z.coerce.date(),
  }),
});

export type ForgetPasswordResponse = z.infer<
  typeof ForgetPasswordResponseSchema
>;

/* ============================== ResetMe Context ============================== */

export const ResetMeRequestSchema = NotegicRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1).optional(),

    csrfToken: z.string(),
  }),
  body: z.object({
    authCode: AuthCodeSchema,
  }),
});

export type ResetMeRequest = z.infer<typeof ResetMeRequestSchema>;

export const ResetMeResponseSchema = NotegicResponseSchema.extend({
  data: z.object({
    updatedAt: z.coerce.date(),
  }),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type ResetMeResponse = z.infer<typeof ResetMeResponseSchema>;

/* ============================== DeleteMe Context ============================== */

export const DeleteMeRequestSchema = NotegicRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1).optional(),

    csrfToken: z.string(),
  }),
  body: z.object({
    authCode: z.union([z.literal(""), AuthCodeSchema], {
      error: "validation.authCode",
    }),
  }),
});

export type DeleteMeRequest = z.infer<typeof DeleteMeRequestSchema>;

export const DeleteMeResponseSchema = NotegicResponseSchema.extend({
  data: z.object({
    deletedAt: z.coerce.date(),
  }),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type DeleteMeResponse = z.infer<typeof DeleteMeResponseSchema>;
