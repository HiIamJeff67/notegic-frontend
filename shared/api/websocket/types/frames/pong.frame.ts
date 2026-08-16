import { NotegicAPIError } from "@shared/api/exceptions";
import { RealtimeError } from "@shared/api/exceptions/client/realtime.exception";
import { RealtimeProtocolVersion } from "@shared/constants/version.constants";

export type RealtimePongFrame = {
  version: typeof RealtimeProtocolVersion;
  type: "pong";
  requestId: string;
};

export const parseRealtimePongFrame = (
  frame: Record<string, unknown>
): RealtimePongFrame => {
  if (typeof frame.requestId !== "string") {
    throw new NotegicAPIError(RealtimeError.MissingPongRequestId());
  }

  return {
    version: RealtimeProtocolVersion,
    type: "pong",
    requestId: frame.requestId,
  };
};
