import type {
  CreateRoutineTagRequest,
  CreateRoutineTagResponse,
  CreateRoutineTagsRequest,
  CreateRoutineTagsResponse,
  GetAllMyRoutineTagsRequest,
  GetAllMyRoutineTagsResponse,
  GetMyRoutineTagByIdRequest,
  GetMyRoutineTagByIdResponse,
  HardDeleteMyRoutineTagByIdRequest,
  HardDeleteMyRoutineTagByIdResponse,
  HardDeleteMyRoutineTagsByIdsRequest,
  HardDeleteMyRoutineTagsByIdsResponse,
  UpdateMyRoutineTagByIdRequest,
  UpdateMyRoutineTagByIdResponse,
  UpdateMyRoutineTagsByIdsRequest,
  UpdateMyRoutineTagsByIdsResponse,
} from "@shared/api/interfaces/routineTag.interface";
import { APIURLPathDictionary, CurrentAPIBaseURL } from "@shared/lib/url/api";
import { getAccessToken } from "../tokens/accessToken";
import { withoutPathParams } from "./helpers/body";

export const GetMyRoutineTagById = async (
  request: GetMyRoutineTagByIdRequest
): Promise<GetMyRoutineTagByIdResponse> => {
  const params = new URLSearchParams(
    Object.entries(request.param || {}).reduce<Record<string, string>>(
      (acc, [key, value]) => {
        if (key !== "routineTagId" && value !== undefined && value !== null)
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
    APIURLPathDictionary.routineTag.getMyRoutineTagById(
      request.param.routineTagId
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

  return (await response.json()) as GetMyRoutineTagByIdResponse;
};

export const GetAllMyRoutineTags = async (
  request: GetAllMyRoutineTagsRequest
): Promise<GetAllMyRoutineTagsResponse> => {
  const params = new URLSearchParams({
    areDeleted: String(request.param?.areDeleted ?? false),
  });
  const url =
    APIURLPathDictionary.origin() +
    "/" +
    CurrentAPIBaseURL +
    "/" +
    APIURLPathDictionary.routineTag.getAllMyRoutineTags +
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

  return (await response.json()) as GetAllMyRoutineTagsResponse;
};

export const CreateRoutineTag = async (
  request: CreateRoutineTagRequest
): Promise<CreateRoutineTagResponse> => {
  const url =
    APIURLPathDictionary.origin() +
    "/" +
    CurrentAPIBaseURL +
    "/" +
    APIURLPathDictionary.routineTag.createRoutineTag;
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown");
  const response = await fetch(url, {
    method: "POST",
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

  return (await response.json()) as CreateRoutineTagResponse;
};

export const CreateRoutineTags = async (
  request: CreateRoutineTagsRequest
): Promise<CreateRoutineTagsResponse> => {
  const url =
    APIURLPathDictionary.origin() +
    "/" +
    CurrentAPIBaseURL +
    "/" +
    APIURLPathDictionary.routineTag.createRoutineTags;
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown");
  const response = await fetch(url, {
    method: "POST",
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

  return (await response.json()) as CreateRoutineTagsResponse;
};

export const UpdateMyRoutineTagById = async (
  request: UpdateMyRoutineTagByIdRequest
): Promise<UpdateMyRoutineTagByIdResponse> => {
  const url =
    APIURLPathDictionary.origin() +
    "/" +
    CurrentAPIBaseURL +
    "/" +
    APIURLPathDictionary.routineTag.updateMyRoutineTagById(
      request.body.routineTagId
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
    body: JSON.stringify(withoutPathParams(request.body, "routineTagId")),
    credentials: "omit",
  });

  return (await response.json()) as UpdateMyRoutineTagByIdResponse;
};

export const UpdateMyRoutineTagsByIds = async (
  request: UpdateMyRoutineTagsByIdsRequest
): Promise<UpdateMyRoutineTagsByIdsResponse> => {
  const url =
    APIURLPathDictionary.origin() +
    "/" +
    CurrentAPIBaseURL +
    "/" +
    APIURLPathDictionary.routineTag.updateMyRoutineTagsByIds;
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
    body: JSON.stringify(request.body),
    credentials: "omit",
  });

  return (await response.json()) as UpdateMyRoutineTagsByIdsResponse;
};

export const HardDeleteMyRoutineTagById = async (
  request: HardDeleteMyRoutineTagByIdRequest
): Promise<HardDeleteMyRoutineTagByIdResponse> => {
  const url =
    APIURLPathDictionary.origin() +
    "/" +
    CurrentAPIBaseURL +
    "/" +
    APIURLPathDictionary.routineTag.hardDeleteMyRoutineTagById(
      request.body.routineTagId
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
    body: JSON.stringify(withoutPathParams(request.body, "routineTagId")),
    credentials: "omit",
  });

  return (await response.json()) as HardDeleteMyRoutineTagByIdResponse;
};

export const HardDeleteMyRoutineTagsByIds = async (
  request: HardDeleteMyRoutineTagsByIdsRequest
): Promise<HardDeleteMyRoutineTagsByIdsResponse> => {
  const url =
    APIURLPathDictionary.origin() +
    "/" +
    CurrentAPIBaseURL +
    "/" +
    APIURLPathDictionary.routineTag.hardDeleteMyRoutineTagsByIds;
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

  return (await response.json()) as HardDeleteMyRoutineTagsByIdsResponse;
};
