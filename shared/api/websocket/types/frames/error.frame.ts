import { NotezyAPIError } from "@shared/api/exceptions";
import { RealtimeError } from "@shared/api/exceptions/client/realtime.exception";
import { RealtimeProtocolVersion } from "@shared/constants/version.constants";
import type { RealtimeErrorCode } from "../errorCode.type";

export type RealtimeErrorFrame = {
  version: typeof RealtimeProtocolVersion;
  type: "error";
  requestId?: string;
  code: RealtimeErrorCode | string;
  message: string;
  channelId?: string;
  channelType?: string;
  connectorChannelId?: number;
};

export const parseRealtimeErrorFrame = (
  frame: Record<string, unknown>
): RealtimeErrorFrame => {
  if (typeof frame.code !== "string" || typeof frame.message !== "string") {
    throw new NotezyAPIError(RealtimeError.MissingErrorFrameFields());
  }

  return {
    version: RealtimeProtocolVersion,
    type: "error",
    requestId:
      typeof frame.requestId === "string" ? frame.requestId : undefined,
    code: frame.code,
    message: frame.message,
    channelId:
      typeof frame.channelId === "string" ? frame.channelId : undefined,
    channelType:
      typeof frame.channelType === "string" ? frame.channelType : undefined,
    connectorChannelId:
      typeof frame.connectorChannelId === "number" &&
      Number.isInteger(frame.connectorChannelId) &&
      frame.connectorChannelId >= 0
        ? frame.connectorChannelId
        : undefined,
  };
};
