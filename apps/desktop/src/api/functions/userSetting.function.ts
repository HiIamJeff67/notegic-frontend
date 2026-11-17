import type {
  GetMySettingRequest,
  GetMySettingResponse,
  UpdateMySettingRequest,
  UpdateMySettingResponse,
} from "@shared/api/interfaces/userSetting.interface";
import { APIURLPathDictionary, CurrentAPIBaseURL } from "@shared/lib/url/api";
import { getAccessToken } from "../tokens/accessToken";

export const GetMySetting = async (
  request: GetMySettingRequest,
  signal?: AbortSignal
): Promise<GetMySettingResponse> => {
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.userSetting.getMySetting}`,
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
      signal: signal,
    }
  );
  return (await response.json()) as GetMySettingResponse;
};

export const UpdateMySetting = async (
  request: UpdateMySettingRequest,
  signal?: AbortSignal
): Promise<UpdateMySettingResponse> => {
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.userSetting.updateMySetting}`,
    {
      method: "PUT",
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
      signal: signal,
    }
  );
  return (await response.json()) as UpdateMySettingResponse;
};
