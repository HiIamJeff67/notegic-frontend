import type {
  CreateStationRequest,
  CreateStationResponse,
  CreateStationsRequest,
  CreateStationsResponse,
  DeleteMyStationByIdRequest,
  DeleteMyStationByIdResponse,
  DeleteMyStationsByIdsRequest,
  DeleteMyStationsByIdsResponse,
  GetAllMyStationsRequest,
  GetAllMyStationsResponse,
  GetMyStationByIdRequest,
  GetMyStationByIdResponse,
  HardDeleteMyStationByIdRequest,
  HardDeleteMyStationByIdResponse,
  HardDeleteMyStationsByIdsRequest,
  HardDeleteMyStationsByIdsResponse,
  LeaveMyStationRequest,
  LeaveMyStationResponse,
  RestoreMyStationByIdRequest,
  RestoreMyStationByIdResponse,
  RestoreMyStationsByIdsRequest,
  RestoreMyStationsByIdsResponse,
  TransferMyStationOwnershipRequest,
  TransferMyStationOwnershipResponse,
  UpdateMyStationByIdRequest,
  UpdateMyStationByIdResponse,
  UpdateMyStationsByIdsRequest,
  UpdateMyStationsByIdsResponse,
  VisualizeMyTotalCountRequest,
  VisualizeMyTotalCountResponse,
} from "@shared/api/interfaces/station.interface";
import { APIURLPathDictionary, CurrentAPIBaseURL } from "@shared/lib/url/api";
import { getAccessToken } from "../tokens/accessToken";
import { withoutPathParams } from "./helpers/body";

export const VisualizeMyTotalCount = async (
  request: VisualizeMyTotalCountRequest
): Promise<VisualizeMyTotalCountResponse> => {
  const path = APIURLPathDictionary.station.visualizeMyTotalCount;
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
  return (await response.json()) as VisualizeMyTotalCountResponse;
};

export const TransferMyStationOwnership = async (
  request: TransferMyStationOwnershipRequest
): Promise<TransferMyStationOwnershipResponse> => {
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.station.transferOwnership(request.param.stationId as import("node:crypto").UUID)}`,
    {
      method: "POST",
      headers: {
        ...(getAccessToken()
          ? { Authorization: `Bearer ${getAccessToken()}` }
          : {}),
        "Content-Type": "application/json",
        "User-Agent":
          request.header?.userAgent ??
          (typeof navigator !== "undefined"
            ? navigator.userAgent
            : "unknown") ??
          "unknown",
      },
      body: JSON.stringify(request.body ?? {}),
      credentials: "omit",
    }
  );
  return (await response.json()) as TransferMyStationOwnershipResponse;
};

export const LeaveMyStation = async (
  request: LeaveMyStationRequest
): Promise<LeaveMyStationResponse> => {
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.station.leave(request.param.stationId as import("node:crypto").UUID)}`,
    {
      method: "DELETE",
      headers: {
        ...(getAccessToken()
          ? { Authorization: `Bearer ${getAccessToken()}` }
          : {}),
        "Content-Type": "application/json",
        "User-Agent":
          request.header?.userAgent ??
          (typeof navigator !== "undefined"
            ? navigator.userAgent
            : "unknown") ??
          "unknown",
      },
      body: JSON.stringify(request.body ?? {}),
      credentials: "omit",
    }
  );
  return (await response.json()) as LeaveMyStationResponse;
};

export const GetMyStationById = async (
  request: GetMyStationByIdRequest
): Promise<GetMyStationByIdResponse> => {
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
  if (request.param?.isDeleted === undefined) {
    params.set("isDeleted", "false");
  }
  const query = params.toString();
  const url =
    APIURLPathDictionary.origin() +
    "/" +
    CurrentAPIBaseURL +
    "/" +
    APIURLPathDictionary.station.getMyStationById(request.param.stationId) +
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

  return (await response.json()) as GetMyStationByIdResponse;
};

export const GetAllMyStations = async (
  request: GetAllMyStationsRequest
): Promise<GetAllMyStationsResponse> => {
  const params = new URLSearchParams();
  params.set("areDeleted", String(request.param?.areDeleted ?? false));
  const url =
    APIURLPathDictionary.origin() +
    "/" +
    CurrentAPIBaseURL +
    "/" +
    APIURLPathDictionary.station.getAllMyStations +
    (params.size > 0 ? "?" + params.toString() : "");
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

  return (await response.json()) as GetAllMyStationsResponse;
};

export const CreateStation = async (
  request: CreateStationRequest
): Promise<CreateStationResponse> => {
  const url =
    APIURLPathDictionary.origin() +
    "/" +
    CurrentAPIBaseURL +
    "/" +
    APIURLPathDictionary.station.createStation;
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

  return (await response.json()) as CreateStationResponse;
};

export const CreateStations = async (
  request: CreateStationsRequest
): Promise<CreateStationsResponse> => {
  const url =
    APIURLPathDictionary.origin() +
    "/" +
    CurrentAPIBaseURL +
    "/" +
    APIURLPathDictionary.station.createStations;
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

  return (await response.json()) as CreateStationsResponse;
};

export const UpdateMyStationById = async (
  request: UpdateMyStationByIdRequest
): Promise<UpdateMyStationByIdResponse> => {
  const url =
    APIURLPathDictionary.origin() +
    "/" +
    CurrentAPIBaseURL +
    "/" +
    APIURLPathDictionary.station.updateMyStationById(request.body.stationId);
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
    body: JSON.stringify(withoutPathParams(request.body, "stationId")),
    credentials: "omit",
  });

  return (await response.json()) as UpdateMyStationByIdResponse;
};

export const UpdateMyStationsByIds = async (
  request: UpdateMyStationsByIdsRequest
): Promise<UpdateMyStationsByIdsResponse> => {
  const url =
    APIURLPathDictionary.origin() +
    "/" +
    CurrentAPIBaseURL +
    "/" +
    APIURLPathDictionary.station.updateMyStationsByIds;
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

  return (await response.json()) as UpdateMyStationsByIdsResponse;
};

export const RestoreMyStationById = async (
  request: RestoreMyStationByIdRequest
): Promise<RestoreMyStationByIdResponse> => {
  const url =
    APIURLPathDictionary.origin() +
    "/" +
    CurrentAPIBaseURL +
    "/" +
    APIURLPathDictionary.station.restoreMyStationById(request.body.stationId);
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
    body: JSON.stringify(withoutPathParams(request.body, "stationId")),
    credentials: "omit",
  });

  return (await response.json()) as RestoreMyStationByIdResponse;
};

export const RestoreMyStationsByIds = async (
  request: RestoreMyStationsByIdsRequest
): Promise<RestoreMyStationsByIdsResponse> => {
  const url =
    APIURLPathDictionary.origin() +
    "/" +
    CurrentAPIBaseURL +
    "/" +
    APIURLPathDictionary.station.restoreMyStationsByIds;
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

  return (await response.json()) as RestoreMyStationsByIdsResponse;
};

export const DeleteMyStationById = async (
  request: DeleteMyStationByIdRequest
): Promise<DeleteMyStationByIdResponse> => {
  const url =
    APIURLPathDictionary.origin() +
    "/" +
    CurrentAPIBaseURL +
    "/" +
    APIURLPathDictionary.station.deleteMyStationById(request.body.stationId);
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
    body: JSON.stringify(withoutPathParams(request.body, "stationId")),
    credentials: "omit",
  });

  return (await response.json()) as DeleteMyStationByIdResponse;
};

export const DeleteMyStationsByIds = async (
  request: DeleteMyStationsByIdsRequest
): Promise<DeleteMyStationsByIdsResponse> => {
  const url =
    APIURLPathDictionary.origin() +
    "/" +
    CurrentAPIBaseURL +
    "/" +
    APIURLPathDictionary.station.deleteMyStationsByIds;
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

  return (await response.json()) as DeleteMyStationsByIdsResponse;
};

export const HardDeleteMyStationById = async (
  request: HardDeleteMyStationByIdRequest
): Promise<HardDeleteMyStationByIdResponse> => {
  const url =
    APIURLPathDictionary.origin() +
    "/" +
    CurrentAPIBaseURL +
    "/" +
    APIURLPathDictionary.station.hardDeleteMyStationById(
      request.body.stationId
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
    body: JSON.stringify(withoutPathParams(request.body, "stationId")),
    credentials: "omit",
  });

  return (await response.json()) as HardDeleteMyStationByIdResponse;
};

export const HardDeleteMyStationsByIds = async (
  request: HardDeleteMyStationsByIdsRequest
): Promise<HardDeleteMyStationsByIdsResponse> => {
  const url =
    APIURLPathDictionary.origin() +
    "/" +
    CurrentAPIBaseURL +
    "/" +
    APIURLPathDictionary.station.hardDeleteMyStationsByIds;
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

  return (await response.json()) as HardDeleteMyStationsByIdsResponse;
};
