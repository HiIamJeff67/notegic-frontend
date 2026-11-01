import { RealtimeProtocolVersion } from "@shared/api/websocket/version";

export type RealtimeSubscribeFrame = {
  version: typeof RealtimeProtocolVersion;
  type: "subscribe";
  requestId: string;
  channelType: "BlockPack";
  channelId: string;
  channelTicket: string;
};

export const encodeRealtimeSubscribeFrame = ({
  requestId,
  channelId,
  channelTicket,
}: Omit<RealtimeSubscribeFrame, "version" | "type" | "channelType">) => ({
  version: RealtimeProtocolVersion,
  type: "subscribe",
  requestId,
  channelType: "BlockPack",
  channelId,
  channelTicket,
});
