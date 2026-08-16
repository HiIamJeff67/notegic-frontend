import { NotegicAPIError } from "@shared/api/exceptions";
import { RealtimeError } from "@shared/api/exceptions/client/realtime.exception";
import { RealtimePermissionSchema } from "@shared/api/interfaces/enums";
import { RealtimeProtocolVersion } from "@shared/constants/version.constants";
import type { RealtimePresenceParticipant } from "./presence.frame";

export type RealtimeSubscribedFrame = {
  version: typeof RealtimeProtocolVersion;
  type: "subscribed";
  requestId?: string;
  channelType: "BlockPack";
  channelId: string;
  connectorChannelId: number;
  existing: boolean;
  documentQuotaPolicyVersion: number;
  maximumBlockCount: number;
  participants: RealtimePresenceParticipant[];
};

export const parseRealtimeSubscribedFrame = (
  frame: Record<string, unknown>
): RealtimeSubscribedFrame => {
  if (
    typeof frame.channelId !== "string" ||
    frame.channelType !== "BlockPack"
  ) {
    throw new NotegicAPIError(RealtimeError.InvalidFrameShape());
  }
  if (
    typeof frame.connectorChannelId !== "number" ||
    !Number.isInteger(frame.connectorChannelId) ||
    frame.connectorChannelId < 0
  ) {
    throw new NotegicAPIError(
      RealtimeError.MissingSubscribedConnectorChannelId()
    );
  }
  if (typeof frame.existing !== "boolean") {
    throw new NotegicAPIError(RealtimeError.InvalidFrameShape());
  }
  if (
    typeof frame.documentQuotaPolicyVersion !== "number" ||
    !Number.isSafeInteger(frame.documentQuotaPolicyVersion) ||
    frame.documentQuotaPolicyVersion <= 0 ||
    typeof frame.maximumBlockCount !== "number" ||
    !Number.isSafeInteger(frame.maximumBlockCount) ||
    frame.maximumBlockCount <= 0
  ) {
    throw new NotegicAPIError(RealtimeError.InvalidFrameShape());
  }
  if (
    frame.participants !== undefined &&
    (!Array.isArray(frame.participants) ||
      frame.participants.some(participant => {
        if (
          typeof participant !== "object" ||
          participant === null ||
          Array.isArray(participant)
        )
          return true;
        const value = participant as Record<string, unknown>;
        return (
          typeof value.userPublicId !== "string" ||
          !RealtimePermissionSchema.safeParse(value.channelPermission)
            .success ||
          typeof value.connectionCount !== "number" ||
          !Number.isInteger(value.connectionCount) ||
          value.connectionCount < 0
        );
      }))
  ) {
    throw new NotegicAPIError(RealtimeError.InvalidFrameShape());
  }

  return {
    version: RealtimeProtocolVersion,
    type: "subscribed",
    requestId:
      typeof frame.requestId === "string" ? frame.requestId : undefined,
    channelType: "BlockPack",
    channelId: frame.channelId,
    connectorChannelId: frame.connectorChannelId,
    existing: frame.existing,
    documentQuotaPolicyVersion: frame.documentQuotaPolicyVersion,
    maximumBlockCount: frame.maximumBlockCount,
    participants: (frame.participants as RealtimePresenceParticipant[]) ?? [],
  };
};
