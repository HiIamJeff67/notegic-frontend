import { SessionStorageManipulator } from "@shared/lib/sessionStorageManipulator";
import { SessionStorageKey } from "@shared/types/sessionStorage.type";

export const getClientRequestHeaders = (userAgent?: string) => ({
  userAgent:
    userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown"),
  ...(typeof window !== "undefined"
    ? (() => {
        const csrfToken = SessionStorageManipulator.getItemByKey(
          SessionStorageKey.csrfToken
        );
        return csrfToken ? { csrfToken } : {};
      })()
    : {}),
});

export const getClientMutationHeaders = (userAgent?: string) => {
  const headers = getClientRequestHeaders(userAgent);
  return { ...headers, csrfToken: headers.csrfToken ?? "" };
};
