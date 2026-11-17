import { UserSettingExceptions } from "@shared/api/exceptions/userSetting.exception";
import {
  GetMySettingRequest,
  GetMySettingResponse,
  UpdateMySettingRequest,
  UpdateMySettingResponse,
} from "@shared/api/interfaces/userSetting.interface";
import { getRetryClient, minimumRetryDelayMs } from "@shared/api/retryClient";
import { APIURLPathDictionary, CurrentAPIBaseURL } from "@shared/lib/url/api";
import { createServerFn } from "@tanstack/react-start";
import {
  getRequest,
  getRequestHeader,
} from "@tanstack/start-server-core/request-response";
import { forwardUpstreamSetCookies } from "@/api/functions/helpers/cookie";
import { format } from "@/api/functions/helpers/format";
import { fetchServerFunction } from "@/api/functions/serverFn";

const GetMySettingRpc = createServerFn({ method: "GET" })
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

export const GetMySetting = (
  request: GetMySettingRequest,
  signal?: AbortSignal
) =>
  GetMySettingRpc({
    data: request,
    signal,
    fetch: getRetryClient().createFetch({
      scope: UserSettingExceptions.RetryScope,
      fetch: fetchServerFunction,
      minimumDelayMs: minimumRetryDelayMs,
      paused: retryAt => {
        throw UserSettingExceptions.TooManyRequests(retryAt);
      },
    }),
  });

const UpdateMySettingRpc = createServerFn({ method: "POST" })
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

export const UpdateMySetting = (
  request: UpdateMySettingRequest,
  signal?: AbortSignal
) =>
  UpdateMySettingRpc({
    data: request,
    signal,
    fetch: getRetryClient().createFetch({
      scope: UserSettingExceptions.RetryScope,
      fetch: fetchServerFunction,
      minimumDelayMs: minimumRetryDelayMs,
      paused: retryAt => {
        throw UserSettingExceptions.TooManyRequests(retryAt);
      },
    }),
  });
