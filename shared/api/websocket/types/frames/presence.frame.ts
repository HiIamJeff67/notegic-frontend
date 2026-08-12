import { NotezyAPIError } from "@shared/api/exceptions";
import { RealtimeError } from "@shared/api/exceptions/client/realtime.exception";
import { RealtimePermissionSchema } from "@shared/api/interfaces/enums";
import { RealtimeProtocolVersion } from "@shared/constants/version.constants";
import type { z } from "zod";

export type RealtimePresenceParticipant = {
  userPublicId: string;
  channelPermission: z.infer<typeof RealtimePermissionSchema>;
  connectionCount: number;
};

export type RealtimePresenceFrameType =
  | "presence-joined"
  | "presence-left"
  | "presence-updated";

export type RealtimePresenceFrame = {
  version: typeof RealtimeProtocolVersion;
  type: RealtimePresenceFrameType;
  channelType: "BlockPack";
  channelId: string;
  participant: RealtimePresenceParticipant;
};

export const parseRealtimePresenceFrame = (
  frame: Record<string, unknown>
): RealtimePresenceFrame => {
  if (
    (frame.type !== "presence-joined" &&
      frame.type !== "presence-left" &&
      frame.type !== "presence-updated") ||
    frame.channelType !== "BlockPack" ||
    typeof frame.channelId !== "string" ||
    typeof frame.participant !== "object" ||
    frame.participant === null ||
    Array.isArray(frame.participant)
  ) {
    throw new NotezyAPIError(RealtimeError.InvalidFrameShape());
  }

  const participant = frame.participant as Record<string, unknown>;
  if (
    typeof participant.userPublicId !== "string" ||
    !RealtimePermissionSchema.safeParse(participant.channelPermission)
      .success ||
    typeof participant.connectionCount !== "number" ||
    !Number.isInteger(participant.connectionCount) ||
    participant.connectionCount < 0
  ) {
    throw new NotezyAPIError(RealtimeError.InvalidFrameShape());
  }

  return {
    version: RealtimeProtocolVersion,
    type: frame.type,
    channelType: "BlockPack",
    channelId: frame.channelId,
    participant: {
      userPublicId: participant.userPublicId,
      channelPermission: participant.channelPermission as z.infer<
        typeof RealtimePermissionSchema
      >,
      connectionCount: participant.connectionCount,
    },
  };
};
