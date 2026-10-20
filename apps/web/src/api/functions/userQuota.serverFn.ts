import {
  GetMyQuotaRequest,
  GetMyQuotaResponse,
} from "@shared/api/interfaces/userQuota.interface";
import { APIURLPathDictionary, CurrentAPIBaseURL } from "@shared/api/url";
import { readAPIResponse } from "@/api/adapters/apiResponse.adapter";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { forwardUpstreamSetCookies } from "@/api/bridges/cookie.bridge";

export const GetMyQuota = createServerFn({ method: "GET" })
  .inputValidator((data: GetMyQuotaRequest) => data)
  .handler(async ({ data: request }): Promise<GetMyQuotaResponse> => {
    const inboundCookie = getRequestHeader("cookie");
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
    const response = await fetch(
      `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.userQuota.getMyQuota}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": userAgent,
          ...(request.header?.csrfToken
            ? { "X-CSRF-Token": request.header.csrfToken }
            : {}),
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        credentials: "include",
      }
    );

    forwardUpstreamSetCookies(response);
    const formattedResponse = (await readAPIResponse(
      response
    )) as GetMyQuotaResponse;

    return formattedResponse;
  });
