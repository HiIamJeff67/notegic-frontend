import { RealtimeProtocolVersion } from "@shared/api/websocket/version";

export type RealtimePingFrame = {
  version: typeof RealtimeProtocolVersion;
  type: "ping";
  requestId: string;
};

export const encodeRealtimePingFrame = (
  requestId: string
): RealtimePingFrame => ({
  version: RealtimeProtocolVersion,
  type: "ping",
  requestId,
});
