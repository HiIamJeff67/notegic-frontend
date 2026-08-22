import {
  getClientMutationHeaders,
  getClientRequestHeaders,
} from "@shared/api/clientHeaders";
import { SessionStorageManipulator } from "@shared/lib/sessionStorageManipulator";
import { SessionStorageKey } from "@shared/types/sessionStorage.type";

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

beforeEach(() => {
  storage.clear();
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
});

test("reads only the current-session CSRF token", () => {
  storage.setItem(
    "notegic_user-a_CSRFToken",
    JSON.stringify("stale-user-token"),
  );
  SessionStorageManipulator.ensureItem(
    SessionStorageKey.csrfToken,
    "current-token",
  );

  expect(getClientRequestHeaders()).toEqual({
    userAgent: "test-agent",
    csrfToken: "current-token",
  });
});

test("does not guess a token from arbitrary scoped storage", () => {
  storage.setItem(
    "notegic_user-a_CSRFToken",
    JSON.stringify("stale-user-token"),
  );

  expect(getClientRequestHeaders()).toEqual({ userAgent: "test-agent" });
  expect(getClientMutationHeaders()).toEqual({
    userAgent: "test-agent",
    csrfToken: "",
  });
});

test("mutation headers always include the CSRF field", () => {
  SessionStorageManipulator.ensureItem(
    SessionStorageKey.csrfToken,
    "current-token",
  );

  expect(getClientMutationHeaders("explicit-agent")).toEqual({
    userAgent: "explicit-agent",
    csrfToken: "current-token",
  });
});
