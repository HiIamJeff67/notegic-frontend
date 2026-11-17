import type {
  CreateBlockPackRequest,
  CreateBlockPackResponse,
  CreateBlockPacksRequest,
  CreateBlockPacksResponse,
  DeleteMyBlockPackByIdRequest,
  DeleteMyBlockPackByIdResponse,
  DeleteMyBlockPacksByIdsRequest,
  DeleteMyBlockPacksByIdsResponse,
  GetMyBlockPackByIdRequest,
  GetMyBlockPackByIdResponse,
  GetMyBlockPacksByParentSubShelfIdRequest,
  GetMyBlockPacksByParentSubShelfIdResponse,
  GetMyBlockPacksByRootShelfIdRequest,
  GetMyBlockPacksByRootShelfIdResponse,
  HardDeleteMyBlockPacksByIdsRequest,
  HardDeleteMyBlockPacksByIdsResponse,
  MoveMyBlockPackByIdRequest,
  MoveMyBlockPackByIdResponse,
  MoveMyBlockPacksByParentSubShelfIdRequest,
  MoveMyBlockPacksByParentSubShelfIdResponse,
  MoveMyBlockPacksByParentSubShelfIdsRequest,
  MoveMyBlockPacksByParentSubShelfIdsResponse,
  RestoreMyBlockPackByIdRequest,
  RestoreMyBlockPackByIdResponse,
  RestoreMyBlockPacksByIdsRequest,
  RestoreMyBlockPacksByIdsResponse,
  UpdateMyBlockPackByIdRequest,
  UpdateMyBlockPackByIdResponse,
  UpdateMyBlockPacksByIdsRequest,
  UpdateMyBlockPacksByIdsResponse,
} from "@shared/api/interfaces/blockPack.interface";
import { APIURLPathDictionary, CurrentAPIBaseURL } from "@shared/lib/url/api";
import { getAccessToken } from "../tokens/accessToken";
import { withoutPathParams } from "./helpers/body";

export const GetMyBlockPackById = async (
  request: GetMyBlockPackByIdRequest
): Promise<GetMyBlockPackByIdResponse> => {
  const { blockPackId, isDeleted = false } = request.param;
  const params = new URLSearchParams({ isDeleted: String(isDeleted) });
  let url = `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.blockPack.getMyBlockPackById(blockPackId)}?${params}`;
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

  return (await response.json()) as GetMyBlockPackByIdResponse;
};

export const GetMyBlockPacksByParentSubShelfId = async (
  request: GetMyBlockPacksByParentSubShelfIdRequest
): Promise<GetMyBlockPacksByParentSubShelfIdResponse> => {
  const { parentSubShelfId, areDeleted = false } = request.param;
  const params = new URLSearchParams({ areDeleted: String(areDeleted) });
  let url = `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.blockPack.getMyBlockPacksByParentSubShelfId(parentSubShelfId)}?${params}`;
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

  return (await response.json()) as GetMyBlockPacksByParentSubShelfIdResponse;
};

export const GetMyBlockPacksByRootShelfId = async (
  request: GetMyBlockPacksByRootShelfIdRequest
): Promise<GetMyBlockPacksByRootShelfIdResponse> => {
  const { rootShelfId, areDeleted = false } = request.param;
  const params = new URLSearchParams({ areDeleted: String(areDeleted) });
  let url = `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.blockPack.getMyBlockPacksByRootShelfId(rootShelfId)}?${params}`;
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

  return (await response.json()) as GetMyBlockPacksByRootShelfIdResponse;
};

export const CreateBlockPack = async (
  request: CreateBlockPackRequest
): Promise<CreateBlockPackResponse> => {
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown");
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.blockPack.createBlockPack(request.body.parentSubShelfId)}`,
    {
      method: "POST",
      headers: {
        ...(getAccessToken()
          ? { Authorization: `Bearer ${getAccessToken()}` }
          : {}),
        "Content-Type": "application/json",
        "User-Agent": userAgent,
      },
      body: JSON.stringify(withoutPathParams(request.body, "parentSubShelfId")),
      credentials: "omit",
    }
  );

  return (await response.json()) as CreateBlockPackResponse;
};

export const CreateBlockPacks = async (
  request: CreateBlockPacksRequest
): Promise<CreateBlockPacksResponse> => {
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown");
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.blockPack.createBlockPacks}`,
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

  return (await response.json()) as CreateBlockPacksResponse;
};

export const UpdateMyBlockPackById = async (
  request: UpdateMyBlockPackByIdRequest
): Promise<UpdateMyBlockPackByIdResponse> => {
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown") ??
    "unknown";
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.blockPack.updateMyBlockPackById(request.body.blockPackId)}`,
    {
      method: "PUT",
      headers: {
        ...(getAccessToken()
          ? { Authorization: `Bearer ${getAccessToken()}` }
          : {}),
        "Content-Type": "application/json",
        "User-Agent": userAgent,
      },
      body: JSON.stringify(withoutPathParams(request.body, "blockPackId")),
      credentials: "omit",
    }
  );

  return (await response.json()) as UpdateMyBlockPackByIdResponse;
};

export const UpdateMyBlockPacksByIds = async (
  request: UpdateMyBlockPacksByIdsRequest
): Promise<UpdateMyBlockPacksByIdsResponse> => {
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown") ??
    "unknown";
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.blockPack.updateMyBlockPacksByIds}`,
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

  return (await response.json()) as UpdateMyBlockPacksByIdsResponse;
};

export const MoveMyBlockPackById = async (
  request: MoveMyBlockPackByIdRequest
): Promise<MoveMyBlockPackByIdResponse> => {
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown");
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.blockPack.moveMyBlockPackById(request.body.blockPackId)}`,
    {
      method: "PUT",
      headers: {
        ...(getAccessToken()
          ? { Authorization: `Bearer ${getAccessToken()}` }
          : {}),
        "Content-Type": "application/json",
        "User-Agent": userAgent,
      },
      body: JSON.stringify(withoutPathParams(request.body, "blockPackId")),
      credentials: "omit",
    }
  );

  return (await response.json()) as MoveMyBlockPackByIdResponse;
};

export const MoveMyBlockPacksByParentSubShelfId = async (
  request: MoveMyBlockPacksByParentSubShelfIdRequest
): Promise<MoveMyBlockPacksByParentSubShelfIdResponse> => {
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown") ??
    "unknown";
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.blockPack.moveMyBlockPacksByParentSubShelfId}`,
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

  return (await response.json()) as MoveMyBlockPacksByParentSubShelfIdResponse;
};

export const MoveMyBlockPacksByParentSubShelfIds = async (
  request: MoveMyBlockPacksByParentSubShelfIdsRequest
): Promise<MoveMyBlockPacksByParentSubShelfIdsResponse> => {
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown") ??
    "unknown";
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.blockPack.moveMyBlockPacksByParentSubShelfIds}`,
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

  return (await response.json()) as MoveMyBlockPacksByParentSubShelfIdsResponse;
};

export const RestoreMyBlockPackById = async (
  request: RestoreMyBlockPackByIdRequest
): Promise<RestoreMyBlockPackByIdResponse> => {
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown") ??
    "unknown";
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.blockPack.restoreMyBlockPackById(request.body.blockPackId)}`,
    {
      method: "PATCH",
      headers: {
        ...(getAccessToken()
          ? { Authorization: `Bearer ${getAccessToken()}` }
          : {}),
        "Content-Type": "application/json",
        "User-Agent": userAgent,
      },
      body: JSON.stringify(withoutPathParams(request.body, "blockPackId")),
      credentials: "omit",
    }
  );

  return (await response.json()) as RestoreMyBlockPackByIdResponse;
};

export const RestoreMyBlockPacksByIds = async (
  request: RestoreMyBlockPacksByIdsRequest
): Promise<RestoreMyBlockPacksByIdsResponse> => {
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown") ??
    "unknown";
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.blockPack.restoreMyBlockPacksByIds}`,
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

  return (await response.json()) as RestoreMyBlockPacksByIdsResponse;
};

export const DeleteMyBlockPackById = async (
  request: DeleteMyBlockPackByIdRequest
): Promise<DeleteMyBlockPackByIdResponse> => {
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown") ??
    "unknown";
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.blockPack.deleteMyBlockPackById(request.body.blockPackId)}`,
    {
      method: "DELETE",
      headers: {
        ...(getAccessToken()
          ? { Authorization: `Bearer ${getAccessToken()}` }
          : {}),
        "Content-Type": "application/json",
        "User-Agent": userAgent,
      },
      body: JSON.stringify(withoutPathParams(request.body, "blockPackId")),
      credentials: "omit",
    }
  );

  return (await response.json()) as DeleteMyBlockPackByIdResponse;
};

export const DeleteMyBlockPacksByIds = async (
  request: DeleteMyBlockPacksByIdsRequest
): Promise<DeleteMyBlockPacksByIdsResponse> => {
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown") ??
    "unknown";
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.blockPack.deleteMyBlockPacksByIds}`,
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

  return (await response.json()) as DeleteMyBlockPacksByIdsResponse;
};

export const HardDeleteMyBlockPacksByIds = async (
  request: HardDeleteMyBlockPacksByIdsRequest
): Promise<HardDeleteMyBlockPacksByIdsResponse> => {
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown") ??
    "unknown";
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.blockPack.hardDeleteMyBlockPacksByIds}`,
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

  return (await response.json()) as HardDeleteMyBlockPacksByIdsResponse;
};
