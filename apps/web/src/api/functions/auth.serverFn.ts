import {
  DeleteMeRequest,
  DeleteMeResponse,
  ForgetPasswordRequest,
  ForgetPasswordResponse,
  LoginRequest,
  LoginResponse,
  LoginViaDiscordRequest,
  LoginViaDiscordResponse,
  LoginViaGithubRequest,
  LoginViaGithubResponse,
  LoginViaGoogleRequest,
  LoginViaGoogleResponse,
  LoginViaXRequest,
  LoginViaXResponse,
  LogoutRequest,
  LogoutResponse,
  RegisterRequest,
  RegisterResponse,
  RegisterViaDiscordRequest,
  RegisterViaDiscordResponse,
  RegisterViaGithubRequest,
  RegisterViaGithubResponse,
  RegisterViaGoogleRequest,
  RegisterViaGoogleResponse,
  RegisterViaXRequest,
  RegisterViaXResponse,
  ResetEmailRequest,
  ResetEmailResponse,
  ResetMeRequest,
  ResetMeResponse,
  SendAuthCodeRequest,
  SendAuthCodeResponse,
  ValidateEmailRequest,
  ValidateEmailResponse,
} from "@shared/api/interfaces/auth.interface";
import { APIURLPathDictionary, CurrentAPIBaseURL } from "@shared/lib/url/api";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/start-server-core/request-response";
import { forwardUpstreamSetCookies } from "@/api/functions/helpers/cookie";
import { format } from "@/api/functions/helpers/format";

const hasAuthSession = (cookieHeader: string | undefined) =>
  (cookieHeader ?? "").split(";").some(cookie => {
    const separatorIndex = cookie.indexOf("=");
    if (separatorIndex < 1) return false;

    const name = cookie.slice(0, separatorIndex).trim();
    const value = cookie.slice(separatorIndex + 1).trim();

    return (
      (name === "accessToken" || name === "refreshToken") && value.length > 0
    );
  });

const HasAuthCookiesRpc = createServerFn({ method: "GET" }).handler(() =>
  hasAuthSession(getRequestHeader("cookie"))
);

export const HasAuthCookies = () => HasAuthCookiesRpc();

const RegisterRpc = createServerFn({ method: "POST" })
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
    const formattedResponse = (await format(response)) as RegisterResponse;

    return formattedResponse;
  });

export const Register = (request: RegisterRequest) =>
  RegisterRpc({ data: request });

const RegisterViaGoogleRpc = createServerFn({ method: "POST" })
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
    const formattedResponse = (await format(
      response
    )) as RegisterViaGoogleResponse;

    return formattedResponse;
  });

export const RegisterViaGoogle = (request: RegisterViaGoogleRequest) =>
  RegisterViaGoogleRpc({ data: request });

const RegisterViaGithubRpc = createServerFn({ method: "POST" })
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
    const formattedResponse = (await format(
      response
    )) as RegisterViaGithubResponse;

    return formattedResponse;
  });

export const RegisterViaGithub = (request: RegisterViaGithubRequest) =>
  RegisterViaGithubRpc({ data: request });

const RegisterViaXRpc = createServerFn({ method: "POST" })
  .inputValidator((data: RegisterViaXRequest) => data)
  .handler(async ({ data: request }): Promise<RegisterViaXResponse> => {
    const inboundCookie = getRequestHeader("cookie");
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
    const response = await fetch(
      `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.auth.registerViaX}`,
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
    const formattedResponse = (await format(response)) as RegisterViaXResponse;

    return formattedResponse;
  });

export const RegisterViaX = (request: RegisterViaXRequest) =>
  RegisterViaXRpc({ data: request });

const RegisterViaDiscordRpc = createServerFn({ method: "POST" })
  .inputValidator((data: RegisterViaDiscordRequest) => data)
  .handler(async ({ data: request }): Promise<RegisterViaDiscordResponse> => {
    const inboundCookie = getRequestHeader("cookie");
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
    const response = await fetch(
      `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.auth.registerViaDiscord}`,
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
    const formattedResponse = (await format(
      response
    )) as RegisterViaDiscordResponse;

    return formattedResponse;
  });

export const RegisterViaDiscord = (request: RegisterViaDiscordRequest) =>
  RegisterViaDiscordRpc({ data: request });

const LoginRpc = createServerFn({ method: "POST" })
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
    const formattedResponse = (await format(response)) as LoginResponse;

    return formattedResponse;
  });

export const Login = (request: LoginRequest) => LoginRpc({ data: request });

const LoginViaGoogleRpc = createServerFn({ method: "POST" })
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
    const formattedResponse = (await format(
      response
    )) as LoginViaGoogleResponse;

    return formattedResponse;
  });

export const LoginViaGoogle = (request: LoginViaGoogleRequest) =>
  LoginViaGoogleRpc({ data: request });

const LoginViaGithubRpc = createServerFn({ method: "POST" })
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
    const formattedResponse = (await format(
      response
    )) as LoginViaGithubResponse;

    return formattedResponse;
  });

export const LoginViaGithub = (request: LoginViaGithubRequest) =>
  LoginViaGithubRpc({ data: request });

const LoginViaXRpc = createServerFn({ method: "POST" })
  .inputValidator((data: LoginViaXRequest) => data)
  .handler(async ({ data: request }): Promise<LoginViaXResponse> => {
    const inboundCookie = getRequestHeader("cookie");
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
    const response = await fetch(
      `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.auth.loginViaX}`,
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
    const formattedResponse = (await format(response)) as LoginViaXResponse;

    return formattedResponse;
  });

export const LoginViaX = (request: LoginViaXRequest) =>
  LoginViaXRpc({ data: request });

const LoginViaDiscordRpc = createServerFn({ method: "POST" })
  .inputValidator((data: LoginViaDiscordRequest) => data)
  .handler(async ({ data: request }): Promise<LoginViaDiscordResponse> => {
    const inboundCookie = getRequestHeader("cookie");
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
    const response = await fetch(
      `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.auth.loginViaDiscord}`,
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
    const formattedResponse = (await format(
      response
    )) as LoginViaDiscordResponse;

    return formattedResponse;
  });

export const LoginViaDiscord = (request: LoginViaDiscordRequest) =>
  LoginViaDiscordRpc({ data: request });

const LogoutRpc = createServerFn({ method: "POST" })
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
    const rawResponse = (await format(response)) as Partial<LogoutResponse>;
    const formattedResponse = {
      ...rawResponse,
      exception: rawResponse.exception ?? null,
    } as LogoutResponse;

    return formattedResponse;
  });

export const Logout = (request: LogoutRequest) => LogoutRpc({ data: request });

const SendAuthCodeRpc = createServerFn({ method: "POST" })
  .inputValidator((data: SendAuthCodeRequest) => data)
  .handler(async ({ data: request }): Promise<SendAuthCodeResponse> => {
    const inboundCookie = getRequestHeader("cookie");
    const authenticated = hasAuthSession(inboundCookie);
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
          ...(authenticated && inboundCookie ? { Cookie: inboundCookie } : {}),
          ...(!authenticated && request.header?.turnstileToken
            ? { "X-Turnstile-Token": request.header.turnstileToken }
            : {}),
        },
        body: JSON.stringify(request.body),
        credentials: "include",
      }
    );

    const formattedResponse = (await format(response)) as SendAuthCodeResponse;

    return formattedResponse;
  });

export const SendAuthCode = (request: SendAuthCodeRequest) =>
  SendAuthCodeRpc({ data: request });

const ValidateEmailRpc = createServerFn({ method: "POST" })
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
    const formattedResponse = (await format(response)) as ValidateEmailResponse;

    return formattedResponse;
  });

export const ValidateEmail = (request: ValidateEmailRequest) =>
  ValidateEmailRpc({ data: request });

const ResetEmailRpc = createServerFn({ method: "POST" })
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
    const formattedResponse = (await format(response)) as ResetEmailResponse;

    return formattedResponse;
  });

export const ResetEmail = (request: ResetEmailRequest) =>
  ResetEmailRpc({ data: request });

const ForgetPasswordRpc = createServerFn({ method: "POST" })
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

    const formattedResponse = (await format(
      response
    )) as ForgetPasswordResponse;

    return formattedResponse;
  });

export const ForgetPassword = (request: ForgetPasswordRequest) =>
  ForgetPasswordRpc({ data: request });

const ResetMeRpc = createServerFn({ method: "POST" })
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
    const formattedResponse = (await format(response)) as ResetMeResponse;

    return formattedResponse;
  });

export const ResetMe = (request: ResetMeRequest) =>
  ResetMeRpc({ data: request });

const DeleteMeRpc = createServerFn({ method: "POST" })
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

    const formattedResponse = (await format(response)) as DeleteMeResponse;

    return formattedResponse;
  });

export const DeleteMe = (request: DeleteMeRequest) =>
  DeleteMeRpc({ data: request });
