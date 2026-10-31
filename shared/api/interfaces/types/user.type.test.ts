import { DisplayNameSchema, UserDataSchema, UserSchema } from "./user.type";

test("display-name input validation remains stricter than response validation", () => {
  expect(UserSchema.shape.displayName.parse("LettersOnly")).toBe("LettersOnly");
  expect(UserDataSchema.shape.displayName.parse("LettersOnly")).toBe(
    "LettersOnly"
  );
  expect(DisplayNameSchema.safeParse("LettersOnly").success).toBe(false);
  expect(DisplayNameSchema.parse("使用者123")).toBe("使用者123");
});

test.each([
  ["asd", "validation.displayNameLength"],
  ["Name 123", "validation.displayNameFormat"],
])("invalid input %s preserves its translation key", (value, key) => {
  const parsed = DisplayNameSchema.safeParse(value);
  if (parsed.success) throw new Error("Expected invalid display name");
  expect(parsed.error.issues[0].message).toBe(key);
});
