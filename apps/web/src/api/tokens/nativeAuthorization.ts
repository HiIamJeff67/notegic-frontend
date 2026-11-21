import { WebURLPathDictionary } from "@shared/lib/url/web";

const requestKey = "notegic_NativeAuthorizationRequest";

// Matches the backend native authorization request lifetime.
export const nativeAuthorizationRequestTtlMs = 15 * 60 * 1000;

type StoredNativeAuthorizationRequest = {
  requestId: string;
  expiresAt: number;
};

const isStoredNativeAuthorizationRequest = (
  value: unknown
): value is StoredNativeAuthorizationRequest => {
  if (typeof value !== "object" || value === null) return false;
  const stored = value as Partial<StoredNativeAuthorizationRequest>;
  return (
    typeof stored.requestId === "string" &&
    stored.requestId.trim().length > 0 &&
    typeof stored.expiresAt === "number" &&
    Number.isFinite(stored.expiresAt)
  );
};

const readStoredNativeAuthorizationRequest =
  (): StoredNativeAuthorizationRequest | null => {
    if (typeof sessionStorage === "undefined") return null;
    const raw = sessionStorage.getItem(requestKey);
    if (!raw) return null;
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!isStoredNativeAuthorizationRequest(parsed)) {
        sessionStorage.removeItem(requestKey);
        return null;
      }
      return {
        requestId: parsed.requestId.trim(),
        expiresAt: parsed.expiresAt,
      };
    } catch {
      // A bare request id has no expiry, so it cannot be trusted later.
      sessionStorage.removeItem(requestKey);
      return null;
    }
  };

export const desktopCallback = "com.notegic.desktop:/callback";

export const readNativeAuthorizationRequest = (
  now = Date.now()
): string | null => {
  const stored = readStoredNativeAuthorizationRequest();
  if (!stored || stored.expiresAt <= now) {
    if (stored) clearNativeAuthorizationRequest();
    return null;
  }
  return stored.requestId;
};

export const storeNativeAuthorizationRequest = (
  requestId: string,
  now = Date.now()
) => {
  const trimmed = requestId.trim();
  if (!trimmed || typeof sessionStorage === "undefined") return;
  const stored: StoredNativeAuthorizationRequest = {
    requestId: trimmed,
    expiresAt: now + nativeAuthorizationRequestTtlMs,
  };
  sessionStorage.setItem(requestKey, JSON.stringify(stored));
};

export const clearNativeAuthorizationRequest = () => {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(requestKey);
};

export const nativeAuthorizeReturn = (now = Date.now()): string | null =>
  readNativeAuthorizationRequest(now)
    ? `/${WebURLPathDictionary.nativeAuthorize}`
    : null;

export const nativeCallbackUrl = (
  redirectUri: string,
  code: string,
  state: string
): string => {
  if (redirectUri !== desktopCallback) {
    throw new Error("Unregistered desktop callback");
  }
  const params = new URLSearchParams({ code, state });
  return `${desktopCallback}?${params.toString()}`;
};
