import { forwardUpstreamSetCookies } from "@shared/api/cookies/bridge";
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
import { getRequestHeader } from "@tanstack/react-start/server";

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
    }
  );

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
      (await requestUpstream(data, "GET")) as GetMySettingResponse
  );

export const UpdateMySetting = createServerFn({ method: "POST" })
  .inputValidator((data: UpdateMySettingRequest) => data)
  .handler(
    async ({ data }) =>
      (await requestUpstream(data, "PUT")) as UpdateMySettingResponse
  );
