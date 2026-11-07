import { isOAuthAction, isPendingOAuthState } from "./oauthState.type";

test.each([
  "register",
  "login",
  "binding",
])("accepts the OAuth action %s", action => {
  expect(isOAuthAction(action)).toBe(true);
});

test.each([
  undefined,
  null,
  "delete",
  0,
  {},
  [],
])("rejects unknown OAuth action %p", action => {
  expect(isOAuthAction(action)).toBe(false);
});

test("validates the complete pending state shape without browser storage", () => {
  const pending = { state: "a".repeat(64), action: "login", createdAt: 1_000 };
  expect(isPendingOAuthState(pending)).toBe(true);
  for (const invalid of [
    null,
    [],
    {},
    { ...pending, state: "a".repeat(63) },
    { ...pending, state: "A".repeat(64) },
    { ...pending, action: "delete" },
    { ...pending, createdAt: NaN },
    { ...pending, createdAt: Infinity },
    { ...pending, createdAt: "1000" },
  ]) {
    expect(isPendingOAuthState(invalid)).toBe(false);
  }
});

test("GitHub requires its own provider marker and valid PKCE verifier", () => {
  const pending = {
    state: "a".repeat(64),
    action: "binding",
    createdAt: 1000,
    provider: "github",
    codeVerifier: "b".repeat(64),
  };
  expect(isPendingOAuthState(pending)).toBe(true);
  for (const invalid of [
    { ...pending, codeVerifier: undefined },
    { ...pending, codeVerifier: "b".repeat(42) },
    { ...pending, codeVerifier: "b".repeat(129) },
    { ...pending, codeVerifier: "!".repeat(64) },
    { ...pending, provider: "meta" },
  ])
    expect(isPendingOAuthState(invalid)).toBe(false);
});
