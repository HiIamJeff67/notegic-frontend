import {
  NotezyRequestSchema,
  NotezyResponseSchema,
} from "@shared/api/interfaces/context.interface";
import z from "zod";

/* ============================== Register Context ============================== */

export const RegisterRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
    })
    .optional(),
  body: z.object({
    name: z
      .string()
      .min(6)
      .max(16)
      .regex(/^[a-zA-Z0-9]+/),
    email: z.email(),
    password: z
      .string()
      .min(8)
      .max(1024)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/
      ),
  }),
});

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

export const RegisterResponseSchema = NotezyResponseSchema.extend({
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

export const RegisterViaGoogleRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
    })
    .optional(),
  body: z.object({
    authorizationCode: z.string(),
  }),
});

export type RegisterViaGoogleRequest = z.infer<
  typeof RegisterViaGoogleRequestSchema
>;

export const RegisterViaGoogleResponseSchema = NotezyResponseSchema.extend({
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

export const LoginRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
    })
    .optional(),
  body: z.object({
    account: z.string(),
    password: z
      .string()
      .min(8)
      .max(1024)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/
      ),
  }),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const LoginResponseSchema = NotezyResponseSchema.extend({
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

export const LoginViaGoogleRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
    })
    .optional(),
  body: z.object({
    authorizationCode: z.string(),
  }),
});

export type LoginViaGoogleRequest = z.infer<typeof LoginViaGoogleRequestSchema>;

export const LoginViaGoogleResponseSchema = NotezyResponseSchema.extend({
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

export const LogoutRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
});

export type LogoutRequest = z.infer<typeof LogoutRequestSchema>;

export const LogoutResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    updatedAt: z.coerce.date(),
  }),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type LogoutResponse = z.infer<typeof LogoutResponseSchema>;

/* ============================== SendAuthCode Context ============================== */

export const SendAuthCodeRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  body: z.object({
    email: z.email(),
  }),
});

export type SendAuthCodeRequest = z.infer<typeof SendAuthCodeRequestSchema>;

export const SendAuthCodeResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    authCodeExpiredAt: z.coerce.date(),
    blockAuthCodeUntil: z.coerce.date(),
    updatedAt: z.coerce.date(),
  }),
});

export type SendAuthCodeResponse = z.infer<typeof SendAuthCodeResponseSchema>;

/* ============================== ValidateEmail Context ============================== */

export const ValidateEmailRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1).optional(),

    csrfToken: z.string(),
  }),
  body: z.object({
    authCode: z.string().length(6),
  }),
});

export type ValidateEmailRequest = z.infer<typeof ValidateEmailRequestSchema>;

export const ValidateEmailResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    updatedAt: z.coerce.date(),
  }),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type ValidateEmailResponse = z.infer<typeof ValidateEmailResponseSchema>;

/* ============================== ResetEmail Context ============================== */

export const ResetEmailRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1).optional(),

    csrfToken: z.string(),
  }),
  body: z.object({
    newEmail: z.email(),
    authCode: z.string().length(6),
  }),
});

export type ResetEmailRequest = z.infer<typeof ResetEmailRequestSchema>;

export const ResetEmailResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    updatedAt: z.coerce.date(),
  }),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type ResetEmailResponse = z.infer<typeof ResetEmailResponseSchema>;

/* ============================== ForgetPassword Context ============================== */

export const ForgetPasswordRequestSchema = NotezyRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  body: z.object({
    account: z.string(),
    newPassword: z
      .string()
      .min(8)
      .max(1024)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/
      ),
    authCode: z
      .string()
      .length(6)
      .regex(/^[0-9]+/),
  }),
});

export type ForgetPasswordRequest = z.infer<typeof ForgetPasswordRequestSchema>;

export const ForgetPasswordResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    updatedAt: z.coerce.date(),
  }),
});

export type ForgetPasswordResponse = z.infer<
  typeof ForgetPasswordResponseSchema
>;

/* ============================== ResetMe Context ============================== */

export const ResetMeRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1).optional(),

    csrfToken: z.string(),
  }),
  body: z.object({
    authCode: z.string().length(6),
  }),
});

export type ResetMeRequest = z.infer<typeof ResetMeRequestSchema>;

export const ResetMeResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    updatedAt: z.coerce.date(),
  }),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type ResetMeResponse = z.infer<typeof ResetMeResponseSchema>;

/* ============================== DeleteMe Context ============================== */

export const DeleteMeRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1).optional(),

    csrfToken: z.string(),
  }),
  body: z.object({
    authCode: z.string().refine(val => val.length === 0 || val.length === 6),
  }),
});

export type DeleteMeRequest = z.infer<typeof DeleteMeRequestSchema>;

export const DeleteMeResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    deletedAt: z.coerce.date(),
  }),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type DeleteMeResponse = z.infer<typeof DeleteMeResponseSchema>;
