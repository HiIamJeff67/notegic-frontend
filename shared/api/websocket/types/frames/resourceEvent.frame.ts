import { NotezyAPIError } from "@shared/api/exceptions";
import { RealtimeError } from "@shared/api/exceptions/client/realtime.exception";
import { RealtimeProtocolVersion } from "@shared/constants/version.constants";

export const RealtimeResourceEventType = {
  RootShelfPermissionChanged: "RootShelfPermissionChanged",
  RootShelfPermissionRevoked: "RootShelfPermissionRevoked",
  RootShelfDeleted: "RootShelfDeleted",
  BlockPackChanged: "BlockPackChanged",
  BlockPackDeleted: "BlockPackDeleted",
} as const;

export type RealtimeResourceEventType =
  (typeof RealtimeResourceEventType)[keyof typeof RealtimeResourceEventType];

export type RealtimeResourceEventChange =
  | "permission_updated"
  | "permission_revoked"
  | "updated"
  | "deleted";

export type RealtimeResourceEventFrame = {
  version: typeof RealtimeProtocolVersion;
  type: "resource-event";
  eventId: string;
  eventType: RealtimeResourceEventType;
  resourceId: string;
  targetUserPublicId?: string;
  change: RealtimeResourceEventChange;
  permission?: string;
};

export const parseRealtimeResourceEventFrame = (
  frame: Record<string, unknown>
): RealtimeResourceEventFrame => {
  const eventType = Object.values(RealtimeResourceEventType).find(
    value => value === frame.eventType
  );
  const change = [
    "permission_updated",
    "permission_revoked",
    "updated",
    "deleted",
  ].find(value => value === frame.change) as
    | RealtimeResourceEventChange
    | undefined;
  if (
    typeof frame.eventId !== "string" ||
    eventType === undefined ||
    typeof frame.resourceId !== "string" ||
    change === undefined ||
    (frame.targetUserPublicId !== undefined &&
      typeof frame.targetUserPublicId !== "string")
  ) {
    throw new NotezyAPIError(RealtimeError.InvalidFrameShape());
  }

  if (
    frame.permission !== undefined &&
    (typeof frame.permission !== "string" || frame.permission.length === 0)
  ) {
    throw new NotezyAPIError(RealtimeError.InvalidFrameShape());
  }

  return {
    version: RealtimeProtocolVersion,
    type: "resource-event",
    eventId: frame.eventId,
    eventType,
    resourceId: frame.resourceId,
    targetUserPublicId:
      typeof frame.targetUserPublicId === "string"
        ? frame.targetUserPublicId
        : undefined,
    change,
    permission: frame.permission as string | undefined,
  };
};
