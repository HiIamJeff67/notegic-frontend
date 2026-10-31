import {
  SessionStorage,
  SessionStorageKey,
} from "@shared/lib/storage/sessionStorage";

const getCSRFCookieName = () =>
  window.location.protocol === "https:"
    ? "__Host-notegic-csrf"
    : "notegic_csrf";

export const setClientCSRFToken = (token: unknown): boolean => {
  if (
    typeof window === "undefined" ||
    typeof document === "undefined" ||
    typeof token !== "string" ||
    token.trim() === ""
  )
    return false;

  try {
    // Like the authentication cookies, CSRF state must be shared across tabs.
    document.cookie = `${getCSRFCookieName()}=${encodeURIComponent(token)}; Path=/; SameSite=Strict; Max-Age=604800${window.location.protocol === "https:" ? "; Secure" : ""}`;
    SessionStorage.ensureItem(SessionStorageKey.csrfToken, token);
    return true;
  } catch {
    return false;
  }
};

export const clearClientCSRFToken = (): void => {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  try {
    // Keep an empty shared marker so another tab cannot restore its legacy token.
    document.cookie = `${getCSRFCookieName()}=; Path=/; SameSite=Strict; Max-Age=604800${window.location.protocol === "https:" ? "; Secure" : ""}`;
  } catch {
    // Storage restrictions must not interrupt logout or its local cleanup.
  } finally {
    SessionStorage.removeItem(SessionStorageKey.csrfToken);
  }
};

export const getClientCSRFToken = (): string | null => {
  if (typeof window === "undefined") return null;

  if (typeof document !== "undefined") {
    try {
      const prefix = `${getCSRFCookieName()}=`;
      const cookie = document.cookie
        .split(";")
        .map(value => value.trim())
        .find(value => value.startsWith(prefix));
      if (cookie !== undefined) {
        const token = decodeURIComponent(cookie.slice(prefix.length));
        return token.trim() === "" ? null : token;
      }
    } catch {
      return null;
    }
  }

  const legacyToken = SessionStorage.getItemByKey(SessionStorageKey.csrfToken);
  if (typeof legacyToken !== "string" || legacyToken.trim() === "") return null;
  setClientCSRFToken(legacyToken);
  return legacyToken;
};

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
