import {
  SessionStorage,
  SessionStorageKey,
} from "@shared/lib/storage/sessionStorage";
import {
  clearClientCSRFToken,
  getClientCSRFToken,
  getClientMutationHeaders,
  getClientRequestHeaders,
  setClientCSRFToken,
} from "@/api/clientHeaders";

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

const storage = new MemoryStorage();
const cookies = new Map<string, string>();

beforeEach(() => {
  storage.clear();
  cookies.clear();
  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    value: storage,
  });
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: globalThis,
  });
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: { userAgent: "test-agent" },
  });
  Object.defineProperty(globalThis, "location", {
    configurable: true,
    value: { protocol: "http:" },
  });
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      get cookie() {
        return [...cookies].map(([key, value]) => `${key}=${value}`).join("; ");
      },
      set cookie(value: string) {
        const pair = value.split(";")[0];
        const separator = pair.indexOf("=");
        cookies.set(pair.slice(0, separator), pair.slice(separator + 1));
      },
    },
  });
});

test("reads only the current-session CSRF token", () => {
  storage.setItem(
    "notegic_user-a_CSRFToken",
    JSON.stringify("stale-user-token")
  );
  SessionStorage.ensureItem(SessionStorageKey.csrfToken, "current-token");

  expect(getClientRequestHeaders()).toEqual({
    userAgent: "test-agent",
    csrfToken: "current-token",
  });
});

test("returns the current-session CSRF token for browser API clients", () => {
  SessionStorage.ensureItem(SessionStorageKey.csrfToken, "current-token");

  expect(getClientCSRFToken()).toBe("current-token");
});

test("does not guess a token from arbitrary scoped storage", () => {
  storage.setItem(
    "notegic_user-a_CSRFToken",
    JSON.stringify("stale-user-token")
  );

  expect(getClientRequestHeaders()).toEqual({ userAgent: "test-agent" });
  expect(getClientMutationHeaders()).toEqual({
    userAgent: "test-agent",
    csrfToken: "",
  });
});

test("mutation headers always include the CSRF field", () => {
  SessionStorage.ensureItem(SessionStorageKey.csrfToken, "current-token");

  expect(getClientMutationHeaders("explicit-agent")).toEqual({
    userAgent: "explicit-agent",
    csrfToken: "current-token",
  });
});

test("includes the Turnstile token only when provided", () => {
  expect(getClientRequestHeaders("explicit-agent")).toEqual({
    userAgent: "explicit-agent",
  });
  expect(getClientRequestHeaders("explicit-agent", "turnstile-token")).toEqual({
    userAgent: "explicit-agent",
    turnstileToken: "turnstile-token",
  });
});

test("a new tab reads the shared token without sessionStorage", () => {
  setClientCSRFToken("shared-token");
  storage.clear();
  expect(getClientCSRFToken()).toBe("shared-token");
});

test("shared renewal wins over another tab's stale sessionStorage", () => {
  setClientCSRFToken("new-token");
  SessionStorage.ensureItem(SessionStorageKey.csrfToken, "old-token");
  expect(getClientRequestHeaders().csrfToken).toBe("new-token");
});

test("logout prevents another tab from restoring its legacy session token", () => {
  setClientCSRFToken("previous-session-token");
  clearClientCSRFToken();
  SessionStorage.ensureItem(SessionStorageKey.csrfToken, "stale-token");
  expect(getClientCSRFToken()).toBeNull();
  expect(getClientRequestHeaders()).not.toHaveProperty("csrfToken");
  setClientCSRFToken("new-login-token");
  expect(getClientCSRFToken()).toBe("new-login-token");
});

test.each([
  undefined,
  null,
  "",
  "   ",
  7,
  false,
])("malformed refresh metadata cannot clear the shared token: %s", token => {
  setClientCSRFToken("retained-token");
  expect(setClientCSRFToken(token)).toBe(false);
  expect(getClientCSRFToken()).toBe("retained-token");
});

test("malformed shared cookie never falls back to an older tab token", () => {
  SessionStorage.ensureItem(SessionStorageKey.csrfToken, "old-token");
  cookies.set("notegic_csrf", "%not-valid");
  expect(getClientCSRFToken()).toBeNull();
});

test("HTTPS uses a Secure host-only cookie and never writes authentication credentials", () => {
  Object.defineProperty(globalThis, "location", {
    configurable: true,
    value: { protocol: "https:" },
  });
  const writes: string[] = [];
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      get cookie() {
        return "";
      },
      set cookie(value: string) {
        writes.push(value);
      },
    },
  });
  setClientCSRFToken("fixture-token");
  clearClientCSRFToken();
  for (const value of writes) {
    expect(value).toContain("__Host-notegic-csrf=");
    expect(value).toContain("; Secure");
    expect(value).toContain("; SameSite=Strict");
    expect(value).toContain("; Path=/");
    expect(value).not.toMatch(/Domain=|accessToken|refreshToken/i);
  }
});

test("SSR never reads or writes a browser session", () => {
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: undefined,
  });
  expect(getClientCSRFToken()).toBeNull();
  expect(setClientCSRFToken("fixture-token")).toBe(false);
  expect(() => clearClientCSRFToken()).not.toThrow();
  expect(cookies.size).toBe(0);
});

test("blocked cookies fail closed and cannot interrupt logout cleanup", () => {
  SessionStorage.ensureItem(SessionStorageKey.csrfToken, "legacy-token");
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      get cookie() {
        throw new DOMException("Storage blocked", "SecurityError");
      },
      set cookie(_value: string) {
        throw new DOMException("Storage blocked", "SecurityError");
      },
    },
  });
  expect(getClientCSRFToken()).toBeNull();
  expect(setClientCSRFToken("fixture-token")).toBe(false);
  expect(() => clearClientCSRFToken()).not.toThrow();
  expect(SessionStorage.getItemByKey(SessionStorageKey.csrfToken)).toBeNull();
});
