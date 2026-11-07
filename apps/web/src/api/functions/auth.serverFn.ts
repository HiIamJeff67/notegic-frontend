import {
  DeleteMeRequest,
  DeleteMeResponse,
  ForgetPasswordRequest,
  ForgetPasswordResponse,
  LoginRequest,
  LoginResponse,
  LoginViaGoogleRequest,
  LoginViaGithubRequest,
  LoginViaMetaRequest,
  LoginViaGoogleResponse,
  LoginViaGithubResponse,
  LoginViaMetaResponse,
  LogoutRequest,
  LogoutResponse,
  RegisterRequest,
  RegisterResponse,
  RegisterViaGoogleRequest,
  RegisterViaGithubRequest,
  RegisterViaMetaRequest,
  RegisterViaGoogleResponse,
  RegisterViaGithubResponse,
  RegisterViaMetaResponse,
  ResetEmailRequest,
  ResetEmailResponse,
  ResetMeRequest,
  ResetMeResponse,
  SendAuthCodeRequest,
  SendAuthCodeResponse,
  ValidateEmailRequest,
  ValidateEmailResponse,
} from "@shared/api/interfaces/auth.interface";
import { APIURLPathDictionary, CurrentAPIBaseURL } from "@shared/api/url";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/start-server-core/request-response";
import { readAPIResponse } from "@/api/adapters/apiResponse.adapter";
import { forwardUpstreamSetCookies } from "@/api/bridges/cookie.bridge";

export const HasAuthCookies = createServerFn({ method: "GET" }).handler(() => {
  const cookieHeader = getRequestHeader("cookie") ?? "";

  return cookieHeader.split(";").some(cookie => {
    const separatorIndex = cookie.indexOf("=");
    if (separatorIndex < 1) return false;

    const name = cookie.slice(0, separatorIndex).trim();
    const value = cookie.slice(separatorIndex + 1).trim();

    return (
      (name === "accessToken" || name === "refreshToken") && value.length > 0
    );
  });
});

export const Register = createServerFn({ method: "POST" })
  .inputValidator((data: RegisterRequest) => data)
  .handler(async ({ data: request }): Promise<RegisterResponse> => {
    const inboundCookie = getRequestHeader("cookie");
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
    const response = await fetch(
      `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.auth.register}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": userAgent,
          ...(request.header?.turnstileToken
            ? { "X-Turnstile-Token": request.header.turnstileToken }
            : {}),
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        body: JSON.stringify(request.body),
        credentials: "include",
      }
    );

    forwardUpstreamSetCookies(response);
    const formattedResponse = (await readAPIResponse(
      response
    )) as RegisterResponse;

    return formattedResponse;
  });

export const RegisterViaGoogle = createServerFn({ method: "POST" })
  .inputValidator((data: RegisterViaGoogleRequest) => data)
  .handler(async ({ data: request }): Promise<RegisterViaGoogleResponse> => {
    const inboundCookie = getRequestHeader("cookie");
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
    const response = await fetch(
      `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.auth.registerViaGoogle}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": userAgent,
          ...(request.header?.turnstileToken
            ? { "X-Turnstile-Token": request.header.turnstileToken }
            : {}),
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        body: JSON.stringify(request.body),
        credentials: "include",
      }
    );

    forwardUpstreamSetCookies(response);
    const formattedResponse = (await readAPIResponse(
      response
    )) as RegisterViaGoogleResponse;

    return formattedResponse;
  });

export const RegisterViaGithub = createServerFn({ method: "POST" })
  .inputValidator((data: RegisterViaGithubRequest) => data)
  .handler(async ({ data: request }): Promise<RegisterViaGithubResponse> => {
    const inboundCookie = getRequestHeader("cookie");
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
    const response = await fetch(
      `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.auth.registerViaGithub}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": userAgent,
          ...(request.header?.turnstileToken
            ? { "X-Turnstile-Token": request.header.turnstileToken }
            : {}),
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        body: JSON.stringify(request.body),
        credentials: "include",
      }
    );

    forwardUpstreamSetCookies(response);
    const formattedResponse = (await readAPIResponse(
      response
    )) as RegisterViaGithubResponse;

    return formattedResponse;
  });

export const RegisterViaMeta = createServerFn({ method: "POST" })
  .inputValidator((data: RegisterViaMetaRequest) => data)
  .handler(async ({ data: request }): Promise<RegisterViaMetaResponse> => {
    const inboundCookie = getRequestHeader("cookie");
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
    const response = await fetch(
      `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.auth.registerViaMeta}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": userAgent,
          ...(request.header?.turnstileToken
            ? { "X-Turnstile-Token": request.header.turnstileToken }
            : {}),
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        body: JSON.stringify(request.body),
        credentials: "include",
      }
    );

    forwardUpstreamSetCookies(response);
    const formattedResponse = (await readAPIResponse(
      response
    )) as RegisterViaMetaResponse;

    return formattedResponse;
  });

export const Login = createServerFn({ method: "POST" })
  .inputValidator((data: LoginRequest) => data)
  .handler(async ({ data: request }): Promise<LoginResponse> => {
    const inboundCookie = getRequestHeader("cookie");
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
    const response = await fetch(
      `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.auth.login}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": userAgent,
          ...(request.header?.turnstileToken
            ? { "X-Turnstile-Token": request.header.turnstileToken }
            : {}),
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        body: JSON.stringify(request.body),
        credentials: "include",
      }
    );

    forwardUpstreamSetCookies(response);
    const formattedResponse = (await readAPIResponse(
      response
    )) as LoginResponse;

    return formattedResponse;
  });

export const LoginViaGoogle = createServerFn({ method: "POST" })
  .inputValidator((data: LoginViaGoogleRequest) => data)
  .handler(async ({ data: request }): Promise<LoginViaGoogleResponse> => {
    const inboundCookie = getRequestHeader("cookie");
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
    const response = await fetch(
      `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.auth.loginViaGoogle}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": userAgent,
          ...(request.header?.turnstileToken
            ? { "X-Turnstile-Token": request.header.turnstileToken }
            : {}),
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        body: JSON.stringify(request.body),
        credentials: "include",
      }
    );

    forwardUpstreamSetCookies(response);
    const formattedResponse = (await readAPIResponse(
      response
    )) as LoginViaGoogleResponse;

    return formattedResponse;
  });

export const LoginViaGithub = createServerFn({ method: "POST" })
  .inputValidator((data: LoginViaGithubRequest) => data)
  .handler(async ({ data: request }): Promise<LoginViaGithubResponse> => {
    const inboundCookie = getRequestHeader("cookie");
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
    const response = await fetch(
      `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.auth.loginViaGithub}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": userAgent,
          ...(request.header?.turnstileToken
            ? { "X-Turnstile-Token": request.header.turnstileToken }
            : {}),
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        body: JSON.stringify(request.body),
        credentials: "include",
      }
    );

    forwardUpstreamSetCookies(response);
    const formattedResponse = (await readAPIResponse(
      response
    )) as LoginViaGithubResponse;

    return formattedResponse;
  });

export const LoginViaMeta = createServerFn({ method: "POST" })
  .inputValidator((data: LoginViaMetaRequest) => data)
  .handler(async ({ data: request }): Promise<LoginViaMetaResponse> => {
    const inboundCookie = getRequestHeader("cookie");
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
    const response = await fetch(
      `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.auth.loginViaMeta}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": userAgent,
          ...(request.header?.turnstileToken
            ? { "X-Turnstile-Token": request.header.turnstileToken }
            : {}),
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        body: JSON.stringify(request.body),
        credentials: "include",
      }
    );

    forwardUpstreamSetCookies(response);
    const formattedResponse = (await readAPIResponse(
      response
    )) as LoginViaMetaResponse;

    return formattedResponse;
  });

export const Logout = createServerFn({ method: "POST" })
  .inputValidator((data: LogoutRequest) => data)
  .handler(async ({ data: request }): Promise<LogoutResponse> => {
    const inboundCookie = getRequestHeader("cookie");
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
    const response = await fetch(
      `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.auth.logout}`,
      {
        method: "POST",
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
    const rawResponse = (await readAPIResponse(
      response
    )) as Partial<LogoutResponse>;
    const formattedResponse = {
      ...rawResponse,
      exception: rawResponse.exception ?? null,
    } as LogoutResponse;

    return formattedResponse;
  });

export const SendAuthCode = createServerFn({ method: "POST" })
  .inputValidator((data: SendAuthCodeRequest) => data)
  .handler(async ({ data: request }): Promise<SendAuthCodeResponse> => {
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
    const response = await fetch(
      `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.auth.sendAuthCode}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": userAgent,
          "X-CSRF-Token":
            getRequestHeader("X-CSRF-Token") ?? request.header?.csrfToken ?? "",
          ...(request.header?.turnstileToken
            ? { "X-Turnstile-Token": request.header.turnstileToken }
            : {}),
        },
        body: JSON.stringify(request.body),
        credentials: "include",
      }
    );

    const formattedResponse = (await readAPIResponse(
      response
    )) as SendAuthCodeResponse;

    return formattedResponse;
  });

export const ValidateEmail = createServerFn({ method: "POST" })
  .inputValidator((data: ValidateEmailRequest) => data)
  .handler(async ({ data: request }): Promise<ValidateEmailResponse> => {
    const inboundCookie = getRequestHeader("cookie");
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
    const response = await fetch(
      `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.auth.validateEmail}`,
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
    )) as ValidateEmailResponse;

    return formattedResponse;
  });

export const ResetEmail = createServerFn({ method: "POST" })
  .inputValidator((data: ResetEmailRequest) => data)
  .handler(async ({ data: request }): Promise<ResetEmailResponse> => {
    const inboundCookie = getRequestHeader("cookie");
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
    const response = await fetch(
      `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.auth.resetEmail}`,
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
    )) as ResetEmailResponse;

    return formattedResponse;
  });

export const ForgetPassword = createServerFn({ method: "POST" })
  .inputValidator((data: ForgetPasswordRequest) => data)
  .handler(async ({ data: request }): Promise<ForgetPasswordResponse> => {
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
    const response = await fetch(
      `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.auth.forgetPassword}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": userAgent,
          "X-CSRF-Token":
            getRequestHeader("X-CSRF-Token") ?? request.header?.csrfToken ?? "",
        },
        body: JSON.stringify(request.body),
        credentials: "include",
      }
    );

    const formattedResponse = (await readAPIResponse(
      response
    )) as ForgetPasswordResponse;

    return formattedResponse;
  });

export const ResetMe = createServerFn({ method: "POST" })
  .inputValidator((data: ResetMeRequest) => data)
  .handler(async ({ data: request }): Promise<ResetMeResponse> => {
    const inboundCookie = getRequestHeader("cookie");
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
    const response = await fetch(
      `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.auth.resetMe}`,
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
    )) as ResetMeResponse;

    return formattedResponse;
  });

export const DeleteMe = createServerFn({ method: "POST" })
  .inputValidator((data: DeleteMeRequest) => data)
  .handler(async ({ data: request }): Promise<DeleteMeResponse> => {
    const inboundCookie = getRequestHeader("cookie");
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
    const response = await fetch(
      `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.auth.deleteMe}`,
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

    const formattedResponse = (await readAPIResponse(
      response
    )) as DeleteMeResponse;

    return formattedResponse;
  });
