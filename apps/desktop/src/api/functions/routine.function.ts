import type {
  CreateRoutineByStationIdRequest,
  CreateRoutineByStationIdResponse,
  CreateRoutinesByStationIdsRequest,
  CreateRoutinesByStationIdsResponse,
  DeleteMyRoutineByIdRequest,
  DeleteMyRoutineByIdResponse,
  DeleteMyRoutinesByIdsRequest,
  DeleteMyRoutinesByIdsResponse,
  GetMyRoutineByIdRequest,
  GetMyRoutineByIdResponse,
  GetMyRoutinesByStationIdRequest,
  GetMyRoutinesByStationIdResponse,
  GetMyRoutinesByTimeRangeRequest,
  GetMyRoutinesByTimeRangeResponse,
  HardDeleteMyRoutineByIdRequest,
  HardDeleteMyRoutineByIdResponse,
  HardDeleteMyRoutinesByIdsRequest,
  HardDeleteMyRoutinesByIdsResponse,
  LinkRoutineItemByIdRequest,
  LinkRoutineItemByIdResponse,
  LinkRoutineItemsByIdsRequest,
  LinkRoutineItemsByIdsResponse,
  LinkRoutineTagByIdRequest,
  LinkRoutineTagByIdResponse,
  LinkRoutineTagsByIdsRequest,
  LinkRoutineTagsByIdsResponse,
  LinkRoutineTaskByIdRequest,
  LinkRoutineTaskByIdResponse,
  LinkRoutineTasksByIdsRequest,
  LinkRoutineTasksByIdsResponse,
  RestoreMyRoutineByIdRequest,
  RestoreMyRoutineByIdResponse,
  RestoreMyRoutinesByIdsRequest,
  RestoreMyRoutinesByIdsResponse,
  UpdateMyRoutineByIdRequest,
  UpdateMyRoutineByIdResponse,
  UpdateMyRoutinesByIdsRequest,
  UpdateMyRoutinesByIdsResponse,
  VisualizeMyRoutinePeriodCountRequest,
  VisualizeMyRoutinePeriodCountResponse,
  VisualizeMyRoutineScheduledEndAtCountRequest,
  VisualizeMyRoutineScheduledEndAtCountResponse,
  VisualizeMyRoutineScheduledStartAtCountRequest,
  VisualizeMyRoutineScheduledStartAtCountResponse,
  VisualizeMyRoutineStatusCountRequest,
  VisualizeMyRoutineStatusCountResponse,
} from "@shared/api/interfaces/routine.interface";
import { APIURLPathDictionary, CurrentAPIBaseURL } from "@shared/lib/url/api";
import { getAccessToken } from "../tokens/accessToken";
import { withoutPathParams } from "./helpers/body";

export const VisualizeMyRoutineStatusCount = async (
  request: VisualizeMyRoutineStatusCountRequest
): Promise<VisualizeMyRoutineStatusCountResponse> => {
  const path = APIURLPathDictionary.routine.visualizeMyRoutineStatusCount;
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
  return (await response.json()) as VisualizeMyRoutineStatusCountResponse;
};

export const VisualizeMyRoutinePeriodCount = async (
  request: VisualizeMyRoutinePeriodCountRequest
): Promise<VisualizeMyRoutinePeriodCountResponse> => {
  const path = APIURLPathDictionary.routine.visualizeMyRoutinePeriodCount;
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
  return (await response.json()) as VisualizeMyRoutinePeriodCountResponse;
};

export const VisualizeMyRoutineScheduledStartAtCount = async (
  request: VisualizeMyRoutineScheduledStartAtCountRequest
): Promise<VisualizeMyRoutineScheduledStartAtCountResponse> => {
  const path =
    APIURLPathDictionary.routine.visualizeMyRoutineScheduledStartAtCount;
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
  return (await response.json()) as VisualizeMyRoutineScheduledStartAtCountResponse;
};

export const VisualizeMyRoutineScheduledEndAtCount = async (
  request: VisualizeMyRoutineScheduledEndAtCountRequest
): Promise<VisualizeMyRoutineScheduledEndAtCountResponse> => {
  const path =
    APIURLPathDictionary.routine.visualizeMyRoutineScheduledEndAtCount;
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
  return (await response.json()) as VisualizeMyRoutineScheduledEndAtCountResponse;
};

export const GetMyRoutineById = async (
  request: GetMyRoutineByIdRequest
): Promise<GetMyRoutineByIdResponse> => {
  const params = new URLSearchParams(
    Object.entries(request.param || {}).reduce<Record<string, string>>(
      (acc, [key, value]) => {
        if (key !== "routineId" && value !== undefined && value !== null)
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
    APIURLPathDictionary.routine.getMyRoutineById(request.param.routineId) +
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

  return (await response.json()) as GetMyRoutineByIdResponse;
};

export const GetMyRoutinesByStationId = async (
  request: GetMyRoutinesByStationIdRequest
): Promise<GetMyRoutinesByStationIdResponse> => {
  const params = new URLSearchParams(
    Object.entries(request.param || {}).reduce<Record<string, string>>(
      (acc, [key, value]) => {
        if (key !== "stationId" && value !== undefined && value !== null)
          acc[key] = String(value);
        return acc;
      },
      {}
    )
  );
  if (request.param?.areDeleted === undefined) {
    params.set("areDeleted", "false");
  }
  const url =
    APIURLPathDictionary.origin() +
    "/" +
    CurrentAPIBaseURL +
    "/" +
    APIURLPathDictionary.routine.getMyRoutinesByStationId(
      request.param.stationId
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

  return (await response.json()) as GetMyRoutinesByStationIdResponse;
};

export const GetMyRoutinesByTimeRange = async (
  request: GetMyRoutinesByTimeRangeRequest
): Promise<GetMyRoutinesByTimeRangeResponse> => {
  const params = new URLSearchParams();
  params.set(
    "from",
    new Date(request.param.from as string | number | Date).toISOString()
  );
  params.set(
    "to",
    new Date(request.param.to as string | number | Date).toISOString()
  );
  params.set("areDeleted", String(request.param.areDeleted ?? false));
  for (const stationId of request.param.stationIds) {
    params.append("stationIds", stationId);
  }
  const url =
    APIURLPathDictionary.origin() +
    "/" +
    CurrentAPIBaseURL +
    "/" +
    APIURLPathDictionary.routine.getMyRoutinesByTimeRange +
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

  return (await response.json()) as GetMyRoutinesByTimeRangeResponse;
};

export const CreateRoutineByStationId = async (
  request: CreateRoutineByStationIdRequest
): Promise<CreateRoutineByStationIdResponse> => {
  const url =
    APIURLPathDictionary.origin() +
    "/" +
    CurrentAPIBaseURL +
    "/" +
    APIURLPathDictionary.routine.createRoutineByStationId(
      request.body.stationId
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
    body: JSON.stringify(withoutPathParams(request.body, "stationId")),
    credentials: "omit",
  });

  return (await response.json()) as CreateRoutineByStationIdResponse;
};

export const CreateRoutinesByStationIds = async (
  request: CreateRoutinesByStationIdsRequest
): Promise<CreateRoutinesByStationIdsResponse> => {
  const url =
    APIURLPathDictionary.origin() +
    "/" +
    CurrentAPIBaseURL +
    "/" +
    APIURLPathDictionary.routine.createRoutinesByStationIds;
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
    body: JSON.stringify(request.body),
    credentials: "omit",
  });

  return (await response.json()) as CreateRoutinesByStationIdsResponse;
};

export const UpdateMyRoutineById = async (
  request: UpdateMyRoutineByIdRequest
): Promise<UpdateMyRoutineByIdResponse> => {
  const url =
    APIURLPathDictionary.origin() +
    "/" +
    CurrentAPIBaseURL +
    "/" +
    APIURLPathDictionary.routine.updateMyRoutineById(request.body.routineId);
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown");
  const response = await fetch(url, {
    method: "PUT",
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

  return (await response.json()) as UpdateMyRoutineByIdResponse;
};

export const UpdateMyRoutinesByIds = async (
  request: UpdateMyRoutinesByIdsRequest
): Promise<UpdateMyRoutinesByIdsResponse> => {
  const url =
    APIURLPathDictionary.origin() +
    "/" +
    CurrentAPIBaseURL +
    "/" +
    APIURLPathDictionary.routine.updateMyRoutinesByIds;
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

  return (await response.json()) as UpdateMyRoutinesByIdsResponse;
};

export const LinkRoutineTagById = async (
  request: LinkRoutineTagByIdRequest
): Promise<LinkRoutineTagByIdResponse> => {
  const url =
    APIURLPathDictionary.origin() +
    "/" +
    CurrentAPIBaseURL +
    "/" +
    APIURLPathDictionary.routine.linkRoutineTagById(
      request.body.routineId,
      request.body.routineTagId
    );
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
    body: JSON.stringify(
      withoutPathParams(request.body, "routineId", "routineTagId")
    ),
    credentials: "omit",
  });

  return (await response.json()) as LinkRoutineTagByIdResponse;
};

export const LinkRoutineTagsByIds = async (
  request: LinkRoutineTagsByIdsRequest
): Promise<LinkRoutineTagsByIdsResponse> => {
  const url =
    APIURLPathDictionary.origin() +
    "/" +
    CurrentAPIBaseURL +
    "/" +
    APIURLPathDictionary.routine.linkRoutineTagsByIds;
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

  return (await response.json()) as LinkRoutineTagsByIdsResponse;
};

export const LinkRoutineTaskById = async (
  request: LinkRoutineTaskByIdRequest
): Promise<LinkRoutineTaskByIdResponse> => {
  const url =
    APIURLPathDictionary.origin() +
    "/" +
    CurrentAPIBaseURL +
    "/" +
    APIURLPathDictionary.routine.linkRoutineTaskById(
      request.body.routineId,
      request.body.routineTaskId
    );
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
    body: JSON.stringify(
      withoutPathParams(request.body, "routineId", "routineTaskId")
    ),
    credentials: "omit",
  });

  return (await response.json()) as LinkRoutineTaskByIdResponse;
};

export const LinkRoutineTasksByIds = async (
  request: LinkRoutineTasksByIdsRequest
): Promise<LinkRoutineTasksByIdsResponse> => {
  const url =
    APIURLPathDictionary.origin() +
    "/" +
    CurrentAPIBaseURL +
    "/" +
    APIURLPathDictionary.routine.linkRoutineTasksByIds;
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
    body: JSON.stringify(request.body),
    credentials: "omit",
  });

  return (await response.json()) as LinkRoutineTasksByIdsResponse;
};

export const LinkRoutineItemById = async (
  request: LinkRoutineItemByIdRequest
): Promise<LinkRoutineItemByIdResponse> => {
  const url =
    APIURLPathDictionary.origin() +
    "/" +
    CurrentAPIBaseURL +
    "/" +
    APIURLPathDictionary.routine.linkRoutineItemById(
      request.body.routineId,
      request.body.itemId
    );
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
    body: JSON.stringify(
      withoutPathParams(request.body, "routineId", "itemId")
    ),
    credentials: "omit",
  });

  return (await response.json()) as LinkRoutineItemByIdResponse;
};

export const LinkRoutineItemsByIds = async (
  request: LinkRoutineItemsByIdsRequest
): Promise<LinkRoutineItemsByIdsResponse> => {
  const url =
    APIURLPathDictionary.origin() +
    "/" +
    CurrentAPIBaseURL +
    "/" +
    APIURLPathDictionary.routine.linkRoutineItemsByIds;
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
    body: JSON.stringify(request.body),
    credentials: "omit",
  });

  return (await response.json()) as LinkRoutineItemsByIdsResponse;
};

export const RestoreMyRoutineById = async (
  request: RestoreMyRoutineByIdRequest
): Promise<RestoreMyRoutineByIdResponse> => {
  const url =
    APIURLPathDictionary.origin() +
    "/" +
    CurrentAPIBaseURL +
    "/" +
    APIURLPathDictionary.routine.restoreMyRoutineById(request.body.routineId);
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown");
  const response = await fetch(url, {
    method: "PATCH",
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

  return (await response.json()) as RestoreMyRoutineByIdResponse;
};

export const RestoreMyRoutinesByIds = async (
  request: RestoreMyRoutinesByIdsRequest
): Promise<RestoreMyRoutinesByIdsResponse> => {
  const url =
    APIURLPathDictionary.origin() +
    "/" +
    CurrentAPIBaseURL +
    "/" +
    APIURLPathDictionary.routine.restoreMyRoutinesByIds;
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown") ??
    "unknown";
  const response = await fetch(url, {
    method: "PATCH",
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

  return (await response.json()) as RestoreMyRoutinesByIdsResponse;
};

export const DeleteMyRoutineById = async (
  request: DeleteMyRoutineByIdRequest
): Promise<DeleteMyRoutineByIdResponse> => {
  const url =
    APIURLPathDictionary.origin() +
    "/" +
    CurrentAPIBaseURL +
    "/" +
    APIURLPathDictionary.routine.deleteMyRoutineById(request.body.routineId);
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown");
  const response = await fetch(url, {
    method: "DELETE",
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

  return (await response.json()) as DeleteMyRoutineByIdResponse;
};

export const DeleteMyRoutinesByIds = async (
  request: DeleteMyRoutinesByIdsRequest
): Promise<DeleteMyRoutinesByIdsResponse> => {
  const url =
    APIURLPathDictionary.origin() +
    "/" +
    CurrentAPIBaseURL +
    "/" +
    APIURLPathDictionary.routine.deleteMyRoutinesByIds;
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

  return (await response.json()) as DeleteMyRoutinesByIdsResponse;
};

export const HardDeleteMyRoutineById = async (
  request: HardDeleteMyRoutineByIdRequest
): Promise<HardDeleteMyRoutineByIdResponse> => {
  const url =
    APIURLPathDictionary.origin() +
    "/" +
    CurrentAPIBaseURL +
    "/" +
    APIURLPathDictionary.routine.hardDeleteMyRoutineById(
      request.body.routineId
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
    body: JSON.stringify(withoutPathParams(request.body, "routineId")),
    credentials: "omit",
  });

  return (await response.json()) as HardDeleteMyRoutineByIdResponse;
};

export const HardDeleteMyRoutinesByIds = async (
  request: HardDeleteMyRoutinesByIdsRequest
): Promise<HardDeleteMyRoutinesByIdsResponse> => {
  const url =
    APIURLPathDictionary.origin() +
    "/" +
    CurrentAPIBaseURL +
    "/" +
    APIURLPathDictionary.routine.hardDeleteMyRoutinesByIds;
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

  return (await response.json()) as HardDeleteMyRoutinesByIdsResponse;
};
