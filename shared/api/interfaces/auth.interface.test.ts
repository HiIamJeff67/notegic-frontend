import {
  UserDataSchema,
  UserSchema,
} from "@shared/api/interfaces/types/user.type";
import { LoginRequestSchema, RegisterRequestSchema } from "./auth.interface";

describe("login credentials", () => {
  test.each([
    "asd",
    "123456",
    "name 123",
    "name123!",
  ])("rejects an invalid account name before password verification: %s", account => {
    const parsed = LoginRequestSchema.safeParse({
      body: { account, password: "asd" },
    });
    if (parsed.success) throw new Error("Expected an invalid account");
    expect(parsed.error.issues[0].message).toBe(
      "auth.validation.accountFormat"
    );
  });

  test("accepts a valid account name and password", () => {
    const request = { body: { account: "name123", password: "Valid123!" } };
    expect(LoginRequestSchema.parse(request)).toEqual(request);
  });

  test.each([
    "Abcd123!",
    "NotCorrect123!",
  ])("leaves verification of correctly formatted passwords to the server", password => {
    const request = { body: { account: "fixture@example.invalid", password } };
    expect(LoginRequestSchema.parse(request).body.password).toBe(password);
  });

  test.each([
    ["asd", "passwordTooShort"],
    [" Ab1!   ", "passwordTooShort"],
    ["Abcd123_", "passwordStrength"],
    [" ", "passwordTooShort"],
    ["password", "passwordStrength"],
    ["12345678", "passwordStrength"],
    ["ABC12345!", "passwordStrength"],
    ["abc12345!", "passwordStrength"],
    ["Abcdefgh!", "passwordStrength"],
    ["Abcd12345", "passwordStrength"],
  ])("applies the published password format to login and registration: %s", (password, reason) => {
    const parsed = [
      LoginRequestSchema.safeParse({
        body: { account: "fixture@example.invalid", password },
      }),
      RegisterRequestSchema.safeParse({
        body: {
          name: "fixture123",
          email: "fixture@example.invalid",
          password,
        },
      }),
    ];
    for (const result of parsed) {
      if (result.success) throw new Error("Expected an invalid password");
      expect(result.error.issues[0].message).toBe(`auth.validation.${reason}`);
    }
  });

  test.each([
    "",
    "x".repeat(1025),
  ])("rejects empty or oversized passwords", password => {
    expect(
      LoginRequestSchema.safeParse({ body: { account: "fixture", password } })
        .success
    ).toBe(false);
  });

  test("still rejects empty accounts and weak registration passwords", () => {
    expect(
      LoginRequestSchema.safeParse({ body: { account: "", password: "test" } })
        .success
    ).toBe(false);
    expect(
      RegisterRequestSchema.safeParse({
        body: {
          name: "fixture",
          email: "fixture@example.invalid",
          password: "bad",
        },
      }).success
    ).toBe(false);
  });

  test.each([
    "name12",
    "n".repeat(31) + "1",
    "測試使用者123",
  ])("accepts registration names within the backend name policy: %s", name => {
    expect(
      RegisterRequestSchema.safeParse({
        body: {
          name,
          email: "fixture@example.invalid",
          password: "Fixture123!",
        },
      }).success
    ).toBe(true);
  });

  test.each([
    "letters",
    "123456",
    "name12!",
    "name 12",
  ])("rejects names that do not contain only letters and digits with both present: %s", name => {
    const parsed = RegisterRequestSchema.safeParse({
      body: {
        name,
        email: "fixture@example.invalid",
        password: "Fixture123!",
      },
    });
    if (parsed.success) throw new Error("Expected invalid name");
    expect(parsed.error.issues[0].message).toBe("auth.validation.nameFormat");
  });
});

test("rejects a registration name beyond the backend maximum", () => {
  const parsed = RegisterRequestSchema.safeParse({
    body: {
      name: "n".repeat(32) + "1",
      email: "fixture@example.invalid",
      password: "Fixture123!",
    },
  });
  if (parsed.success) throw new Error("Expected invalid name");
  expect(parsed.error.issues[0].message).toBe("auth.validation.nameLength");
});

test("reads names accepted by the backend without attaching input translations to responses", () => {
  for (const schema of [UserSchema, UserDataSchema]) {
    expect(schema.shape.name.parse("測試使用者123")).toBe("測試使用者123");
    expect(schema.shape.displayName.parse("測試使用者123")).toBe(
      "測試使用者123"
    );
    const parsed = schema.shape.displayName.safeParse({});
    if (parsed.success) throw new Error("Expected invalid response type");
    expect(parsed.error.issues[0].message).not.toMatch(
      /^(auth\.)?validation\./
    );
  }
});
