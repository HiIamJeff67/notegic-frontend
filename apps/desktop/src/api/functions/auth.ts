import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "@shared/api/interfaces/auth.interface";
import { APIURLPathDictionary, CurrentAPIBaseURL } from "@shared/lib/url/api";
import { getAccessToken } from "../tokens/accessToken";

export const Register = async (
  request: RegisterRequest
): Promise<RegisterResponse> => {
  const accessToken = getAccessToken();
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.auth.register}`,
    {
      method: "POST",
      credentials: "omit",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "User-Agent":
          request.header?.userAgent ??
          (typeof navigator !== "undefined" ? navigator.userAgent : "unknown"),
        ...(request.header?.turnstileToken
          ? { "X-Turnstile-Token": request.header.turnstileToken }
          : {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify(request.body),
    }
  );

  return (await response.json()) as RegisterResponse;
};

export const Login = async (request: LoginRequest): Promise<LoginResponse> => {
  const accessToken = getAccessToken();
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/${APIURLPathDictionary.auth.login}`,
    {
      method: "POST",
      credentials: "omit",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "User-Agent":
          request.header?.userAgent ??
          (typeof navigator !== "undefined" ? navigator.userAgent : "unknown"),
        ...(request.header?.turnstileToken
          ? { "X-Turnstile-Token": request.header.turnstileToken }
          : {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify(request.body),
    }
  );

  return (await response.json()) as LoginResponse;
};
