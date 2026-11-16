import {
  GetMySettingRequest,
  GetMySettingResponse,
  UpdateMySettingRequest,
  UpdateMySettingResponse,
} from "@shared/api/interfaces/userSetting.interface";
import { APIURLPathDictionary, CurrentAPIBaseURL } from "@shared/lib/url/api";
import { createServerFn } from "@tanstack/react-start";
import {
  getRequest,
  getRequestHeader,
} from "@tanstack/start-server-core/request-response";
import { forwardUpstreamSetCookies } from "@/api/functions/helpers/cookie";
import { format } from "@/api/functions/helpers/format";

export const GetMySetting = createServerFn({ method: "GET" })
  .inputValidator((data: GetMySettingRequest) => data)
  .handler(async ({ data: request }) => {
    const inboundCookie = getRequestHeader("cookie");
    const response = await fetch(
      `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.userSetting.getMySetting}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "User-Agent":
            request.header?.userAgent ??
            getRequestHeader("User-Agent") ??
            "unknown",
          "X-CSRF-Token":
            getRequestHeader("X-CSRF-Token") ?? request.header?.csrfToken ?? "",
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        credentials: "include",
        signal: getRequest().signal,
      }
    );
    forwardUpstreamSetCookies(response);
    return (await format(response)) as GetMySettingResponse;
  });

export const UpdateMySetting = createServerFn({ method: "POST" })
  .inputValidator((data: UpdateMySettingRequest) => data)
  .handler(async ({ data: request }) => {
    const inboundCookie = getRequestHeader("cookie");
    const response = await fetch(
      `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.userSetting.updateMySetting}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "User-Agent":
            request.header?.userAgent ??
            getRequestHeader("User-Agent") ??
            "unknown",
          "X-CSRF-Token":
            getRequestHeader("X-CSRF-Token") ?? request.header?.csrfToken ?? "",
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        body: JSON.stringify(request.body),
        credentials: "include",
        signal: getRequest().signal,
      }
    );
    forwardUpstreamSetCookies(response);
    return (await format(response)) as UpdateMySettingResponse;
  });
