import { NotegicAPIError } from "@shared/api/exceptions";
import { RealtimeError } from "@shared/api/exceptions/client/realtime.exception";
import { RealtimeProtocolVersion } from "@shared/constants/version.constants";

export type RealtimeHeartbeatFrame = {
  version: typeof RealtimeProtocolVersion;
  type: "heartbeat";
  requestId?: string;
  unixMilliNow: number;
};

export const parseRealtimeHeartbeatFrame = (
  frame: Record<string, unknown>
): RealtimeHeartbeatFrame => {
  if (
    typeof frame.unixMilliNow !== "number" ||
    !Number.isSafeInteger(frame.unixMilliNow)
  ) {
    throw new NotegicAPIError(RealtimeError.InvalidFrameShape());
  }

  return {
    version: RealtimeProtocolVersion,
    type: "heartbeat",
    requestId:
      typeof frame.requestId === "string" ? frame.requestId : undefined,
    unixMilliNow: frame.unixMilliNow,
  };
};
