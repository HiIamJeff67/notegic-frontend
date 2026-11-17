import type {
  CreateSubShelfByRootShelfIdRequest,
  CreateSubShelfByRootShelfIdResponse,
  CreateSubShelvesByRootShelfIdsRequest,
  CreateSubShelvesByRootShelfIdsResponse,
  DeleteMySubShelfByIdRequest,
  DeleteMySubShelfByIdResponse,
  DeleteMySubShelvesByIdsRequest,
  DeleteMySubShelvesByIdsResponse,
  GetMySubShelfByIdRequest,
  GetMySubShelfByIdResponse,
  GetMySubShelvesAndItemsByPrevSubShelfIdRequest,
  GetMySubShelvesAndItemsByPrevSubShelfIdResponse,
  GetMySubShelvesByPrevSubShelfIdRequest,
  GetMySubShelvesByPrevSubShelfIdResponse,
  GetMySubShelvesByRootShelfIdRequest,
  GetMySubShelvesByRootShelfIdResponse,
  HardDeleteMySubShelvesByIdsRequest,
  HardDeleteMySubShelvesByIdsResponse,
  MoveMySubShelfRequest,
  MoveMySubShelfResponse,
  MoveMySubShelvesByRootShelfIdRequest,
  MoveMySubShelvesByRootShelfIdResponse,
  MoveMySubShelvesByRootShelfIdsRequest,
  MoveMySubShelvesByRootShelfIdsResponse,
  RestoreMySubShelfByIdRequest,
  RestoreMySubShelfByIdResponse,
  RestoreMySubShelvesByIdsRequest,
  RestoreMySubShelvesByIdsResponse,
  UpdateMySubShelfByIdRequest,
  UpdateMySubShelfByIdResponse,
  UpdateMySubShelvesByIdsRequest,
  UpdateMySubShelvesByIdsResponse,
} from "@shared/api/interfaces/subShelf.interface";
import { APIURLPathDictionary, CurrentAPIBaseURL } from "@shared/lib/url/api";
import { getAccessToken } from "../tokens/accessToken";
import { withoutPathParams } from "./helpers/body";

export const GetMySubShelfById = async (
  request: GetMySubShelfByIdRequest
): Promise<GetMySubShelfByIdResponse> => {
  const { subShelfId, isDeleted = false } = request.param;
  const params = new URLSearchParams({ isDeleted: String(isDeleted) });
  let url = `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.subShelf.getMySubShelfById(subShelfId)}?${params}`;
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

  return (await response.json()) as GetMySubShelfByIdResponse;
};

export const GetMySubShelvesByPrevSubShelfId = async (
  request: GetMySubShelvesByPrevSubShelfIdRequest
): Promise<GetMySubShelvesByPrevSubShelfIdResponse> => {
  const { prevSubShelfId, areDeleted = false } = request.param;
  const params = new URLSearchParams({ areDeleted: String(areDeleted) });
  let url = `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.subShelf.getMySubShelvesByPrevSubShelfId(prevSubShelfId)}?${params}`;
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

  return (await response.json()) as GetMySubShelvesByPrevSubShelfIdResponse;
};

export const GetMySubShelvesByRootShelfId = async (
  request: GetMySubShelvesByRootShelfIdRequest
): Promise<GetMySubShelvesByRootShelfIdResponse> => {
  const { rootShelfId, areDeleted = false } = request.param;
  const params = new URLSearchParams({ areDeleted: String(areDeleted) });
  let url = `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.subShelf.getMySubShelvesByRootShelfId(rootShelfId)}?${params}`;
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

  return (await response.json()) as GetMySubShelvesByRootShelfIdResponse;
};

export const GetMySubShelvesAndItemsByPrevSubShelfId = async (
  request: GetMySubShelvesAndItemsByPrevSubShelfIdRequest
): Promise<GetMySubShelvesAndItemsByPrevSubShelfIdResponse> => {
  const { prevSubShelfId, areDeleted = false } = request.param;
  const params = new URLSearchParams({ areDeleted: String(areDeleted) });
  let url = `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.subShelf.getMySubShelvesAndItemsByPrevSubShelfId(prevSubShelfId)}?${params}`;
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

  return (await response.json()) as GetMySubShelvesAndItemsByPrevSubShelfIdResponse;
};

export const CreateSubShelfByRootShelfId = async (
  request: CreateSubShelfByRootShelfIdRequest
): Promise<CreateSubShelfByRootShelfIdResponse> => {
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown") ??
    "unknown";
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.subShelf.createSubShelfByRootShelfId(request.body.rootShelfId)}`,
    {
      method: "POST",
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

  return (await response.json()) as CreateSubShelfByRootShelfIdResponse;
};

export const CreateSubShelvesByRootShelfIds = async (
  request: CreateSubShelvesByRootShelfIdsRequest
): Promise<CreateSubShelvesByRootShelfIdsResponse> => {
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown") ??
    "unknown";
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.subShelf.createSubShelvesByRootShelfIds}`,
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

  return (await response.json()) as CreateSubShelvesByRootShelfIdsResponse;
};

export const UpdateMySubShelfById = async (
  request: UpdateMySubShelfByIdRequest
): Promise<UpdateMySubShelfByIdResponse> => {
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown");
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.subShelf.updateMySubShelfById(request.body.subShelfId)}`,
    {
      method: "PUT",
      headers: {
        ...(getAccessToken()
          ? { Authorization: `Bearer ${getAccessToken()}` }
          : {}),
        "Content-Type": "application/json",
        "User-Agent": userAgent,
      },
      body: JSON.stringify(withoutPathParams(request.body, "subShelfId")),
      credentials: "omit",
    }
  );

  return (await response.json()) as UpdateMySubShelfByIdResponse;
};

export const UpdateMySubShelvesByIds = async (
  request: UpdateMySubShelvesByIdsRequest
): Promise<UpdateMySubShelvesByIdsResponse> => {
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown") ??
    "unknown";
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.subShelf.updateMySubShelvesByIds}`,
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

  return (await response.json()) as UpdateMySubShelvesByIdsResponse;
};

export const MoveMySubShelf = async (
  request: MoveMySubShelfRequest
): Promise<MoveMySubShelfResponse> => {
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown");
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.subShelf.moveMySubShelf(request.body.sourceSubShelfId)}`,
    {
      method: "PUT",
      headers: {
        ...(getAccessToken()
          ? { Authorization: `Bearer ${getAccessToken()}` }
          : {}),
        "Content-Type": "application/json",
        "User-Agent": userAgent,
      },
      body: JSON.stringify(withoutPathParams(request.body, "sourceSubShelfId")),
      credentials: "omit",
    }
  );

  return (await response.json()) as MoveMySubShelfResponse;
};

export const MoveMySubShelvesByRootShelfId = async (
  request: MoveMySubShelvesByRootShelfIdRequest
): Promise<MoveMySubShelvesByRootShelfIdResponse> => {
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown") ??
    "unknown";
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.subShelf.moveMySubShelvesByRootShelfId}`,
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

  return (await response.json()) as MoveMySubShelvesByRootShelfIdResponse;
};

export const MoveMySubShelvesByRootShelfIds = async (
  request: MoveMySubShelvesByRootShelfIdsRequest
): Promise<MoveMySubShelvesByRootShelfIdsResponse> => {
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown") ??
    "unknown";
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.subShelf.moveMySubShelvesByRootShelfIds}`,
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

  return (await response.json()) as MoveMySubShelvesByRootShelfIdsResponse;
};

export const RestoreMySubShelfById = async (
  request: RestoreMySubShelfByIdRequest
): Promise<RestoreMySubShelfByIdResponse> => {
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown") ??
    "unknown";
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.subShelf.restoreMySubShelfById(request.body.subShelfId)}`,
    {
      method: "PATCH",
      headers: {
        ...(getAccessToken()
          ? { Authorization: `Bearer ${getAccessToken()}` }
          : {}),
        "Content-Type": "application/json",
        "User-Agent": userAgent,
      },
      body: JSON.stringify(withoutPathParams(request.body, "subShelfId")),
      credentials: "omit",
    }
  );

  return (await response.json()) as RestoreMySubShelfByIdResponse;
};

export const RestoreMySubShelvesByIds = async (
  request: RestoreMySubShelvesByIdsRequest
): Promise<RestoreMySubShelvesByIdsResponse> => {
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown") ??
    "unknown";
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.subShelf.restoreMySubShelvesByIds}`,
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

  return (await response.json()) as RestoreMySubShelvesByIdsResponse;
};

export const DeleteMySubShelfById = async (
  request: DeleteMySubShelfByIdRequest
): Promise<DeleteMySubShelfByIdResponse> => {
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown");
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.subShelf.deleteMySubShelfById(request.body.subShelfId)}`,
    {
      method: "DELETE",
      headers: {
        ...(getAccessToken()
          ? { Authorization: `Bearer ${getAccessToken()}` }
          : {}),
        "Content-Type": "application/json",
        "User-Agent": userAgent,
      },
      body: JSON.stringify(withoutPathParams(request.body, "subShelfId")),
      credentials: "omit",
    }
  );

  return (await response.json()) as DeleteMySubShelfByIdResponse;
};

export const DeleteMySubShelvesByIds = async (
  request: DeleteMySubShelvesByIdsRequest
): Promise<DeleteMySubShelvesByIdsResponse> => {
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown") ??
    "unknown";
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.subShelf.deleteMySubShelvesByIds}`,
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

  return (await response.json()) as DeleteMySubShelvesByIdsResponse;
};

export const HardDeleteMySubShelvesByIds = async (
  request: HardDeleteMySubShelvesByIdsRequest
): Promise<HardDeleteMySubShelvesByIdsResponse> => {
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown") ??
    "unknown";
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.subShelf.hardDeleteMySubShelvesByIds}`,
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

  return (await response.json()) as HardDeleteMySubShelvesByIdsResponse;
};
