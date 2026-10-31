import { isOAuthAction, isPendingOAuthState } from "./redirectState.type";

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
