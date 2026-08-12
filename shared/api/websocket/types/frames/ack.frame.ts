import { NotezyAPIError } from "@shared/api/exceptions";
import { RealtimeError } from "@shared/api/exceptions/client/realtime.exception";
import { RealtimeProtocolVersion } from "@shared/constants/version.constants";

export type RealtimeAckFrame = {
  version: typeof RealtimeProtocolVersion;
  type: "ack" | "acknowledged";
  requestId?: string;
  connectorChannelId: number;
  sequence: number;
};

export const parseRealtimeAckFrame = (
  frame: Record<string, unknown>
): RealtimeAckFrame => {
  if (
    (frame.type !== "ack" && frame.type !== "acknowledged") ||
    typeof frame.connectorChannelId !== "number" ||
    !Number.isInteger(frame.connectorChannelId) ||
    frame.connectorChannelId < 0 ||
    typeof frame.sequence !== "number" ||
    !Number.isSafeInteger(frame.sequence) ||
    frame.sequence < 0
  ) {
    throw new NotezyAPIError(RealtimeError.InvalidFrameShape());
  }

  return {
    version: RealtimeProtocolVersion,
    type: frame.type,
    requestId:
      typeof frame.requestId === "string" ? frame.requestId : undefined,
    connectorChannelId: frame.connectorChannelId,
    sequence: frame.sequence,
  };
};
