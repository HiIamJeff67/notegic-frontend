import type {
  GetMeRequest,
  GetMeResponse,
  GetUserDataRequest,
  GetUserDataResponse,
  UpdateMeRequest,
  UpdateMeResponse,
} from "@shared/api/interfaces/user.interface";
import { APIURLPathDictionary, CurrentAPIBaseURL } from "@shared/lib/url/api";
import { getAccessToken } from "../tokens/accessToken";

export const GetUserData = async (
  request: GetUserDataRequest
): Promise<GetUserDataResponse> => {
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown");
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.user.getUserData}`,
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

  return (await response.json()) as GetUserDataResponse;
};

export const GetMe = async (request: GetMeRequest): Promise<GetMeResponse> => {
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown");
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.user.getMe}`,
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

  return (await response.json()) as GetMeResponse;
};

export const UpdateMe = async (
  request: UpdateMeRequest
): Promise<UpdateMeResponse> => {
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown");
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.user.updateMe}`,
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

  return (await response.json()) as UpdateMeResponse;
};

export const TryGetUserData = async (
  request: GetUserDataRequest
): Promise<boolean> => {
  if (getAccessToken().length === 0) return false;
  const response = await GetUserData(request);
  return response.success === true && response.exception == null;
};
