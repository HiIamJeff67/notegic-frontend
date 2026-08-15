import {
  NotezyRequestSchema,
  NotezyResponseSchema,
} from "@shared/api/interfaces/context.interface";
import { z } from "zod";

const APIKeyRequestHeaderSchema = z.object({
  userAgent: z.string().min(1).optional(),
  csrfToken: z.string().optional(),
});

export const APIKeySummarySchema = z.object({
  publicId: z.uuid(),
  name: z.string().min(1),
  keyPrefix: z.string().min(1),
  lastUsedAt: z.coerce.date().nullable().default(null),
  expiresAt: z.coerce.date().nullable().default(null),
  revokedAt: z.coerce.date().nullable().default(null),
  createdAt: z.coerce.date(),
});
export type APIKeySummary = z.infer<typeof APIKeySummarySchema>;

export const CreateMyAPIKeyRequestSchema = NotezyRequestSchema.extend({
  header: APIKeyRequestHeaderSchema,
  body: z.object({
    name: z.string().trim().min(1).max(64),
    expiresAt: z.coerce.date().nullable().optional(),
  }),
});
export type CreateMyAPIKeyRequest = z.infer<
  typeof CreateMyAPIKeyRequestSchema
>;

export const CreateMyAPIKeyResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    publicId: z.uuid(),
    name: z.string().min(1),
    keyPrefix: z.string().min(1),
    secret: z.string().min(1),
    expiresAt: z.coerce.date().nullable().default(null),
    createdAt: z.coerce.date(),
  }),
});
export type CreateMyAPIKeyResponse = z.infer<
  typeof CreateMyAPIKeyResponseSchema
>;

export const ListMyAPIKeysRequestSchema = NotezyRequestSchema.extend({
  header: APIKeyRequestHeaderSchema,
});
export type ListMyAPIKeysRequest = z.infer<
  typeof ListMyAPIKeysRequestSchema
>;

export const ListMyAPIKeysResponseSchema = NotezyResponseSchema.extend({
  data: z.object({ items: z.array(APIKeySummarySchema) }),
});
export type ListMyAPIKeysResponse = z.infer<
  typeof ListMyAPIKeysResponseSchema
>;

export const RevokeMyAPIKeyRequestSchema = NotezyRequestSchema.extend({
  header: APIKeyRequestHeaderSchema,
  param: z.object({ publicId: z.uuid() }),
});
export type RevokeMyAPIKeyRequest = z.infer<
  typeof RevokeMyAPIKeyRequestSchema
>;

export const RevokeMyAPIKeyResponseSchema = NotezyResponseSchema.extend({
  data: z.object({ revokedAt: z.coerce.date() }),
});
export type RevokeMyAPIKeyResponse = z.infer<
  typeof RevokeMyAPIKeyResponseSchema
>;
