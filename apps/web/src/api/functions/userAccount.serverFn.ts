import {
  BindDiscordAccountRequest,
  BindDiscordAccountResponse,
  BindGithubAccountRequest,
  BindGithubAccountResponse,
  BindGoogleAccountRequest,
  BindGoogleAccountResponse,
  BindXAccountRequest,
  BindXAccountResponse,
  GetMyAccountResponse,
  GetMyAccountResponseSchema,
  PrepareOAuthOperationRequest,
  PrepareOAuthOperationResponseSchema,
  UnbindDiscordAccountRequest,
  UnbindDiscordAccountResponse,
  UnbindGithubAccountRequest,
  UnbindGithubAccountResponse,
  UnbindGoogleAccountRequest,
  UnbindGoogleAccountResponse,
  UnbindXAccountRequest,
  UnbindXAccountResponse,
  UpdateMyAccountRequest,
  UpdateMyAccountResponse,
} from "@shared/api/interfaces/userAccount.interface";
import { APIURLPathDictionary, CurrentAPIBaseURL } from "@shared/api/url";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/start-server-core/request-response";
import { formatAPIResponse } from "@/api/adapters/apiResponse.adapter";
import { forwardUpstreamSetCookies } from "@/api/bridges/cookie.bridge";

export const PrepareOAuthOperation = createServerFn({ method: "POST" })
  .inputValidator((data: PrepareOAuthOperationRequest) => data)
  .handler(async ({ data: request }) => {
    const inboundCookie = getRequestHeader("cookie");
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
    const response = await fetch(
      `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.userAccount.prepareOAuthOperation}`,
      {
        method: "POST",
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
    return PrepareOAuthOperationResponseSchema.parse(
      await formatAPIResponse(response)
    );
  });

export const GetMyAccount = createServerFn({ method: "GET" }).handler(
  async (): Promise<GetMyAccountResponse> => {
    const inboundCookie = getRequestHeader("cookie");
    const response = await fetch(
      `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.userAccount.getMyAccount}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": getRequestHeader("User-Agent") ?? "unknown",
          "X-CSRF-Token": getRequestHeader("X-CSRF-Token") ?? "",
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        credentials: "include",
      }
    );

    forwardUpstreamSetCookies(response);
    return GetMyAccountResponseSchema.parse(await formatAPIResponse(response));
  }
);

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
    const formattedResponse = (await formatAPIResponse(
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
    const formattedResponse = (await formatAPIResponse(
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
    const formattedResponse = (await formatAPIResponse(
      response
    )) as BindGithubAccountResponse;

    return formattedResponse;
  });

export const BindXAccount = createServerFn({ method: "POST" })
  .inputValidator((data: BindXAccountRequest) => data)
  .handler(async ({ data: request }): Promise<BindXAccountResponse> => {
    const inboundCookie = getRequestHeader("cookie");
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
    const response = await fetch(
      `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.userAccount.bindXAccount}`,
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
    const formattedResponse = (await formatAPIResponse(
      response
    )) as BindXAccountResponse;

    return formattedResponse;
  });

export const BindDiscordAccount = createServerFn({ method: "POST" })
  .inputValidator((data: BindDiscordAccountRequest) => data)
  .handler(async ({ data: request }): Promise<BindDiscordAccountResponse> => {
    const inboundCookie = getRequestHeader("cookie");
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
    const response = await fetch(
      `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.userAccount.bindDiscordAccount}`,
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
    const formattedResponse = (await formatAPIResponse(
      response
    )) as BindDiscordAccountResponse;

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
    const formattedResponse = (await formatAPIResponse(
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
    const formattedResponse = (await formatAPIResponse(
      response
    )) as UnbindGithubAccountResponse;

    return formattedResponse;
  });

export const UnbindXAccount = createServerFn({ method: "POST" })
  .inputValidator((data: UnbindXAccountRequest) => data)
  .handler(async ({ data: request }): Promise<UnbindXAccountResponse> => {
    const inboundCookie = getRequestHeader("cookie");
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
    const response = await fetch(
      `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.userAccount.unbindXAccount}`,
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
    const formattedResponse = (await formatAPIResponse(
      response
    )) as UnbindXAccountResponse;

    return formattedResponse;
  });

export const UnbindDiscordAccount = createServerFn({ method: "POST" })
  .inputValidator((data: UnbindDiscordAccountRequest) => data)
  .handler(async ({ data: request }): Promise<UnbindDiscordAccountResponse> => {
    const inboundCookie = getRequestHeader("cookie");
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
    const response = await fetch(
      `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.userAccount.unbindDiscordAccount}`,
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
    const formattedResponse = (await formatAPIResponse(
      response
    )) as UnbindDiscordAccountResponse;

    return formattedResponse;
  });
