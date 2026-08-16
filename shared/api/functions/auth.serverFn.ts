import { forwardUpstreamSetCookies } from "@shared/api/cookies/bridge";
import { NotegicAPIError, NotegicException } from "@shared/api/exceptions";
import {
  DeleteMeRequest,
  DeleteMeResponse,
  ForgetPasswordRequest,
  ForgetPasswordResponse,
  LoginRequest,
  LoginResponse,
  LoginViaGoogleRequest,
  LoginViaGoogleResponse,
  LogoutRequest,
  LogoutResponse,
  RegisterRequest,
  RegisterResponse,
  RegisterViaGoogleRequest,
  RegisterViaGoogleResponse,
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
import { isJsonResponse } from "@shared/util/isJsonContext";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";

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
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        body: JSON.stringify(request.body),
        credentials: "include",
      }
    );

    if (!isJsonResponse(response)) {
      throw new Error("error.encounterUnknownError");
    }
    forwardUpstreamSetCookies(response);
    const formattedResponse = (await response.json()) as RegisterResponse;
    if (formattedResponse.exception != null) {
      throw new NotegicAPIError(
        new NotegicException(formattedResponse.exception)
      );
    }
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
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        body: JSON.stringify(request.body),
        credentials: "include",
      }
    );
    if (!isJsonResponse(response))
      throw new Error("error.encounterUnknownError");
    forwardUpstreamSetCookies(response);
    const formattedResponse =
      (await response.json()) as RegisterViaGoogleResponse;
    if (formattedResponse.exception != null)
      throw new NotegicAPIError(
        new NotegicException(formattedResponse.exception)
      );
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
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        body: JSON.stringify(request.body),
        credentials: "include",
      }
    );
    if (!isJsonResponse(response))
      throw new Error("error.encounterUnknownError");
    forwardUpstreamSetCookies(response);
    const formattedResponse = (await response.json()) as LoginResponse;
    if (formattedResponse.exception != null)
      throw new NotegicAPIError(
        new NotegicException(formattedResponse.exception)
      );
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
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        body: JSON.stringify(request.body),
        credentials: "include",
      }
    );
    if (!isJsonResponse(response))
      throw new Error("error.encounterUnknownError");
    forwardUpstreamSetCookies(response);
    const formattedResponse = (await response.json()) as LoginViaGoogleResponse;
    if (formattedResponse.exception != null)
      throw new NotegicAPIError(
        new NotegicException(formattedResponse.exception)
      );
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
          ...(request.header?.csrfToken
            ? { "X-CSRF-Token": request.header.csrfToken }
            : {}),
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        credentials: "include",
      }
    );
    if (!isJsonResponse(response))
      throw new Error("error.encounterUnknownError");
    forwardUpstreamSetCookies(response);
    const rawResponse = (await response.json()) as Partial<LogoutResponse>;
    const formattedResponse = {
      ...rawResponse,
      exception: rawResponse.exception ?? null,
    } as LogoutResponse;
    if (formattedResponse.exception != null)
      throw new NotegicAPIError(
        new NotegicException(formattedResponse.exception)
      );
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
          ...(request.header?.csrfToken
            ? { "X-CSRF-Token": request.header.csrfToken }
            : {}),
        },
        body: JSON.stringify(request.body),
        credentials: "include",
      }
    );

    if (!isJsonResponse(response)) {
      throw new Error("error.encounterUnknownError");
    }
    const formattedResponse = (await response.json()) as SendAuthCodeResponse;
    if (formattedResponse.exception != null) {
      throw new NotegicAPIError(
        new NotegicException(formattedResponse.exception)
      );
    }

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
          "X-CSRF-Token": request.header.csrfToken,
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        body: JSON.stringify(request.body),
        credentials: "include",
      }
    );

    if (!isJsonResponse(response)) {
      throw new Error("error.encounterUnknownError");
    }
    forwardUpstreamSetCookies(response);
    const formattedResponse = (await response.json()) as ValidateEmailResponse;
    if (formattedResponse.exception != null) {
      throw new NotegicAPIError(
        new NotegicException(formattedResponse.exception)
      );
    }

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
          "X-CSRF-Token": request.header.csrfToken,
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        body: JSON.stringify(request.body),
        credentials: "include",
      }
    );

    if (!isJsonResponse(response)) {
      throw new Error("error.encounterUnknownError");
    }
    forwardUpstreamSetCookies(response);
    const formattedResponse = (await response.json()) as ResetEmailResponse;
    if (formattedResponse.exception != null) {
      throw new NotegicAPIError(
        new NotegicException(formattedResponse.exception)
      );
    }

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
          ...(request.header?.csrfToken
            ? { "X-CSRF-Token": request.header.csrfToken }
            : {}),
        },
        body: JSON.stringify(request.body),
        credentials: "include",
      }
    );

    if (!isJsonResponse(response)) {
      throw new Error("error.encounterUnknownError");
    }
    const formattedResponse = (await response.json()) as ForgetPasswordResponse;
    if (formattedResponse.exception != null) {
      throw new NotegicAPIError(
        new NotegicException(formattedResponse.exception)
      );
    }

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
          "X-CSRF-Token": request.header.csrfToken,
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        body: JSON.stringify(request.body),
        credentials: "include",
      }
    );

    if (!isJsonResponse(response)) {
      throw new Error("error.encounterUnknownError");
    }
    forwardUpstreamSetCookies(response);
    const formattedResponse = (await response.json()) as ResetMeResponse;
    if (formattedResponse.exception != null) {
      throw new NotegicAPIError(
        new NotegicException(formattedResponse.exception)
      );
    }

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
          "X-CSRF-Token": request.header.csrfToken,
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        body: JSON.stringify(request.body),
        credentials: "include",
      }
    );

    if (!isJsonResponse(response)) {
      throw new Error("error.encounterUnknownError");
    }
    const formattedResponse = (await response.json()) as DeleteMeResponse;
    if (formattedResponse.exception != null) {
      throw new NotegicAPIError(
        new NotegicException(formattedResponse.exception)
      );
    }

    return formattedResponse;
  });
