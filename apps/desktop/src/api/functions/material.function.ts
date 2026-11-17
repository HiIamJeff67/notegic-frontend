import type {
  CreateMaterialObjectTicketRequest,
  CreateMaterialObjectTicketResponse,
  CreateMyMaterialRequest,
  CreateMyMaterialResponse,
  DeleteMyMaterialByIdRequest,
  DeleteMyMaterialByIdResponse,
  DeleteMyMaterialsByIdsRequest,
  DeleteMyMaterialsByIdsResponse,
  GetMyMaterialAndItsParentByIdRequest,
  GetMyMaterialAndItsParentByIdResponse,
  GetMyMaterialByIdRequest,
  GetMyMaterialByIdResponse,
  GetMyMaterialsByParentSubShelfIdRequest,
  GetMyMaterialsByParentSubShelfIdResponse,
  GetMyMaterialsByRootShelfIdRequest,
  GetMyMaterialsByRootShelfIdResponse,
  HardDeleteMyMaterialsByIdsRequest,
  HardDeleteMyMaterialsByIdsResponse,
  MoveMyMaterialByIdRequest,
  MoveMyMaterialByIdResponse,
  MoveMyMaterialsByIdsRequest,
  MoveMyMaterialsByIdsResponse,
  ResolveMaterialObjectTicketRequest,
  ResolveMaterialObjectTicketResponse,
  RestoreMyMaterialByIdRequest,
  RestoreMyMaterialByIdResponse,
  RestoreMyMaterialsByIdsRequest,
  RestoreMyMaterialsByIdsResponse,
  SaveMyMaterialByIdRequest,
  SaveMyMaterialByIdResponse,
  UpdateMyMaterialByIdRequest,
  UpdateMyMaterialByIdResponse,
} from "@shared/api/interfaces/material.interface";
import { APIURLPathDictionary, CurrentAPIBaseURL } from "@shared/lib/url/api";
import { getAccessToken } from "../tokens/accessToken";
import { withoutPathParams } from "./helpers/body";

export const SaveMyMaterialById = async (
  request: SaveMyMaterialByIdRequest
): Promise<SaveMyMaterialByIdResponse> => {
  const formData = new FormData();
  formData.append("contentFile", request.body.contentFile);

  const userAgent = request.header?.userAgent ?? "unknown";
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.saveMyMaterialById(request.body.materialId)}`,
    {
      method: "PUT",
      headers: {
        ...(getAccessToken()
          ? { Authorization: `Bearer ${getAccessToken()}` }
          : {}),
        "User-Agent": userAgent,
      },
      body: formData,
      credentials: "omit",
    }
  );

  return (await response.json()) as SaveMyMaterialByIdResponse;
};

export const GetMyMaterialById = async (
  request: GetMyMaterialByIdRequest
): Promise<GetMyMaterialByIdResponse> => {
  const { materialId, isDeleted = false } = request.param;
  const params = new URLSearchParams({ isDeleted: String(isDeleted) });
  let url = `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.getMyMaterialById(materialId)}?${params}`;
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

  return (await response.json()) as GetMyMaterialByIdResponse;
};

export const GetMyMaterialAndItsParentById = async (
  request: GetMyMaterialAndItsParentByIdRequest
): Promise<GetMyMaterialAndItsParentByIdResponse> => {
  const { materialId, isDeleted = false } = request.param;
  const params = new URLSearchParams({ isDeleted: String(isDeleted) });
  let url = `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.getMyMaterialAndItsParentById(materialId)}?${params}`;
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

  return (await response.json()) as GetMyMaterialAndItsParentByIdResponse;
};

export const GetMyMaterialsByParentSubShelfId = async (
  request: GetMyMaterialsByParentSubShelfIdRequest
): Promise<GetMyMaterialsByParentSubShelfIdResponse> => {
  const { parentSubShelfId, areDeleted = false } = request.param;
  const params = new URLSearchParams({
    areDeleted: String(areDeleted),
  }).toString();
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown") ??
    "unknown";
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.getMyMaterialsByParentSubShelfId(parentSubShelfId)}?${params}`,
    {
      method: "GET",
      headers: {
        ...(getAccessToken()
          ? { Authorization: `Bearer ${getAccessToken()}` }
          : {}),
        "Content-Type": "application/json",
        "User-Agent": userAgent,
      },
      credentials: "omit",
    }
  );

  return (await response.json()) as GetMyMaterialsByParentSubShelfIdResponse;
};

export const GetMyMaterialsByRootShelfId = async (
  request: GetMyMaterialsByRootShelfIdRequest
): Promise<GetMyMaterialsByRootShelfIdResponse> => {
  const { rootShelfId, areDeleted = false } = request.param;
  const params = new URLSearchParams({
    areDeleted: String(areDeleted),
  }).toString();
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown") ??
    "unknown";
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.getMyMaterialsByRootShelfId(rootShelfId)}?${params}`,
    {
      method: "GET",
      headers: {
        ...(getAccessToken()
          ? { Authorization: `Bearer ${getAccessToken()}` }
          : {}),
        "Content-Type": "application/json",
        "User-Agent": userAgent,
      },
      credentials: "omit",
    }
  );

  return (await response.json()) as GetMyMaterialsByRootShelfIdResponse;
};

export const CreateMyMaterial = async (
  request: CreateMyMaterialRequest
): Promise<CreateMyMaterialResponse> => {
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown");
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.createMyMaterial(request.body.parentSubShelfId)}`,
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

  return (await response.json()) as CreateMyMaterialResponse;
};

export const UpdateMyMaterialById = async (
  request: UpdateMyMaterialByIdRequest
): Promise<UpdateMyMaterialByIdResponse> => {
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown");
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.updateMyMaterialById(request.body.materialId)}`,
    {
      method: "PUT",
      headers: {
        ...(getAccessToken()
          ? { Authorization: `Bearer ${getAccessToken()}` }
          : {}),
        "Content-Type": "application/json",
        "User-Agent": userAgent,
      },
      body: JSON.stringify(withoutPathParams(request.body, "materialId")),
      credentials: "omit",
    }
  );

  return (await response.json()) as UpdateMyMaterialByIdResponse;
};

export const MoveMyMaterialById = async (
  request: MoveMyMaterialByIdRequest
): Promise<MoveMyMaterialByIdResponse> => {
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown");
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.moveMyMaterialById(request.body.materialId)}`,
    {
      method: "PUT",
      headers: {
        ...(getAccessToken()
          ? { Authorization: `Bearer ${getAccessToken()}` }
          : {}),
        "Content-Type": "application/json",
        "User-Agent": userAgent,
      },
      body: JSON.stringify(withoutPathParams(request.body, "materialId")),
      credentials: "omit",
    }
  );

  return (await response.json()) as MoveMyMaterialByIdResponse;
};

export const MoveMyMaterialsByIds = async (
  request: MoveMyMaterialsByIdsRequest
): Promise<MoveMyMaterialsByIdsResponse> => {
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown");
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.moveMyMaterialsByIds}`,
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

  return (await response.json()) as MoveMyMaterialsByIdsResponse;
};

export const RestoreMyMaterialById = async (
  request: RestoreMyMaterialByIdRequest
): Promise<RestoreMyMaterialByIdResponse> => {
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown") ??
    "unknown";
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.restoreMyMaterialById(request.body.materialId)}`,
    {
      method: "PATCH",
      headers: {
        ...(getAccessToken()
          ? { Authorization: `Bearer ${getAccessToken()}` }
          : {}),
        "Content-Type": "application/json",
        "User-Agent": userAgent,
      },
      body: JSON.stringify(withoutPathParams(request.body, "materialId")),
      credentials: "omit",
    }
  );

  return (await response.json()) as RestoreMyMaterialByIdResponse;
};

export const RestoreMyMaterialsByIds = async (
  request: RestoreMyMaterialsByIdsRequest
): Promise<RestoreMyMaterialsByIdsResponse> => {
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown") ??
    "unknown";
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.restoreMyMaterialsByIds}`,
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

  return (await response.json()) as RestoreMyMaterialsByIdsResponse;
};

export const DeleteMyMaterialById = async (
  request: DeleteMyMaterialByIdRequest
): Promise<DeleteMyMaterialByIdResponse> => {
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown");
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.deleteMyMaterialById(request.body.materialId)}`,
    {
      method: "DELETE",
      headers: {
        ...(getAccessToken()
          ? { Authorization: `Bearer ${getAccessToken()}` }
          : {}),
        "Content-Type": "application/json",
        "User-Agent": userAgent,
      },
      body: JSON.stringify(withoutPathParams(request.body, "materialId")),
      credentials: "omit",
    }
  );

  return (await response.json()) as DeleteMyMaterialByIdResponse;
};

export const DeleteMyMaterialsByIds = async (
  request: DeleteMyMaterialsByIdsRequest
): Promise<DeleteMyMaterialsByIdsResponse> => {
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown") ??
    "unknown";
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.deleteMyMaterialsByIds}`,
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

  return (await response.json()) as DeleteMyMaterialsByIdsResponse;
};

export const CreateMaterialObjectTicket = async (
  request: CreateMaterialObjectTicketRequest
): Promise<CreateMaterialObjectTicketResponse> => {
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.createObjectTicket}`,
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
      body: JSON.stringify(request.body),
      credentials: "omit",
    }
  );
  return (await response.json()) as CreateMaterialObjectTicketResponse;
};

export const ResolveMaterialObjectTicket = async (
  request: ResolveMaterialObjectTicketRequest
): Promise<ResolveMaterialObjectTicketResponse> => {
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.resolveObjectTicket}`,
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
      body: JSON.stringify(request.body),
      credentials: "omit",
    }
  );
  return (await response.json()) as ResolveMaterialObjectTicketResponse;
};

export const HardDeleteMyMaterialsByIds = async (
  request: HardDeleteMyMaterialsByIdsRequest
): Promise<HardDeleteMyMaterialsByIdsResponse> => {
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown") ??
    "unknown";
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.hardDeleteMyMaterialsByIds}`,
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

  return (await response.json()) as HardDeleteMyMaterialsByIdsResponse;
};
