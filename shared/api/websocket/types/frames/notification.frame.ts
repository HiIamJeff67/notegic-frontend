import { NotezyAPIError } from "@shared/api/exceptions";
import { RealtimeError } from "@shared/api/exceptions/client/realtime.exception";
import { RealtimeProtocolVersion } from "@shared/constants/version.constants";

export type RealtimeNotificationFrame = {
  version: typeof RealtimeProtocolVersion;
  type: "notification";
  eventId: string;
  notificationId: string;
  notificationType: string;
  priority: "low" | "normal" | "high" | "critical";
  templateKey: string;
  templateVersion: number;
  payload: Record<string, unknown>;
  createdAt: string;
  expiresAt: string | null;
};

const isDateString = (value: unknown): value is string =>
  typeof value === "string" && !Number.isNaN(Date.parse(value));

export const parseRealtimeNotificationFrame = (
  frame: Record<string, unknown>
): RealtimeNotificationFrame => {
  if (
    typeof frame.eventId !== "string" ||
    typeof frame.notificationId !== "string" ||
    typeof frame.notificationType !== "string" ||
    frame.notificationType.length === 0 ||
    !["low", "normal", "high", "critical"].includes(frame.priority as string) ||
    typeof frame.templateKey !== "string" ||
    typeof frame.templateVersion !== "number" ||
    !Number.isInteger(frame.templateVersion) ||
    frame.templateVersion < 1 ||
    typeof frame.payload !== "object" ||
    frame.payload === null ||
    Array.isArray(frame.payload) ||
    !isDateString(frame.createdAt) ||
    (frame.expiresAt !== null &&
      frame.expiresAt !== undefined &&
      !isDateString(frame.expiresAt))
  ) {
    throw new NotezyAPIError(RealtimeError.InvalidFrameShape());
  }

  return {
    version: RealtimeProtocolVersion,
    type: "notification",
    eventId: frame.eventId,
    notificationId: frame.notificationId,
    notificationType:
      frame.notificationType as RealtimeNotificationFrame["notificationType"],
    priority: frame.priority as RealtimeNotificationFrame["priority"],
    templateKey: frame.templateKey,
    templateVersion: frame.templateVersion,
    payload: frame.payload as Record<string, unknown>,
    createdAt: frame.createdAt,
    expiresAt: (frame.expiresAt as string | null | undefined) ?? null,
  };
};
