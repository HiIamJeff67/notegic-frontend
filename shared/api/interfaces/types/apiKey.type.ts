import { z } from "zod";

export const APIKeyPublicIdSchema = z.uuid();

export const APIKeyNameSchema = z.string().min(1);

export const APIKeyPrefixSchema = z.string().min(1);

export const APIKeySecretSchema = z.string().min(1);

export const APIKeyTimestampSchema = z.coerce.date();

export const APIKeyOptionalTimestampSchema = z.coerce
  .date()
  .nullable()
  .default(null);

export const APIKeySummarySchema = z.object({
  publicId: APIKeyPublicIdSchema,
  name: APIKeyNameSchema,
  keyPrefix: APIKeyPrefixSchema,
  lastUsedAt: APIKeyOptionalTimestampSchema,
  expiresAt: APIKeyOptionalTimestampSchema,
  revokedAt: APIKeyOptionalTimestampSchema,
  createdAt: APIKeyTimestampSchema,
});

export type APIKeySummary = z.infer<typeof APIKeySummarySchema>;
