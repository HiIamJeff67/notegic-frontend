import { SessionStorageManipulator } from "@shared/lib/sessionStorageManipulator";
import { SessionStorageKey } from "@shared/types/sessionStorage.type";

export const getClientCSRFToken = (): string | null => {
  if (typeof window === "undefined") return null;

  return SessionStorageManipulator.getItemByKey(SessionStorageKey.csrfToken);
};

export const getClientRequestHeaders = (userAgent?: string) => {
  const csrfToken = getClientCSRFToken();

  return {
    userAgent:
      userAgent ??
      (typeof navigator !== "undefined" ? navigator.userAgent : "unknown"),
    ...(csrfToken ? { csrfToken } : {}),
  };
};

export const getClientMutationHeaders = (userAgent?: string) => {
  const headers = getClientRequestHeaders(userAgent);
  return { ...headers, csrfToken: headers.csrfToken ?? "" };
};
