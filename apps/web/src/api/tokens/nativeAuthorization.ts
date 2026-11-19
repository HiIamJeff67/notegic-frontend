import { WebURLPathDictionary } from "@shared/lib/url/web";

const requestKey = "notegic_NativeAuthorizationRequest";

export const desktopCallback = "com.notegic.desktop:/callback";

export const readNativeAuthorizationRequest = (): string | null => {
  if (typeof sessionStorage === "undefined") return null;
  const requestId = sessionStorage.getItem(requestKey)?.trim();
  return requestId ? requestId : null;
};

export const storeNativeAuthorizationRequest = (requestId: string) => {
  sessionStorage.setItem(requestKey, requestId);
};

export const nativeAuthorizeReturn = (): string | null =>
  readNativeAuthorizationRequest()
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
