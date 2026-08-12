import { NotezyAPIError } from "@shared/api/exceptions";
import { RealtimeError } from "@shared/api/exceptions/client/realtime.exception";
import { RealtimeProtocolVersion } from "@shared/constants/version.constants";
import { parseRealtimeAckFrame, type RealtimeAckFrame } from "./ack.frame";
import {
  parseRealtimeErrorFrame,
  type RealtimeErrorFrame,
} from "./error.frame";
import {
  parseRealtimeHeartbeatFrame,
  type RealtimeHeartbeatFrame,
} from "./heartbeat.frame";
import { parseRealtimePongFrame, type RealtimePongFrame } from "./pong.frame";
import {
  parseRealtimePresenceFrame,
  type RealtimePresenceFrame,
} from "./presence.frame";
import {
  parseRealtimeNotificationFrame,
  type RealtimeNotificationFrame,
} from "./notification.frame";
import {
  parseRealtimeReadyFrame,
  type RealtimeReadyFrame,
} from "./ready.frame";
import {
  parseRealtimeResourceEventFrame,
  type RealtimeResourceEventFrame,
} from "./resourceEvent.frame";
import {
  parseRealtimeSubscribedFrame,
  type RealtimeSubscribedFrame,
} from "./subscribed.frame";
import {
  parseRealtimeUnsubscribedFrame,
  type RealtimeUnsubscribedFrame,
} from "./unsubscribed.frame";

export type RealtimeServerFrame =
  | RealtimeReadyFrame
  | RealtimePongFrame
  | RealtimeErrorFrame
  | RealtimeSubscribedFrame
  | RealtimeUnsubscribedFrame
  | RealtimeHeartbeatFrame
  | RealtimeAckFrame
  | RealtimePresenceFrame
  | RealtimeResourceEventFrame
  | RealtimeNotificationFrame;

export const parseRealtimeServerFrame = (data: string): RealtimeServerFrame => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(data);
  } catch {
    throw new NotezyAPIError(RealtimeError.InvalidJsonFrame());
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new NotezyAPIError(RealtimeError.InvalidFrameShape());
  }
  const frame = parsed as Record<string, unknown>;

  if (frame.version !== RealtimeProtocolVersion) {
    throw new NotezyAPIError(RealtimeError.UnsupportedProtocolVersion());
  }
  if (typeof frame.type !== "string") {
    throw new NotezyAPIError(RealtimeError.MissingFrameType());
  }

  switch (frame.type) {
    case "ready":
      return parseRealtimeReadyFrame(frame);
    case "resource-event":
      return parseRealtimeResourceEventFrame(frame);
    case "notification":
      return parseRealtimeNotificationFrame(frame);
    case "presence-joined":
    case "presence-left":
    case "presence-updated":
      return parseRealtimePresenceFrame(frame);
    case "pong":
      return parseRealtimePongFrame(frame);
    case "error":
      return parseRealtimeErrorFrame(frame);
    case "subscribed":
      return parseRealtimeSubscribedFrame(frame);
    case "unsubscribed":
      return parseRealtimeUnsubscribedFrame(frame);
    case "heartbeat":
      return parseRealtimeHeartbeatFrame(frame);
    case "ack":
    case "acknowledged":
      return parseRealtimeAckFrame(frame);
    default:
      throw new NotezyAPIError(RealtimeError.UnsupportedFrameType(frame.type));
  }
};
