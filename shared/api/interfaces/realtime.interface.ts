import {
  NotezyRequestSchema,
  NotezyResponseSchema,
} from "@shared/api/interfaces/context.interface";
import { RealtimePermissionSchema } from "@shared/api/interfaces/enums";
import { RealtimeProtocolVersion } from "@shared/constants/version.constants";
import { z } from "zod";

export const CreateMyRealtimeConnectionTicketRequestSchema =
  NotezyRequestSchema.extend({
    header: z
      .object({
        userAgent: z.string().min(1).optional(),
        csrfToken: z.string().optional(),
      })
      .optional(),
    body: z.object({}).optional(),
  });

export type CreateMyRealtimeConnectionTicketRequest = z.input<
  typeof CreateMyRealtimeConnectionTicketRequestSchema
>;

export const CreateMyRealtimeConnectionTicketResponseSchema =
  NotezyResponseSchema.extend({
    data: z.object({
      realtimeEndpoint: z.string().min(1),
      realtimeProtocolVersion: z.literal(RealtimeProtocolVersion),
      connectionTicket: z.string().min(1),
      expiresAt: z.coerce.date(),
    }),
  });

export type CreateMyRealtimeConnectionTicketResponse = z.infer<
  typeof CreateMyRealtimeConnectionTicketResponseSchema
>;

export const CreateMyBlockPackChannelTicketRequestSchema =
  NotezyRequestSchema.extend({
    header: z
      .object({
        userAgent: z.string().min(1).optional(),
        csrfToken: z.string().optional(),
      })
      .optional(),
    body: z.object({
      blockPackId: z.uuidv4(),
      permission: RealtimePermissionSchema,
    }),
  });

export type CreateMyBlockPackChannelTicketRequest = z.input<
  typeof CreateMyBlockPackChannelTicketRequestSchema
>;

export const CreateMyBlockPackChannelTicketResponseSchema =
  NotezyResponseSchema.extend({
    data: z.object({
      channelType: z.literal("BlockPack"),
      channelId: z.uuidv4(),
      roomName: z.string().min(1),
      fragmentName: z.string().min(1),
      schemaId: z.literal("notezy.blocknote"),
      schemaVersion: z.literal(1),
      realtimeProtocolVersion: z.literal(RealtimeProtocolVersion),
      permission: RealtimePermissionSchema,
      channelTicket: z.string().min(1),
      expiresAt: z.coerce.date(),
      lastUpdateSequence: z.number().int().nonnegative(),
      compactedUntilSequence: z.number().int().nonnegative(),
    }),
  });

export type CreateMyBlockPackChannelTicketResponse = z.infer<
  typeof CreateMyBlockPackChannelTicketResponseSchema
>;

export const GetBlockPackParticipantsRequestSchema = NotezyRequestSchema.extend(
  {
    header: z
      .object({
        userAgent: z.string().min(1).optional(),
        csrfToken: z.string().optional(),
      })
      .optional(),
    param: z.object({
      blockPackId: z.uuidv4(),
    }),
  }
);

export type GetBlockPackParticipantsRequest = z.input<
  typeof GetBlockPackParticipantsRequestSchema
>;

export const GetBlockPackParticipantsResponseSchema =
  NotezyResponseSchema.extend({
    data: z.array(
      z.object({
        userPublicId: z.uuidv4(),
        name: z.string(),
        displayName: z.string(),
        channelPermission: RealtimePermissionSchema,
        connectionCount: z.number().int().nonnegative(),
      })
    ),
  });

export type GetBlockPackParticipantsResponse = z.infer<
  typeof GetBlockPackParticipantsResponseSchema
>;
