import { NotegicAPIError, NotegicException } from "@shared/api/exceptions";
import {
  GetMySettingRequest,
  GetMySettingResponse,
  UpdateMySettingRequest,
  UpdateMySettingResponse,
} from "@shared/api/interfaces/userSetting.interface";
import { APIURLPathDictionary, CurrentAPIBaseURL } from "@shared/api/url";
import { isJsonResponse } from "@shared/util/isJsonContext";
import { createServerFn } from "@tanstack/react-start";
import { getRequest, getRequestHeader } from "@tanstack/react-start/server";
import { forwardUpstreamSetCookies } from "@/api/cookies/bridge";
import { getRetryAt } from "@/api/retry";

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
  if (!isJsonResponse(response)) throw new Error("error.encounterUnknownError");
  forwardUpstreamSetCookies(response);
  const formattedResponse = await response.json();
  if (formattedResponse.exception != null) {
    throw new NotegicAPIError(
      new NotegicException(formattedResponse.exception)
    );
  }
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
