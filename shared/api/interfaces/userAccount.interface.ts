import {
  NotegicRequestSchema,
  NotegicResponseSchema,
} from "@shared/api/interfaces/context.interface";
import { CountryCode } from "@shared/api/interfaces/enums";
import z from "zod";
import { AuthCodeSchema } from "./auth.interface";
import { AuthProviderTypeSchema, UserAccountSchema } from "./types/user.type";

/* ============================== GetMyAccount Context ============================== */

export const GetMyAccountResponseSchema = NotegicResponseSchema.extend({
  data: UserAccountSchema.or(
    // Accept the previous API response during a frontend-first rollout.
    UserAccountSchema.pick({
      countryCode: true,
      phoneNumber: true,
      backupEmail: true,
      emailVerified: true,
      updatedAt: true,
    })
      .extend({
        googleCredential: z.string().nullable(),
        githubCredential: z.string().nullish(),
        xCredential: z.string().nullish(),
        discordCredential: z.string().nullish(),
      })
      .transform(
        ({
          googleCredential,
          githubCredential,
          xCredential,
          discordCredential,
          ...account
        }) => ({
          ...account,
          registeredAuthProviderType: undefined,
          passwordConfigured: undefined,
          googleBound: googleCredential !== null,
          githubBound: githubCredential != null,
          xBound: xCredential != null,
          discordBound: discordCredential != null,
          oauthFallbackProviders: undefined,
        })
      )
  ),
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
    authCode: AuthCodeSchema,
    values: z
      .object({
        countryCode: z.enum(CountryCode).nullable(),
        backupEmail: z
          .email({ error: "auth.validation.emailFormat" })
          .nullable(),
        phoneNumber: z
          .string({ error: "validation.phone" })
          .min(1, { error: "validation.phone" })
          .max(15, { error: "validation.phone" })
          .regex(/^\d+$/, { error: "validation.phone" })
          .nullable(),
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
    backupEmail: z.string().nullish(),
    countryCode: z.string().nullish(),
    phoneNumber: z.string().nullish(),
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

const OAuthOperationProviderSchema = AuthProviderTypeSchema.extract([
  "Google",
  "Github",
  "X",
]);
const OAuthOperationStateSchema = z.string().regex(/^[0-9a-f]{64}$/);

export const PrepareOAuthOperationRequestSchema = NotegicRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  body: z.object({
    provider: OAuthOperationProviderSchema,
    authCode: AuthCodeSchema,
  }),
});

export type PrepareOAuthOperationRequest = z.infer<
  typeof PrepareOAuthOperationRequestSchema
>;

export const PrepareOAuthOperationResponseSchema = NotegicResponseSchema.extend(
  {
    data: z.object({
      state: OAuthOperationStateSchema,
      codeChallenge: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
    }),
  }
);

export type PrepareOAuthOperationResponse = z.infer<
  typeof PrepareOAuthOperationResponseSchema
>;

export const BindGoogleAccountRequestSchema = NotegicRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  body: z.object({
    authorizationCode: z.string().min(1),
    state: OAuthOperationStateSchema,
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
  body: z.union([
    z.object({
      authCode: AuthCodeSchema,
      fallbackProvider: OAuthOperationProviderSchema.optional(),
      fallbackEmailCode: z.undefined().optional(),
    }),
    z.object({
      authCode: z.undefined().optional(),
      fallbackProvider: OAuthOperationProviderSchema,
      fallbackEmailCode: AuthCodeSchema,
    }),
  ]),
});

export type UnbindGoogleAccountRequest = z.infer<
  typeof UnbindGoogleAccountRequestSchema
>;

export const UnbindGoogleAccountResponseSchema = NotegicResponseSchema.extend({
  data: z.object({
    updatedAt: z.coerce.date(),
    verificationRequired: z.boolean().optional(),
    fallbackProvider: OAuthOperationProviderSchema.optional(),
  }),
  embedded: z.object({
    publicId: z.string(),
  }),
});

export type UnbindGoogleAccountResponse = z.infer<
  typeof UnbindGoogleAccountResponseSchema
>;

export const BindGithubAccountRequestSchema = BindGoogleAccountRequestSchema;
export const BindXAccountRequestSchema = BindGoogleAccountRequestSchema;
export type BindGithubAccountRequest = z.infer<
  typeof BindGithubAccountRequestSchema
>;

export type BindXAccountRequest = z.infer<typeof BindXAccountRequestSchema>;
export const BindGithubAccountResponseSchema = BindGoogleAccountResponseSchema;

export const BindXAccountResponseSchema = BindGoogleAccountResponseSchema;
export type BindGithubAccountResponse = z.infer<
  typeof BindGithubAccountResponseSchema
>;

export type BindXAccountResponse = z.infer<typeof BindXAccountResponseSchema>;
export const UnbindGithubAccountRequestSchema =
  UnbindGoogleAccountRequestSchema;

export const UnbindXAccountRequestSchema = UnbindGoogleAccountRequestSchema;
export type UnbindGithubAccountRequest = z.infer<
  typeof UnbindGithubAccountRequestSchema
>;

export type UnbindXAccountRequest = z.infer<typeof UnbindXAccountRequestSchema>;
export const UnbindGithubAccountResponseSchema =
  UnbindGoogleAccountResponseSchema;

export const UnbindXAccountResponseSchema = UnbindGoogleAccountResponseSchema;
export type UnbindGithubAccountResponse = z.infer<
  typeof UnbindGithubAccountResponseSchema
>;

export type UnbindXAccountResponse = z.infer<
  typeof UnbindXAccountResponseSchema
>;
