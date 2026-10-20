import {
  GetMySettingRequest,
  GetMySettingResponse,
  UpdateMySettingRequest,
  UpdateMySettingResponse,
} from "@shared/api/interfaces/userSetting.interface";
import { getRetryAt } from "@shared/api/retry";
import { APIURLPathDictionary, CurrentAPIBaseURL } from "@shared/api/url";
import { readAPIResponse } from "@/api/adapters/apiResponse.adapter";
import { createServerFn } from "@tanstack/react-start";
import { getRequest, getRequestHeader } from "@tanstack/react-start/server";
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
        ...(request.header?.csrfToken
          ? { "X-CSRF-Token": request.header.csrfToken }
          : {}),
        ...(inboundCookie ? { Cookie: inboundCookie } : {}),
      },
      ...(method === "PUT" ? { body: JSON.stringify(request.body) } : {}),
      credentials: "include",
      signal: getRequest().signal,
    }
  );

  if (response.status === 429) {
    return {
      rateLimitedUntil: getRetryAt(response.headers.get("Retry-After")),
    };
  }

  forwardUpstreamSetCookies(response);
  const formattedResponse = await readAPIResponse(response);

  return formattedResponse;
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
