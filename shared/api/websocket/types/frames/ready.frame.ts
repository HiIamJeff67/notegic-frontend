import { NotezyAPIError } from "@shared/api/exceptions";
import { RealtimeError } from "@shared/api/exceptions/client/realtime.exception";
import { RealtimeProtocolVersion } from "@shared/constants/version.constants";

export type RealtimeReadyFrame = {
  version: typeof RealtimeProtocolVersion;
  type: "ready";
  connectionId: string;
  resubscribeRequired: boolean;
};

export const parseRealtimeReadyFrame = (
  frame: Record<string, unknown>
): RealtimeReadyFrame => {
  if (typeof frame.connectionId !== "string") {
    throw new NotezyAPIError(RealtimeError.MissingReadyConnectionId());
  }
  if (typeof frame.resubscribeRequired !== "boolean") {
    throw new NotezyAPIError(RealtimeError.InvalidFrameShape());
  }

  return {
    version: RealtimeProtocolVersion,
    type: "ready",
    connectionId: frame.connectionId,
    resubscribeRequired: frame.resubscribeRequired,
  };
};
