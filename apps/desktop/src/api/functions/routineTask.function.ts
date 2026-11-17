import type {
  CreateRoutineTaskByRoutineIdRequest,
  CreateRoutineTaskByRoutineIdResponse,
  GetAllMyRoutineTasksRequest,
  GetAllMyRoutineTasksResponse,
  GetMyRoutineTaskByIdRequest,
  GetMyRoutineTaskByIdResponse,
  GetMyRoutineTasksByRoutineIdRequest,
  GetMyRoutineTasksByRoutineIdResponse,
  HardDeleteMyRoutineTaskByIdRequest,
  HardDeleteMyRoutineTaskByIdResponse,
  HardDeleteMyRoutineTasksByIdsRequest,
  HardDeleteMyRoutineTasksByIdsResponse,
  UpdateMyRoutineTaskByIdRequest,
  UpdateMyRoutineTaskByIdResponse,
  VisualizeMyRoutineTaskPurposeCountRequest,
  VisualizeMyRoutineTaskPurposeCountResponse,
} from "@shared/api/interfaces/routineTask.interface";
import { APIURLPathDictionary, CurrentAPIBaseURL } from "@shared/lib/url/api";
import { getAccessToken } from "../tokens/accessToken";
import { withoutPathParams } from "./helpers/body";

export const VisualizeMyRoutineTaskPurposeCount = async (
  request: VisualizeMyRoutineTaskPurposeCountRequest
): Promise<VisualizeMyRoutineTaskPurposeCountResponse> => {
  const path =
    APIURLPathDictionary.routineTask.visualizeMyRoutineTaskPurposeCount;
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
  return (await response.json()) as VisualizeMyRoutineTaskPurposeCountResponse;
};

export const GetMyRoutineTaskById = async (
  request: GetMyRoutineTaskByIdRequest
): Promise<GetMyRoutineTaskByIdResponse> => {
  const params = new URLSearchParams(
    Object.entries(request.param || {}).reduce<Record<string, string>>(
      (acc, [key, value]) => {
        if (key !== "routineTaskId" && value !== undefined && value !== null)
          acc[key] = String(value);
        return acc;
      },
      {}
    )
  );
  if (request.param?.isDeleted === undefined) {
    params.set("isDeleted", "false");
  }
  const query = params.toString();
  const url =
    APIURLPathDictionary.origin() +
    "/" +
    CurrentAPIBaseURL +
    "/" +
    APIURLPathDictionary.routineTask.getMyRoutineTaskById(
      request.param.routineTaskId
    ) +
    "?" +
    query;
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown");
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

  return (await response.json()) as GetMyRoutineTaskByIdResponse;
};

export const GetMyRoutineTasksByRoutineId = async (
  request: GetMyRoutineTasksByRoutineIdRequest
): Promise<GetMyRoutineTasksByRoutineIdResponse> => {
  const params = new URLSearchParams({
    areDeleted: String(request.param.areDeleted ?? false),
  });
  const url =
    APIURLPathDictionary.origin() +
    "/" +
    CurrentAPIBaseURL +
    "/" +
    APIURLPathDictionary.routineTask.getMyRoutineTasksByRoutineId(
      request.param.routineId
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

  return (await response.json()) as GetMyRoutineTasksByRoutineIdResponse;
};

export const GetAllMyRoutineTasks = async (
  request: GetAllMyRoutineTasksRequest
): Promise<GetAllMyRoutineTasksResponse> => {
  const params = new URLSearchParams({
    areDeleted: String(request.param?.areDeleted ?? false),
  });
  const url =
    APIURLPathDictionary.origin() +
    "/" +
    CurrentAPIBaseURL +
    "/" +
    APIURLPathDictionary.routineTask.getAllMyRoutineTasks +
    "?" +
    params.toString();
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown");
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

  return (await response.json()) as GetAllMyRoutineTasksResponse;
};

export const CreateRoutineTaskByRoutineId = async (
  request: CreateRoutineTaskByRoutineIdRequest
): Promise<CreateRoutineTaskByRoutineIdResponse> => {
  const url =
    APIURLPathDictionary.origin() +
    "/" +
    CurrentAPIBaseURL +
    "/" +
    APIURLPathDictionary.routineTask.createRoutineTaskByRoutineId(
      request.body.routineId
    );
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown") ??
    "unknown";
  const response = await fetch(url, {
    method: "POST",
    headers: {
      ...(getAccessToken()
        ? { Authorization: `Bearer ${getAccessToken()}` }
        : {}),
      "Content-Type": "application/json",
      "User-Agent": userAgent,
    },
    body: JSON.stringify(withoutPathParams(request.body, "routineId")),
    credentials: "omit",
  });

  return (await response.json()) as CreateRoutineTaskByRoutineIdResponse;
};

export const UpdateMyRoutineTaskById = async (
  request: UpdateMyRoutineTaskByIdRequest
): Promise<UpdateMyRoutineTaskByIdResponse> => {
  const url =
    APIURLPathDictionary.origin() +
    "/" +
    CurrentAPIBaseURL +
    "/" +
    APIURLPathDictionary.routineTask.updateMyRoutineTaskById(
      request.body.routineTaskId
    );
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown") ??
    "unknown";
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      ...(getAccessToken()
        ? { Authorization: `Bearer ${getAccessToken()}` }
        : {}),
      "Content-Type": "application/json",
      "User-Agent": userAgent,
    },
    body: JSON.stringify(withoutPathParams(request.body, "routineTaskId")),
    credentials: "omit",
  });

  return (await response.json()) as UpdateMyRoutineTaskByIdResponse;
};

export const HardDeleteMyRoutineTaskById = async (
  request: HardDeleteMyRoutineTaskByIdRequest
): Promise<HardDeleteMyRoutineTaskByIdResponse> => {
  const url =
    APIURLPathDictionary.origin() +
    "/" +
    CurrentAPIBaseURL +
    "/" +
    APIURLPathDictionary.routineTask.hardDeleteMyRoutineTaskById(
      request.body.routineTaskId
    );
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown") ??
    "unknown";
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      ...(getAccessToken()
        ? { Authorization: `Bearer ${getAccessToken()}` }
        : {}),
      "Content-Type": "application/json",
      "User-Agent": userAgent,
    },
    body: JSON.stringify(withoutPathParams(request.body, "routineTaskId")),
    credentials: "omit",
  });

  return (await response.json()) as HardDeleteMyRoutineTaskByIdResponse;
};

export const HardDeleteMyRoutineTasksByIds = async (
  request: HardDeleteMyRoutineTasksByIdsRequest
): Promise<HardDeleteMyRoutineTasksByIdsResponse> => {
  const url =
    APIURLPathDictionary.origin() +
    "/" +
    CurrentAPIBaseURL +
    "/" +
    APIURLPathDictionary.routineTask.hardDeleteMyRoutineTasksByIds;
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown") ??
    "unknown";
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      ...(getAccessToken()
        ? { Authorization: `Bearer ${getAccessToken()}` }
        : {}),
      "Content-Type": "application/json",
      "User-Agent": userAgent,
    },
    body: JSON.stringify(request.body),
    credentials: "omit",
  });

  return (await response.json()) as HardDeleteMyRoutineTasksByIdsResponse;
};
