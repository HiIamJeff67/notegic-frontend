import { NotezyAPIError } from "@shared/api/exceptions";
import { RealtimeError } from "@shared/api/exceptions/client/realtime.exception";
import { RealtimeProtocolVersion } from "@shared/constants/version.constants";

export type RealtimeRoutineTaskLifecycleStatus = "running" | "completed";

export type RealtimeRoutineTaskLifecycleFrame = {
  version: typeof RealtimeProtocolVersion;
  type: "routine-task-lifecycle";
  eventId: string;
  routineTaskId: string;
  routineTaskRecordId: string;
  routineId: string;
  purpose: string;
  status: RealtimeRoutineTaskLifecycleStatus;
  attempt: number;
  occurredAt: string;
};

const isDateString = (value: unknown): value is string =>
  typeof value === "string" && !Number.isNaN(Date.parse(value));

export const parseRealtimeRoutineTaskLifecycleFrame = (
  frame: Record<string, unknown>
): RealtimeRoutineTaskLifecycleFrame => {
  if (
    typeof frame.eventId !== "string" ||
    typeof frame.routineTaskId !== "string" ||
    typeof frame.routineTaskRecordId !== "string" ||
    typeof frame.routineId !== "string" ||
    typeof frame.purpose !== "string" ||
    frame.purpose.length === 0 ||
    !["running", "completed"].includes(frame.status as string) ||
    typeof frame.attempt !== "number" ||
    !Number.isInteger(frame.attempt) ||
    frame.attempt < 1 ||
    !isDateString(frame.occurredAt)
  ) {
    throw new NotezyAPIError(RealtimeError.InvalidFrameShape());
  }

  return {
    version: RealtimeProtocolVersion,
    type: "routine-task-lifecycle",
    eventId: frame.eventId,
    routineTaskId: frame.routineTaskId,
    routineTaskRecordId: frame.routineTaskRecordId,
    routineId: frame.routineId,
    purpose: frame.purpose,
    status: frame.status as RealtimeRoutineTaskLifecycleStatus,
    attempt: frame.attempt,
    occurredAt: frame.occurredAt,
  };
};
