import type {
  GetMyRoutineTaskRecordsByRoutineTaskIdRequest,
  GetMyRoutineTaskRecordsByRoutineTaskIdResponse,
  VisualizeMyRoutineTaskRecordActualEndedAtCountRequest,
  VisualizeMyRoutineTaskRecordActualEndedAtCountResponse,
  VisualizeMyRoutineTaskRecordActualStartedAtCountRequest,
  VisualizeMyRoutineTaskRecordActualStartedAtCountResponse,
  VisualizeMyRoutineTaskRecordPurposeCountRequest,
  VisualizeMyRoutineTaskRecordPurposeCountResponse,
  VisualizeMyRoutineTaskRecordScheduledAtCountRequest,
  VisualizeMyRoutineTaskRecordScheduledAtCountResponse,
  VisualizeMyRoutineTaskRecordStatusCountRequest,
  VisualizeMyRoutineTaskRecordStatusCountResponse,
} from "@shared/api/interfaces/routineTaskRecord.interface";
import { APIURLPathDictionary, CurrentAPIBaseURL } from "@shared/lib/url/api";
import { getAccessToken } from "../tokens/accessToken";

export const VisualizeMyRoutineTaskRecordStatusCount = async (
  request: VisualizeMyRoutineTaskRecordStatusCountRequest
): Promise<VisualizeMyRoutineTaskRecordStatusCountResponse> => {
  const path =
    APIURLPathDictionary.routineTaskRecord
      .visualizeMyRoutineTaskRecordStatusCount;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(request.param) as [
    string,
    unknown,
  ][]) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      for (const entry of value) {
        params.append(
          key,
          entry instanceof Date ? entry.toISOString() : String(entry)
        );
      }
      continue;
    }
    params.set(
      key,
      value instanceof Date ? value.toISOString() : String(value)
    );
  }
  const url =
    APIURLPathDictionary.origin() +
    "/" +
    CurrentAPIBaseURL +
    "/" +
    path +
    "?" +
    params.toString();
  const response = await fetch(url, {
    method: "GET",
    headers: {
      ...(getAccessToken()
        ? { Authorization: `Bearer ${getAccessToken()}` }
        : {}),
      "Content-Type": "application/json",
      "User-Agent":
        request.header?.userAgent ??
        (typeof navigator !== "undefined" ? navigator.userAgent : "unknown") ??
        "unknown",
    },
    credentials: "omit",
  });
  return (await response.json()) as VisualizeMyRoutineTaskRecordStatusCountResponse;
};

export const VisualizeMyRoutineTaskRecordPurposeCount = async (
  request: VisualizeMyRoutineTaskRecordPurposeCountRequest
): Promise<VisualizeMyRoutineTaskRecordPurposeCountResponse> => {
  const path =
    APIURLPathDictionary.routineTaskRecord
      .visualizeMyRoutineTaskRecordPurposeCount;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(request.param) as [
    string,
    unknown,
  ][]) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      for (const entry of value) {
        params.append(
          key,
          entry instanceof Date ? entry.toISOString() : String(entry)
        );
      }
      continue;
    }
    params.set(
      key,
      value instanceof Date ? value.toISOString() : String(value)
    );
  }
  const url =
    APIURLPathDictionary.origin() +
    "/" +
    CurrentAPIBaseURL +
    "/" +
    path +
    "?" +
    params.toString();
  const response = await fetch(url, {
    method: "GET",
    headers: {
      ...(getAccessToken()
        ? { Authorization: `Bearer ${getAccessToken()}` }
        : {}),
      "Content-Type": "application/json",
      "User-Agent":
        request.header?.userAgent ??
        (typeof navigator !== "undefined" ? navigator.userAgent : "unknown") ??
        "unknown",
    },
    credentials: "omit",
  });
  return (await response.json()) as VisualizeMyRoutineTaskRecordPurposeCountResponse;
};

export const VisualizeMyRoutineTaskRecordScheduledAtCount = async (
  request: VisualizeMyRoutineTaskRecordScheduledAtCountRequest
): Promise<VisualizeMyRoutineTaskRecordScheduledAtCountResponse> => {
  const path =
    APIURLPathDictionary.routineTaskRecord
      .visualizeMyRoutineTaskRecordScheduledAtCount;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(request.param) as [
    string,
    unknown,
  ][]) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      for (const entry of value) {
        params.append(
          key,
          entry instanceof Date ? entry.toISOString() : String(entry)
        );
      }
      continue;
    }
    params.set(
      key,
      value instanceof Date ? value.toISOString() : String(value)
    );
  }
  const url =
    APIURLPathDictionary.origin() +
    "/" +
    CurrentAPIBaseURL +
    "/" +
    path +
    "?" +
    params.toString();
  const response = await fetch(url, {
    method: "GET",
    headers: {
      ...(getAccessToken()
        ? { Authorization: `Bearer ${getAccessToken()}` }
        : {}),
      "Content-Type": "application/json",
      "User-Agent":
        request.header?.userAgent ??
        (typeof navigator !== "undefined" ? navigator.userAgent : "unknown") ??
        "unknown",
    },
    credentials: "omit",
  });
  return (await response.json()) as VisualizeMyRoutineTaskRecordScheduledAtCountResponse;
};

export const VisualizeMyRoutineTaskRecordActualStartedAtCount = async (
  request: VisualizeMyRoutineTaskRecordActualStartedAtCountRequest
): Promise<VisualizeMyRoutineTaskRecordActualStartedAtCountResponse> => {
  const path =
    APIURLPathDictionary.routineTaskRecord
      .visualizeMyRoutineTaskRecordActualStartedAtCount;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(request.param) as [
    string,
    unknown,
  ][]) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      for (const entry of value) {
        params.append(
          key,
          entry instanceof Date ? entry.toISOString() : String(entry)
        );
      }
      continue;
    }
    params.set(
      key,
      value instanceof Date ? value.toISOString() : String(value)
    );
  }
  const url =
    APIURLPathDictionary.origin() +
    "/" +
    CurrentAPIBaseURL +
    "/" +
    path +
    "?" +
    params.toString();
  const response = await fetch(url, {
    method: "GET",
    headers: {
      ...(getAccessToken()
        ? { Authorization: `Bearer ${getAccessToken()}` }
        : {}),
      "Content-Type": "application/json",
      "User-Agent":
        request.header?.userAgent ??
        (typeof navigator !== "undefined" ? navigator.userAgent : "unknown") ??
        "unknown",
    },
    credentials: "omit",
  });
  return (await response.json()) as VisualizeMyRoutineTaskRecordActualStartedAtCountResponse;
};

export const VisualizeMyRoutineTaskRecordActualEndedAtCount = async (
  request: VisualizeMyRoutineTaskRecordActualEndedAtCountRequest
): Promise<VisualizeMyRoutineTaskRecordActualEndedAtCountResponse> => {
  const path =
    APIURLPathDictionary.routineTaskRecord
      .visualizeMyRoutineTaskRecordActualEndedAtCount;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(request.param) as [
    string,
    unknown,
  ][]) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      for (const entry of value) {
        params.append(
          key,
          entry instanceof Date ? entry.toISOString() : String(entry)
        );
      }
      continue;
    }
    params.set(
      key,
      value instanceof Date ? value.toISOString() : String(value)
    );
  }
  const url =
    APIURLPathDictionary.origin() +
    "/" +
    CurrentAPIBaseURL +
    "/" +
    path +
    "?" +
    params.toString();
  const response = await fetch(url, {
    method: "GET",
    headers: {
      ...(getAccessToken()
        ? { Authorization: `Bearer ${getAccessToken()}` }
        : {}),
      "Content-Type": "application/json",
      "User-Agent":
        request.header?.userAgent ??
        (typeof navigator !== "undefined" ? navigator.userAgent : "unknown") ??
        "unknown",
    },
    credentials: "omit",
  });
  return (await response.json()) as VisualizeMyRoutineTaskRecordActualEndedAtCountResponse;
};

export const GetMyRoutineTaskRecordsByRoutineTaskId = async (
  request: GetMyRoutineTaskRecordsByRoutineTaskIdRequest
): Promise<GetMyRoutineTaskRecordsByRoutineTaskIdResponse> => {
  const params = new URLSearchParams();
  if (request.param.limit !== undefined) {
    params.set("limit", String(request.param.limit));
  }
  const url =
    APIURLPathDictionary.origin() +
    "/" +
    CurrentAPIBaseURL +
    "/" +
    APIURLPathDictionary.routineTaskRecord.getMyRoutineTaskRecordsByRoutineTaskId(
      request.param.routineTaskId
    ) +
    "?" +
    params.toString();
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown") ??
    "unknown";
  const response = await fetch(url, {
    method: "GET",
    headers: {
      ...(getAccessToken()
        ? { Authorization: `Bearer ${getAccessToken()}` }
        : {}),
      "Content-Type": "application/json",
      "User-Agent": userAgent,
    },
    credentials: "omit",
  });

  return (await response.json()) as GetMyRoutineTaskRecordsByRoutineTaskIdResponse;
};
