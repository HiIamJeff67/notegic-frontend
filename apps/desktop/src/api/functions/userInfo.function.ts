import type {
  GetMyInfoRequest,
  GetMyInfoResponse,
  UpdateMyInfoRequest,
  UpdateMyInfoResponse,
} from "@shared/api/interfaces/userInfo.interface";
import { APIURLPathDictionary, CurrentAPIBaseURL } from "@shared/lib/url/api";
import { getAccessToken } from "../tokens/accessToken";

export const UpdateMyInfo = async (
  request: UpdateMyInfoRequest
): Promise<UpdateMyInfoResponse> => {
  const formData = new FormData();
  formData.append("values", JSON.stringify(request.body.values));
  if (request.body.setNull) {
    formData.append("setNull", JSON.stringify(request.body.setNull));
  }
  if (request.body.avatarFile) {
    formData.append("avatarFile", request.body.avatarFile);
  }
  if (request.body.coverBackgroundFile) {
    formData.append("coverBackgroundFile", request.body.coverBackgroundFile);
  }

  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.userInfo.updateMyInfo}`,
    {
      method: "PUT",
      headers: {
        ...(getAccessToken()
          ? { Authorization: `Bearer ${getAccessToken()}` }
          : {}),
        "User-Agent": request.header?.userAgent ?? navigator.userAgent,
      },
      body: formData,
      credentials: "omit",
    }
  );

  return (await response.json()) as UpdateMyInfoResponse;
};

export const GetMyInfo = async (
  request: GetMyInfoRequest
): Promise<GetMyInfoResponse> => {
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown");
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.userInfo.getMyInfo}`,
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

  return (await response.json()) as GetMyInfoResponse;
};
