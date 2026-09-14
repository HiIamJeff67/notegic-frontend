import {
  consumePendingOAuthState,
  createOAuthState,
  createPendingOAuthState,
  getPendingOAuthState,
  savePendingOAuthState,
} from "@shared/lib/oauthState";
import { SessionStorageManipulator } from "@shared/lib/sessionStorageManipulator";
import type { PendingOAuthState } from "@shared/types/redirectState.type";
import { SessionStorageKey } from "@shared/types/sessionStorage.type";

class MemoryStorage {
  private readonly values = new Map<string, string>();

  clear() {
    this.values.clear();
  }

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  removeItem(key: string) {
    this.values.delete(key);
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

const storage = new MemoryStorage();
const oauthStateTtlMs = 5 * 60 * 1000;

beforeEach(() => {
  storage.clear();
  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    value: storage,
  });
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      crypto: globalThis.crypto,
      sessionStorage: storage,
    },
  });
});

test("creates unpredictable state and saves its pending action", () => {
  const firstState = createPendingOAuthState("login");
  const secondState = createPendingOAuthState("register");

  expect(firstState).toMatch(/^[0-9a-f]{64}$/);
  expect(secondState).toMatch(/^[0-9a-f]{64}$/);
  expect(secondState).not.toBe(firstState);
  expect(
    SessionStorageManipulator.getItemByKey(SessionStorageKey.pendingOAuthState)
  ).toEqual({
    state: secondState,
    action: "register",
    createdAt: expect.any(Number),
  });
});

test("consumes a matching state once", () => {
  const state = createPendingOAuthState("binding");

  expect(
    consumePendingOAuthState(state, Date.now(), oauthStateTtlMs)
  ).toMatchObject({
    state,
    action: "binding",
  });
  expect(getPendingOAuthState()).toBeNull();
  expect(
    consumePendingOAuthState(state, Date.now(), oauthStateTtlMs)
  ).toBeNull();
});

test.each([
  ["missing state", null],
  ["mismatched state", "0".repeat(64)],
])("rejects and clears %s", (_, callbackState) => {
  const state = createPendingOAuthState("login");

  expect(
    consumePendingOAuthState(callbackState, Date.now(), oauthStateTtlMs)
  ).toBeNull();
  expect(getPendingOAuthState()).toBeNull();
  expect(state).not.toBeNull();
});

test("rejects an expired state and clears it", () => {
  const state = createOAuthState();
  const pending: PendingOAuthState = {
    state,
    action: "register",
    createdAt: 1_000,
  };
  savePendingOAuthState(pending);

  expect(
    consumePendingOAuthState(
      state,
      1_000 + oauthStateTtlMs + 1,
      oauthStateTtlMs
    )
  ).toBe(null);
  expect(getPendingOAuthState()).toBeNull();
});

test("rejects malformed stored action and state records", () => {
  storage.setItem(
    "notegic_PendingOAuthState",
    JSON.stringify({
      state: createOAuthState(),
      action: "delete",
      createdAt: Date.now(),
    })
  );

  expect(getPendingOAuthState()).toBeNull();
});
