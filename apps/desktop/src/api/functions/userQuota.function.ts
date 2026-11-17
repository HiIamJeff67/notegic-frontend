import type {
  GetMyQuotaRequest,
  GetMyQuotaResponse,
} from "@shared/api/interfaces/userQuota.interface";
import { APIURLPathDictionary, CurrentAPIBaseURL } from "@shared/lib/url/api";
import { getAccessToken } from "../tokens/accessToken";

export const GetMyQuota = async (
  request: GetMyQuotaRequest
): Promise<GetMyQuotaResponse> => {
  const userAgent =
    request.header?.userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown");
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.userQuota.getMyQuota}`,
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

  return (await response.json()) as GetMyQuotaResponse;
};
