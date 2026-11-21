import { WebURLPathDictionary } from "@shared/lib/url/web";
import {
  clearNativeAuthorizationRequest,
  desktopCallback,
  nativeAuthorizationRequestTtlMs,
  nativeAuthorizeReturn,
  nativeCallbackUrl,
  readNativeAuthorizationRequest,
  storeNativeAuthorizationRequest,
} from "./nativeAuthorization";

class MemoryStorage {
  private readonly values = new Map<string, string>();

  get length() {
    return this.values.size;
  }

  clear() {
    this.values.clear();
  }

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  key(index: number) {
    return [...this.values.keys()][index] ?? null;
  }

  removeItem(key: string) {
    this.values.delete(key);
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

describe("native authorization request", () => {
  const requestKey = "notegic_NativeAuthorizationRequest";
  const now = 1_700_000_000_000;

  beforeEach(() => {
    Object.defineProperty(globalThis, "sessionStorage", {
      configurable: true,
      value: new MemoryStorage(),
    });
  });

  it("keeps a current request for the authorize return used by login, register, and OAuth", () => {
    storeNativeAuthorizationRequest("request-id", now);

    expect(readNativeAuthorizationRequest(now)).toBe("request-id");
    expect(nativeAuthorizeReturn(now)).toBe(
      `/${WebURLPathDictionary.nativeAuthorize}`
    );
  });

  it("clears an expired request so later web sign-in keeps its own destination", () => {
    storeNativeAuthorizationRequest("request-id", now);

    expect(
      readNativeAuthorizationRequest(now + nativeAuthorizationRequestTtlMs)
    ).toBeNull();
    expect(
      nativeAuthorizeReturn(now + nativeAuthorizationRequestTtlMs)
    ).toBeNull();
    expect(sessionStorage.getItem(requestKey)).toBeNull();
  });

  it("clears a consumed or cancelled request", () => {
    storeNativeAuthorizationRequest("request-id", now);
    clearNativeAuthorizationRequest();

    expect(readNativeAuthorizationRequest(now)).toBeNull();
    expect(nativeAuthorizeReturn(now)).toBeNull();
  });

  it("discards a legacy request that has no expiry", () => {
    sessionStorage.setItem(requestKey, "request-id");

    expect(readNativeAuthorizationRequest(now)).toBeNull();
    expect(nativeAuthorizeReturn(now)).toBeNull();
    expect(sessionStorage.getItem(requestKey)).toBeNull();
  });
});

describe("desktop callback", () => {
  it("adds code and state without rewriting the scheme", () => {
    expect(nativeCallbackUrl(desktopCallback, "code", "state")).toBe(
      "com.notegic.desktop:/callback?code=code&state=state"
    );
  });

  it("rejects an unregistered callback", () => {
    expect(() =>
      nativeCallbackUrl("https://example.test/callback", "code", "state")
    ).toThrow("Unregistered desktop callback");
  });
});
