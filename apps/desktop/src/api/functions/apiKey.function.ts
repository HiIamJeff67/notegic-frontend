import type {
  CreateMyAPIKeyRequest,
  CreateMyAPIKeyResponse,
  ListMyAPIKeysRequest,
  ListMyAPIKeysResponse,
  RevokeMyAPIKeyRequest,
  RevokeMyAPIKeyResponse,
} from "@shared/api/interfaces/apiKey.interface";
import { APIURLPathDictionary, CurrentAPIBaseURL } from "@shared/lib/url/api";
import { getAccessToken } from "../tokens/accessToken";

export const CreateMyAPIKey = async (
  request: CreateMyAPIKeyRequest
): Promise<CreateMyAPIKeyResponse> => {
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.apiKey.create}`,
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

  return (await response.json()) as CreateMyAPIKeyResponse;
};

export const ListMyAPIKeys = async (
  request: ListMyAPIKeysRequest
): Promise<ListMyAPIKeysResponse> => {
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.apiKey.list}`,
    {
      method: "GET",
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
      credentials: "omit",
    }
  );

  return (await response.json()) as ListMyAPIKeysResponse;
};

export const RevokeMyAPIKey = async (
  request: RevokeMyAPIKeyRequest
): Promise<RevokeMyAPIKeyResponse> => {
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.apiKey.revoke(request.param.publicId)}`,
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
      credentials: "omit",
    }
  );

  return (await response.json()) as RevokeMyAPIKeyResponse;
};
