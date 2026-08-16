import { SessionStorageManipulator } from "@shared/lib/sessionStorageManipulator";
import { SessionStorageKey } from "@shared/types/sessionStorage.type";

const getCurrentCSRFToken = (): string | undefined => {
  if (typeof sessionStorage === "undefined") return undefined;

  const directToken = SessionStorageManipulator.getItemByKey(
    SessionStorageKey.csrfToken
  );
  if (directToken) return directToken;

  for (let index = sessionStorage.length - 1; index >= 0; index -= 1) {
    const key = sessionStorage.key(index);
    if (!key?.endsWith(`_${SessionStorageKey.csrfToken}`)) continue;
    try {
      const token = JSON.parse(sessionStorage.getItem(key) ?? "null");
      if (typeof token === "string" && token.length > 0) return token;
    } catch {
      // Ignore malformed legacy storage entries.
    }
  }

  return undefined;
};

export const getClientRequestHeaders = (userAgent?: string) => ({
  userAgent:
    userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown"),
  ...(typeof window !== "undefined"
    ? (() => {
        const csrfToken = getCurrentCSRFToken();
        return csrfToken ? { csrfToken } : {};
      })()
    : {}),
});

export const getClientMutationHeaders = (userAgent?: string) => {
  const headers = getClientRequestHeaders(userAgent);
  return { ...headers, csrfToken: headers.csrfToken ?? "" };
};

/** Remove credentials written by pre-NOT-67 clients. */
export const clearLegacyCredentialStorage = (): void => {
  if (typeof localStorage === "undefined") return;

  for (let index = localStorage.length - 1; index >= 0; index -= 1) {
    const key = localStorage.key(index);
    if (key === "notegic_access_token" || key?.endsWith("_access_token")) {
      localStorage.removeItem(key);
    }
  }
};
