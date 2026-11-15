import { getClientCSRFToken } from "./csrfToken";

export const getClientRequestHeaders = (
  userAgent?: string,
  turnstileToken?: string | null
) => {
  const csrfToken = getClientCSRFToken();

  return {
    userAgent:
      userAgent ??
      (typeof navigator !== "undefined" ? navigator.userAgent : "unknown"),
    ...(csrfToken ? { csrfToken } : {}),
    ...(turnstileToken ? { turnstileToken } : {}),
  };
};

export const getClientMutationHeaders = (userAgent?: string) => {
  const headers = getClientRequestHeaders(userAgent);
  return { ...headers, csrfToken: headers.csrfToken ?? "" };
};
