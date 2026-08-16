import {
  NotegicRequestSchema,
  NotegicResponseSchema,
} from "@shared/api/interfaces/context.interface";
import { z } from "zod";

// Keep this open-ended so a future backend notification type does not break
// the inbox. The renderer provides a neutral fallback for unknown values.
export const NotificationTypeSchema = z.string().min(1);
export type NotificationType = z.infer<typeof NotificationTypeSchema>;

export const NotificationPrioritySchema = z.enum([
  "low",
  "normal",
  "high",
  "critical",
]);
export type NotificationPriority = z.infer<typeof NotificationPrioritySchema>;

export const NotificationSchema = z.object({
  id: z.uuid(),
  recipientUserPublicId: z.uuid(),
  type: NotificationTypeSchema,
  priority: NotificationPrioritySchema,
  templateKey: z.string().min(1),
  templateVersion: z.number().int().positive(),
  payload: z.record(z.string(), z.any()),
  createdAt: z.coerce.date(),
  // The Gateway's Go DTO uses `omitempty` for nullable timestamps, so an
  // unread/active notification may omit these fields entirely.
  readAt: z.coerce.date().nullable().default(null),
  deletedAt: z.coerce.date().nullable().default(null),
  expiresAt: z.coerce.date().nullable().default(null),
});
export type Notification = z.infer<typeof NotificationSchema>;

export const NotificationSearchEdgeSchema = z.object({
  encodedSearchCursor: z.string(),
  node: NotificationSchema,
});
export type NotificationSearchEdge = z.infer<
  typeof NotificationSearchEdgeSchema
>;

export const NotificationSearchPageInfoSchema = z.object({
  hasNextPage: z.boolean(),
  hasPreviousPage: z.boolean(),
  startEncodedSearchCursor: z.string().nullable().optional(),
  endEncodedSearchCursor: z.string().nullable().optional(),
});
export type NotificationSearchPageInfo = z.infer<
  typeof NotificationSearchPageInfoSchema
>;

export const ListNotificationsRequestSchema = NotegicRequestSchema.extend({
  header: z
    .object({
      userAgent: z.string().min(1).optional(),
      csrfToken: z.string().optional(),
    })
    .optional(),
  param: z.object({
    first: z.number().int().min(1).max(100).optional(),
    after: z.string().min(1).optional(),
  }),
});
export type ListNotificationsRequest = z.infer<
  typeof ListNotificationsRequestSchema
>;

export const ListNotificationsResponseSchema = NotegicResponseSchema.extend({
  data: z.object({
    searchEdges: z.array(NotificationSearchEdgeSchema),
    searchPageInfo: NotificationSearchPageInfoSchema,
    totalCount: z.number().int().nonnegative(),
    searchTime: z.number().nonnegative(),
  }),
});
export type ListNotificationsResponse = z.infer<
  typeof ListNotificationsResponseSchema
>;

export const GetUnreadNotificationCountRequestSchema =
  NotegicRequestSchema.extend({
    header: z
      .object({
        userAgent: z.string().min(1).optional(),
        csrfToken: z.string().optional(),
      })
      .optional(),
  });
export type GetUnreadNotificationCountRequest = z.infer<
  typeof GetUnreadNotificationCountRequestSchema
>;

export const GetUnreadNotificationCountResponseSchema =
  NotegicResponseSchema.extend({
    data: z.object({ count: z.number().int().nonnegative() }),
  });
export type GetUnreadNotificationCountResponse = z.infer<
  typeof GetUnreadNotificationCountResponseSchema
>;

const NotificationMutationHeaderSchema = z.object({
  userAgent: z.string().min(1).optional(),
  csrfToken: z.string(),
});

export const MarkNotificationsReadRequestSchema = NotegicRequestSchema.extend({
  header: NotificationMutationHeaderSchema,
  body: z.object({ notificationIds: z.array(z.uuid()).min(1) }),
});
export type MarkNotificationsReadRequest = z.infer<
  typeof MarkNotificationsReadRequestSchema
>;

export const MarkNotificationsReadResponseSchema = NotegicResponseSchema.extend({
  data: z.object({ updatedCount: z.number().int().nonnegative() }),
});
export type MarkNotificationsReadResponse = z.infer<
  typeof MarkNotificationsReadResponseSchema
>;

export const DeleteNotificationsRequestSchema = NotegicRequestSchema.extend({
  header: NotificationMutationHeaderSchema,
  body: z.object({ notificationIds: z.array(z.uuid()).min(1) }),
});
export type DeleteNotificationsRequest = z.infer<
  typeof DeleteNotificationsRequestSchema
>;

export const DeleteNotificationsResponseSchema = NotegicResponseSchema.extend({
  data: z.object({ deletedCount: z.number().int().nonnegative() }),
});
export type DeleteNotificationsResponse = z.infer<
  typeof DeleteNotificationsResponseSchema
>;
