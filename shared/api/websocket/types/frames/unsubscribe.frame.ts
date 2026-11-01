import { RealtimeProtocolVersion } from "@shared/api/websocket/version";

export type RealtimeUnsubscribeFrame = {
  version: typeof RealtimeProtocolVersion;
  type: "unsubscribe";
  requestId: string;
  connectorChannelId: number;
};

export const encodeRealtimeUnsubscribeFrame = ({
  requestId,
  connectorChannelId,
}: Omit<RealtimeUnsubscribeFrame, "version" | "type">) => ({
  version: RealtimeProtocolVersion,
  type: "unsubscribe",
  requestId,
  connectorChannelId,
});
