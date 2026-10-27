import { LoginRequestSchema, RegisterRequestSchema } from "./auth.interface";

describe("login credentials", () => {
  test.each([
    "bad",
    "password",
    "12345678",
    " ",
    "NotCorrect123!",
  ])("leaves password verification to the server", password => {
    const request = { body: { account: "fixture@example.invalid", password } };
    expect(LoginRequestSchema.parse(request).body.password).toBe(password);
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
});
