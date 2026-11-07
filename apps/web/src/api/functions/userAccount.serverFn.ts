import {
  BindGoogleAccountRequest,
  BindGithubAccountRequest,
  BindMetaAccountRequest,
  BindGoogleAccountResponse,
  BindGithubAccountResponse,
  BindMetaAccountResponse,
  GetMyAccountRequest,
  GetMyAccountResponse,
  UnbindGoogleAccountRequest,
  UnbindGithubAccountRequest,
  UnbindMetaAccountRequest,
  UnbindGoogleAccountResponse,
  UnbindGithubAccountResponse,
  UnbindMetaAccountResponse,
  UpdateMyAccountRequest,
  UpdateMyAccountResponse,
} from "@shared/api/interfaces/userAccount.interface";
import { APIURLPathDictionary, CurrentAPIBaseURL } from "@shared/api/url";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/start-server-core/request-response";
import { readAPIResponse } from "@/api/adapters/apiResponse.adapter";
import { forwardUpstreamSetCookies } from "@/api/bridges/cookie.bridge";

export const GetMyAccount = createServerFn({ method: "GET" })
  .inputValidator((data: GetMyAccountRequest) => data)
  .handler(async ({ data: request }): Promise<GetMyAccountResponse> => {
    const inboundCookie = getRequestHeader("cookie");
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
    const response = await fetch(
      `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.userAccount.getMyAccount}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": userAgent,
          "X-CSRF-Token":
            getRequestHeader("X-CSRF-Token") ?? request.header?.csrfToken ?? "",
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        credentials: "include",
      }
    );

    forwardUpstreamSetCookies(response);
    const formattedResponse = (await readAPIResponse(
      response
    )) as GetMyAccountResponse;

    return formattedResponse;
  });

export const UpdateMyAccount = createServerFn({ method: "POST" })
  .inputValidator((data: UpdateMyAccountRequest) => data)
  .handler(async ({ data: request }): Promise<UpdateMyAccountResponse> => {
    const inboundCookie = getRequestHeader("cookie");
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
    const response = await fetch(
      `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.userAccount.updatedMyAccount}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": userAgent,
          "X-CSRF-Token":
            getRequestHeader("X-CSRF-Token") ?? request.header?.csrfToken ?? "",
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        body: JSON.stringify(request.body),
        credentials: "include",
      }
    );

    forwardUpstreamSetCookies(response);
    const formattedResponse = (await readAPIResponse(
      response
    )) as UpdateMyAccountResponse;

    return formattedResponse;
  });

export const BindGoogleAccount = createServerFn({ method: "POST" })
  .inputValidator((data: BindGoogleAccountRequest) => data)
  .handler(async ({ data: request }): Promise<BindGoogleAccountResponse> => {
    const inboundCookie = getRequestHeader("cookie");
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
    const response = await fetch(
      `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.userAccount.bindGoogleAccount}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": userAgent,
          "X-CSRF-Token":
            getRequestHeader("X-CSRF-Token") ?? request.header?.csrfToken ?? "",
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        body: JSON.stringify(request.body),
        credentials: "include",
      }
    );

    forwardUpstreamSetCookies(response);
    const formattedResponse = (await readAPIResponse(
      response
    )) as BindGoogleAccountResponse;

    return formattedResponse;
  });

export const BindGithubAccount = createServerFn({ method: "POST" })
  .inputValidator((data: BindGithubAccountRequest) => data)
  .handler(async ({ data: request }): Promise<BindGithubAccountResponse> => {
    const inboundCookie = getRequestHeader("cookie");
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
    const response = await fetch(
      `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.userAccount.bindGithubAccount}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": userAgent,
          "X-CSRF-Token":
            getRequestHeader("X-CSRF-Token") ?? request.header?.csrfToken ?? "",
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        body: JSON.stringify(request.body),
        credentials: "include",
      }
    );

    forwardUpstreamSetCookies(response);
    const formattedResponse = (await readAPIResponse(
      response
    )) as BindGithubAccountResponse;

    return formattedResponse;
  });

export const BindMetaAccount = createServerFn({ method: "POST" })
  .inputValidator((data: BindMetaAccountRequest) => data)
  .handler(async ({ data: request }): Promise<BindMetaAccountResponse> => {
    const inboundCookie = getRequestHeader("cookie");
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
    const response = await fetch(
      `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.userAccount.bindMetaAccount}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": userAgent,
          "X-CSRF-Token":
            getRequestHeader("X-CSRF-Token") ?? request.header?.csrfToken ?? "",
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        body: JSON.stringify(request.body),
        credentials: "include",
      }
    );

    forwardUpstreamSetCookies(response);
    const formattedResponse = (await readAPIResponse(
      response
    )) as BindMetaAccountResponse;

    return formattedResponse;
  });

export const UnbindGoogleAccount = createServerFn({ method: "POST" })
  .inputValidator((data: UnbindGoogleAccountRequest) => data)
  .handler(async ({ data: request }): Promise<UnbindGoogleAccountResponse> => {
    const inboundCookie = getRequestHeader("cookie");
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
    const response = await fetch(
      `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.userAccount.unbindGoogleAccount}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": userAgent,
          "X-CSRF-Token":
            getRequestHeader("X-CSRF-Token") ?? request.header?.csrfToken ?? "",
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        body: JSON.stringify(request.body),
        credentials: "include",
      }
    );

    forwardUpstreamSetCookies(response);
    const formattedResponse = (await readAPIResponse(
      response
    )) as UnbindGoogleAccountResponse;

    return formattedResponse;
  });

export const UnbindGithubAccount = createServerFn({ method: "POST" })
  .inputValidator((data: UnbindGithubAccountRequest) => data)
  .handler(async ({ data: request }): Promise<UnbindGithubAccountResponse> => {
    const inboundCookie = getRequestHeader("cookie");
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
    const response = await fetch(
      `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.userAccount.unbindGithubAccount}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": userAgent,
          "X-CSRF-Token":
            getRequestHeader("X-CSRF-Token") ?? request.header?.csrfToken ?? "",
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        body: JSON.stringify(request.body),
        credentials: "include",
      }
    );

    forwardUpstreamSetCookies(response);
    const formattedResponse = (await readAPIResponse(
      response
    )) as UnbindGithubAccountResponse;

    return formattedResponse;
  });

export const UnbindMetaAccount = createServerFn({ method: "POST" })
  .inputValidator((data: UnbindMetaAccountRequest) => data)
  .handler(async ({ data: request }): Promise<UnbindMetaAccountResponse> => {
    const inboundCookie = getRequestHeader("cookie");
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
    const response = await fetch(
      `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.userAccount.unbindMetaAccount}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": userAgent,
          "X-CSRF-Token":
            getRequestHeader("X-CSRF-Token") ?? request.header?.csrfToken ?? "",
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        body: JSON.stringify(request.body),
        credentials: "include",
      }
    );

    forwardUpstreamSetCookies(response);
    const formattedResponse = (await readAPIResponse(
      response
    )) as UnbindMetaAccountResponse;

    return formattedResponse;
  });
