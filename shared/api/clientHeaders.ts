import { SessionStorageManipulator } from "@shared/lib/sessionStorageManipulator";
import { SessionStorageKey } from "@shared/types/sessionStorage.type";

export const getClientRequestHeaders = (userAgent?: string) => ({
  userAgent:
    userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "unknown"),
  ...(typeof window !== "undefined"
    ? (() => {
        if (typeof sessionStorage === "undefined") return {};

        const directToken = SessionStorageManipulator.getItemByKey(
          SessionStorageKey.csrfToken
        );
        if (directToken) return { csrfToken: directToken };

        for (let index = sessionStorage.length - 1; index >= 0; index -= 1) {
          const key = sessionStorage.key(index);
          if (!key?.endsWith(`_${SessionStorageKey.csrfToken}`)) continue;
          try {
            const token = JSON.parse(sessionStorage.getItem(key) ?? "null");
            if (typeof token === "string" && token.length > 0) {
              return { csrfToken: token };
            }
          } catch {
            // Ignore malformed legacy storage entries.
          }
        }

        return {};
      })()
    : {}),
});

export const getClientMutationHeaders = (userAgent?: string) => {
  const headers = getClientRequestHeaders(userAgent);
  return { ...headers, csrfToken: headers.csrfToken ?? "" };
};
