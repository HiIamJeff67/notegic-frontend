import type {
  CreateRoutineTaskDependencyByRoutineIdRequest,
  CreateRoutineTaskDependencyByRoutineIdResponse,
  DeleteRoutineTaskDependencyByRoutineIdRequest,
  DeleteRoutineTaskDependencyByRoutineIdResponse,
  GetRoutineTaskDependenciesByRoutineIdRequest,
  GetRoutineTaskDependenciesByRoutineIdResponse,
  UpdateRoutineTaskDependencyByRoutineIdRequest,
  UpdateRoutineTaskDependencyByRoutineIdResponse,
  UpdateRoutineTaskGraphByRoutineIdRequest,
  UpdateRoutineTaskGraphByRoutineIdResponse,
} from "@shared/api/interfaces/routineTaskDependency.interface";
import { APIURLPathDictionary, CurrentAPIBaseURL } from "@shared/lib/url/api";
import { getAccessToken } from "../tokens/accessToken";

export const GetRoutineTaskDependenciesByRoutineId = async (
  request: GetRoutineTaskDependenciesByRoutineIdRequest
): Promise<GetRoutineTaskDependenciesByRoutineIdResponse> => {
  const url =
    APIURLPathDictionary.origin() +
    "/" +
    CurrentAPIBaseURL +
    "/" +
    APIURLPathDictionary.routineTaskDependency.getByRoutineId(
      request.param.routineId
    );
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

  return (await response.json()) as GetRoutineTaskDependenciesByRoutineIdResponse;
};

export const CreateRoutineTaskDependencyByRoutineId = async (
  request: CreateRoutineTaskDependencyByRoutineIdRequest
): Promise<CreateRoutineTaskDependencyByRoutineIdResponse> => {
  const url =
    APIURLPathDictionary.origin() +
    "/" +
    CurrentAPIBaseURL +
    "/" +
    APIURLPathDictionary.routineTaskDependency.createByRoutineId(
      request.param.routineId
    );
  const response = await fetch(url, {
    method: "POST",
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
    body: JSON.stringify(request.body),
    credentials: "omit",
  });

  return (await response.json()) as CreateRoutineTaskDependencyByRoutineIdResponse;
};

export const UpdateRoutineTaskGraphByRoutineId = async (
  request: UpdateRoutineTaskGraphByRoutineIdRequest
): Promise<UpdateRoutineTaskGraphByRoutineIdResponse> => {
  const url =
    APIURLPathDictionary.origin() +
    "/" +
    CurrentAPIBaseURL +
    "/" +
    APIURLPathDictionary.routineTaskDependency.updateGraphByRoutineId(
      request.param.routineId
    );
  const response = await fetch(url, {
    method: "PUT",
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
    body: JSON.stringify(request.body),
    credentials: "omit",
  });
  return (await response.json()) as UpdateRoutineTaskGraphByRoutineIdResponse;
};

export const UpdateRoutineTaskDependencyByRoutineId = async (
  request: UpdateRoutineTaskDependencyByRoutineIdRequest
): Promise<UpdateRoutineTaskDependencyByRoutineIdResponse> => {
  const url =
    APIURLPathDictionary.origin() +
    "/" +
    CurrentAPIBaseURL +
    "/" +
    APIURLPathDictionary.routineTaskDependency.updateByRoutineId(
      request.param.routineId
    );
  const response = await fetch(url, {
    method: "PUT",
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
    body: JSON.stringify(request.body),
    credentials: "omit",
  });

  return (await response.json()) as UpdateRoutineTaskDependencyByRoutineIdResponse;
};

export const DeleteRoutineTaskDependencyByRoutineId = async (
  request: DeleteRoutineTaskDependencyByRoutineIdRequest
): Promise<DeleteRoutineTaskDependencyByRoutineIdResponse> => {
  const url =
    APIURLPathDictionary.origin() +
    "/" +
    CurrentAPIBaseURL +
    "/" +
    APIURLPathDictionary.routineTaskDependency.deleteByRoutineId(
      request.param.routineId
    );
  const response = await fetch(url, {
    method: "DELETE",
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
    body: JSON.stringify(request.body),
    credentials: "omit",
  });

  return (await response.json()) as DeleteRoutineTaskDependencyByRoutineIdResponse;
};
