import { NotegicAPIError } from "@shared/api/exceptions";
import {
  GetMySettingRequest,
  GetMySettingResponse,
  UpdateMySettingRequest,
  UpdateMySettingResponse,
} from "@shared/api/interfaces/userSetting.interface";
import { getRetryAt } from "@shared/api/retry";
import { APIURLPathDictionary, CurrentAPIBaseURL } from "@shared/api/url";
import { createServerFn } from "@tanstack/react-start";
import { getRequest, getRequestHeader } from "@tanstack/react-start/server";
import { readAPIResponse } from "@/api/adapters/apiResponse.adapter";
import { forwardUpstreamSetCookies } from "@/api/bridges/cookie.bridge";

const requestUpstream = async (
  request: GetMySettingRequest | UpdateMySettingRequest,
  method: "GET" | "PUT"
) => {
  const inboundCookie = getRequestHeader("cookie");
  const userAgent =
    request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
  const response = await fetch(
    `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.userSetting.getMySetting}`,
    {
      method,
      headers: {
        "Content-Type": "application/json",
        "User-Agent": userAgent,
        "X-CSRF-Token":
          getRequestHeader("X-CSRF-Token") ?? request.header?.csrfToken ?? "",
        ...(inboundCookie ? { Cookie: inboundCookie } : {}),
      },
      ...(method === "PUT" ? { body: JSON.stringify(request.body) } : {}),
      credentials: "include",
      signal: getRequest().signal,
    }
  );

  forwardUpstreamSetCookies(response);
  try {
    return await readAPIResponse(response);
  } catch (error) {
    if (response.status === 429 && error instanceof NotegicAPIError)
      return {
        rateLimitedUntil: getRetryAt(response.headers.get("Retry-After")),
      };
    throw error;
  }
};

export const GetMySetting = createServerFn({ method: "GET" })
  .inputValidator((data: GetMySettingRequest) => data)
  .handler(
    async ({ data }) =>
      (await requestUpstream(data, "GET")) as
        | GetMySettingResponse
        | { rateLimitedUntil: number }
  );

export const UpdateMySetting = createServerFn({ method: "POST" })
  .inputValidator((data: UpdateMySettingRequest) => data)
  .handler(
    async ({ data }) =>
      (await requestUpstream(data, "PUT")) as
        | UpdateMySettingResponse
        | { rateLimitedUntil: number }
  );
