import {
  APIKeyNameSchema,
  APIKeyOptionalTimestampSchema,
  APIKeyPrefixSchema,
  APIKeyPublicIdSchema,
  APIKeySecretSchema,
  APIKeySummarySchema,
  APIKeyTimestampSchema,
} from "@shared/api/interfaces/types/apiKey.type";
import { RequestHeaderSchema } from "@shared/api/interfaces/types/requestHeader.type";
import { z } from "zod";
import {
  NotegicRequestSchema,
  NotegicResponseSchema,
} from "./context.interface";

/* ============================== CreateMyAPIKey ============================== */

export const CreateMyAPIKeyRequestSchema = NotegicRequestSchema.extend({
  header: RequestHeaderSchema,
  body: z.object({
    name: z
      .string({ error: "validation.apiKeyName" })
      .trim()
      .min(1, { error: "validation.apiKeyName" })
      .max(64, { error: "validation.apiKeyName" }),
    expiresAt: z.coerce.date().nullable().optional(),
  }),
});

export type CreateMyAPIKeyRequest = z.infer<typeof CreateMyAPIKeyRequestSchema>;

export const CreateMyAPIKeyResponseSchema = NotegicResponseSchema.extend({
  data: z.object({
    publicId: APIKeyPublicIdSchema,
    name: APIKeyNameSchema,
    keyPrefix: APIKeyPrefixSchema,
    secret: APIKeySecretSchema,
    expiresAt: APIKeyOptionalTimestampSchema,
    createdAt: APIKeyTimestampSchema,
  }),
});

export type CreateMyAPIKeyResponse = z.infer<
  typeof CreateMyAPIKeyResponseSchema
>;

/* ============================== ListMyAPIKeys ============================== */

export const ListMyAPIKeysRequestSchema = NotegicRequestSchema.extend({
  header: RequestHeaderSchema,
});

export type ListMyAPIKeysRequest = z.infer<typeof ListMyAPIKeysRequestSchema>;

export const ListMyAPIKeysResponseSchema = NotegicResponseSchema.extend({
  data: z.object({ items: z.array(APIKeySummarySchema) }),
});

export type ListMyAPIKeysResponse = z.infer<typeof ListMyAPIKeysResponseSchema>;

/* ============================== RevokeMyAPIKey ============================== */

export const RevokeMyAPIKeyRequestSchema = NotegicRequestSchema.extend({
  header: RequestHeaderSchema,
  param: z.object({ publicId: APIKeyPublicIdSchema }),
});

export type RevokeMyAPIKeyRequest = z.infer<typeof RevokeMyAPIKeyRequestSchema>;

export const RevokeMyAPIKeyResponseSchema = NotegicResponseSchema.extend({
  data: z.object({ revokedAt: APIKeyTimestampSchema }),
});

export type RevokeMyAPIKeyResponse = z.infer<
  typeof RevokeMyAPIKeyResponseSchema
>;
