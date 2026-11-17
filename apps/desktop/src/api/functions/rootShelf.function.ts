import type { UUID } from "node:crypto";
import type {
  CreateRootShelfRequest,
  CreateRootShelfResponse,
  CreateRootShelvesRequest,
  CreateRootShelvesResponse,
  DeleteMyRootShelfByIdRequest,
  DeleteMyRootShelfByIdResponse,
  DeleteMyRootShelvesByIdsRequest,
  DeleteMyRootShelvesByIdsResponse,
  DeleteRootShelfPermissionsRequest,
  DeleteRootShelfPermissionsResponse,
  GetMyRootShelfByIdRequest,
  GetMyRootShelfByIdResponse,
  HardDeleteMyRootShelvesByIdsRequest,
  HardDeleteMyRootShelvesByIdsResponse,
  LeaveMyRootShelfRequest,
  LeaveMyRootShelfResponse,
  RestoreMyRootShelfByIdRequest,
  RestoreMyRootShelfByIdResponse,
  RestoreMyRootShelvesByIdsRequest,
  RestoreMyRootShelvesByIdsResponse,
  TransferMyRootShelfOwnershipRequest,
  TransferMyRootShelfOwnershipResponse,
  UpdateMyRootShelfByIdRequest,
  UpdateMyRootShelfByIdResponse,
  UpdateMyRootShelvesByIdsRequest,
  UpdateMyRootShelvesByIdsResponse,
  UpsertRootShelfPermissionRequest,
  UpsertRootShelfPermissionResponse,
} from "@shared/api/interfaces/rootShelf.interface";
import { APIURLPathDictionary, CurrentAPIBaseURL } from "@shared/lib/url/api";
import { getAccessToken } from "../tokens/accessToken";
import { withoutPathParams } from "./helpers/body";

export const GetMyRootShelfById = async (
  request: GetMyRootShelfByIdRequest
): Promise<GetMyRootShelfByIdResponse> => {
  const { rootShelfId, isDeleted = false } = request.param;
  const params = new URLSearchParams({ isDeleted: String(isDeleted) });
  let url = `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.rootShelf.getMyRootShelfById(rootShelfId)}?${params}`;
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

  return (await response.json()) as GetMyRootShelfByIdResponse;
};

export const CreateRootShelf = async (
  request: CreateRootShelfRequest
): Promise<CreateRootShelfResponse> => {
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown");
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.rootShelf.createRootShelf}`,
    {
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
    }
  );

  return (await response.json()) as CreateRootShelfResponse;
};

export const CreateRootShelves = async (
  request: CreateRootShelvesRequest
): Promise<CreateRootShelvesResponse> => {
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown");
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.rootShelf.createRootShelves}`,
    {
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
    }
  );

  return (await response.json()) as CreateRootShelvesResponse;
};

export const UpsertRootShelfPermission = async (
  request: UpsertRootShelfPermissionRequest
): Promise<UpsertRootShelfPermissionResponse> => {
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown") ??
    "unknown";
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.rootShelf.upsertRootShelfPermission(
      request.param.rootShelfId as UUID,
      request.param.userPublicId as UUID
    )}`,
    {
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
    }
  );

  return (await response.json()) as UpsertRootShelfPermissionResponse;
};

export const DeleteRootShelfPermissions = async (
  request: DeleteRootShelfPermissionsRequest
): Promise<DeleteRootShelfPermissionsResponse> => {
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown") ??
    "unknown";
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.rootShelf.deleteRootShelfPermissions(
      request.param.rootShelfId as UUID
    )}`,
    {
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
    }
  );

  return (await response.json()) as DeleteRootShelfPermissionsResponse;
};

export const TransferMyRootShelfOwnership = async (
  request: TransferMyRootShelfOwnershipRequest
): Promise<TransferMyRootShelfOwnershipResponse> => {
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.rootShelf.transferOwnership(request.param.rootShelfId as UUID)}`,
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
  return (await response.json()) as TransferMyRootShelfOwnershipResponse;
};

export const LeaveMyRootShelf = async (
  request: LeaveMyRootShelfRequest
): Promise<LeaveMyRootShelfResponse> => {
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.rootShelf.leave(request.param.rootShelfId as UUID)}`,
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
      ...(request.body !== undefined
        ? { body: JSON.stringify(request.body) }
        : {}),
      credentials: "omit",
    }
  );
  return (await response.json()) as LeaveMyRootShelfResponse;
};

export const UpdateMyRootShelfById = async (
  request: UpdateMyRootShelfByIdRequest
): Promise<UpdateMyRootShelfByIdResponse> => {
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown") ??
    "unknown";
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.rootShelf.updateMyRootShelfById(request.body.rootShelfId)}`,
    {
      method: "PUT",
      headers: {
        ...(getAccessToken()
          ? { Authorization: `Bearer ${getAccessToken()}` }
          : {}),
        "Content-Type": "application/json",
        "User-Agent": userAgent,
      },
      body: JSON.stringify(withoutPathParams(request.body, "rootShelfId")),
      credentials: "omit",
    }
  );

  return (await response.json()) as UpdateMyRootShelfByIdResponse;
};

export const UpdateMyRootShelvesByIds = async (
  request: UpdateMyRootShelvesByIdsRequest
): Promise<UpdateMyRootShelvesByIdsResponse> => {
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown") ??
    "unknown";
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.rootShelf.updateMyRootShelvesByIds}`,
    {
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
    }
  );

  return (await response.json()) as UpdateMyRootShelvesByIdsResponse;
};

export const RestoreMyRootShelfById = async (
  request: RestoreMyRootShelfByIdRequest
): Promise<RestoreMyRootShelfByIdResponse> => {
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown") ??
    "unknown";
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.rootShelf.restoreMyRootShelfById(request.body.rootShelfId)}`,
    {
      method: "PATCH",
      headers: {
        ...(getAccessToken()
          ? { Authorization: `Bearer ${getAccessToken()}` }
          : {}),
        "Content-Type": "application/json",
        "User-Agent": userAgent,
      },
      body: JSON.stringify(withoutPathParams(request.body, "rootShelfId")),
      credentials: "omit",
    }
  );

  return (await response.json()) as RestoreMyRootShelfByIdResponse;
};

export const RestoreMyRootShelvesByIds = async (
  request: RestoreMyRootShelvesByIdsRequest
): Promise<RestoreMyRootShelvesByIdsResponse> => {
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown") ??
    "unknown";
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.rootShelf.restoreMyRootShelvesByIds}`,
    {
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
    }
  );

  return (await response.json()) as RestoreMyRootShelvesByIdsResponse;
};

export const DeleteMyRootShelfById = async (
  request: DeleteMyRootShelfByIdRequest
): Promise<DeleteMyRootShelfByIdResponse> => {
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown") ??
    "unknown";
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.rootShelf.deleteMyRootShelfById(request.body.rootShelfId)}`,
    {
      method: "DELETE",
      headers: {
        ...(getAccessToken()
          ? { Authorization: `Bearer ${getAccessToken()}` }
          : {}),
        "Content-Type": "application/json",
        "User-Agent": userAgent,
      },
      body: JSON.stringify(withoutPathParams(request.body, "rootShelfId")),
      credentials: "omit",
    }
  );

  return (await response.json()) as DeleteMyRootShelfByIdResponse;
};

export const DeleteMyRootShelvesByIds = async (
  request: DeleteMyRootShelvesByIdsRequest
): Promise<DeleteMyRootShelvesByIdsResponse> => {
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown") ??
    "unknown";
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.rootShelf.deleteMyRootShelvesByIds}`,
    {
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
    }
  );

  return (await response.json()) as DeleteMyRootShelvesByIdsResponse;
};

export const HardDeleteMyRootShelvesByIds = async (
  request: HardDeleteMyRootShelvesByIdsRequest
): Promise<HardDeleteMyRootShelvesByIdsResponse> => {
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown") ??
    "unknown";
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.rootShelf.hardDeleteMyRootShelvesByIds}`,
    {
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
    }
  );

  return (await response.json()) as HardDeleteMyRootShelvesByIdsResponse;
};
