import { NotegicError } from "@shared/api/exceptions/errors";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import { createQueryClient } from "@shared/api/queryClient";
import { resources, supportedLanguages } from "@shared/i18n";
import { tError } from "@shared/i18n/error";
import { createInstance } from "i18next";
import {
  Login,
  LoginViaGoogle,
  Register,
  RegisterViaGoogle,
} from "@/api/functions/auth.serverFn";
import {
  mutationFnLogin,
  mutationFnLoginViaGoogle,
  mutationFnRegister,
  mutationFnRegisterViaGoogle,
} from "./auth.invoker";

jest.mock("@/api/functions/auth.serverFn", () => ({
  Login: jest.fn(),
  LoginViaGoogle: jest.fn(),
  Register: jest.fn(),
  RegisterViaGoogle: jest.fn(),
}));

const login = { account: "fixture@example.invalid", password: "Fixture123!" };
const registration = {
  name: "fixture123",
  email: "fixture@example.invalid",
  password: "Fixture123!",
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

describe.each(
  supportedLanguages
)("authentication validation in %s", language => {
  test.each([
    [
      "accountRequired",
      () => mutationFnLogin({ body: { ...login, account: "" } }),
    ],
    [
      "accountFormat",
      () => mutationFnLogin({ body: { ...login, account: "broken@" } }),
    ],
    [
      "accountFormat",
      () => mutationFnLogin({ body: { account: "asd", password: "asd" } }),
    ],
    [
      "passwordRequired",
      () => mutationFnLogin({ body: { ...login, password: "" } }),
    ],
    [
      "passwordTooShort",
      () => mutationFnLogin({ body: { ...login, password: "asd" } }),
    ],
    ...[
      "abcdefgh",
      "12345678",
      "ABC12345!",
      "abc12345!",
      "Abcdefgh!",
      "Abcd12345",
    ].map(
      password =>
        [
          "passwordStrength",
          () => mutationFnLogin({ body: { ...login, password } }),
        ] as const
    ),
    [
      "passwordTooLong",
      () => mutationFnLogin({ body: { ...login, password: "x".repeat(1025) } }),
    ],
    [
      "nameLength",
      () => mutationFnRegister({ body: { ...registration, name: "x" } }),
    ],
    [
      "nameFormat",
      () =>
        mutationFnRegister({ body: { ...registration, name: "fixture123!" } }),
    ],
    [
      "emailFormat",
      () => mutationFnRegister({ body: { ...registration, email: "broken@" } }),
    ],
    [
      "passwordTooShort",
      () => mutationFnRegister({ body: { ...registration, password: "Ab1!" } }),
    ],
    [
      "passwordStrength",
      () =>
        mutationFnRegister({ body: { ...registration, password: "abcdefgh" } }),
    ],
    [
      "oauthCodeInvalid",
      () => mutationFnLoginViaGoogle({ body: { authorizationCode: "" } }),
    ],
    [
      "oauthCodeInvalid",
      () => mutationFnRegisterViaGoogle({ body: { authorizationCode: "" } }),
    ],
  ] as const)("presents %s before sending any request", async (reason, invoke) => {
    const i18n = createInstance();
    await i18n.init({ resources, lng: language, fallbackLng: false });
    const error = await invoke().catch(error => error);
    expect(error).toBeInstanceOf(NotegicValidationError);
    expect(error).toBeInstanceOf(NotegicError);
    expect(error.getPresentation).toBe(`auth.validation.${reason}`);
    const message = tError(error, i18n.t);
    expect(message).toBe(i18n.t(`auth.validation.${reason}` as never));
    expect(message).not.toContain("auth.validation.");
    expect(message).not.toBe(i18n.t("error.encounterUnknownError"));
    for (const endpoint of [
      Login,
      Register,
      LoginViaGoogle,
      RegisterViaGoogle,
    ]) {
      expect(endpoint).not.toHaveBeenCalled();
    }
    const client = createQueryClient();
    const retry = client.getDefaultOptions().mutations?.retry as (
      count: number,
      error: unknown
    ) => boolean;
    expect(retry(0, error)).toBe(false);
    client.clear();
  });

  test.each([
    [Login, () => mutationFnLogin({ body: login })],
    [Register, () => mutationFnRegister({ body: registration })],
    [
      LoginViaGoogle,
      () =>
        mutationFnLoginViaGoogle({
          body: { authorizationCode: "fixture-code" },
        }),
    ],
    [
      RegisterViaGoogle,
      () =>
        mutationFnRegisterViaGoogle({
          body: { authorizationCode: "fixture-code" },
        }),
    ],
  ] as const)("does not blame input when the response is malformed (%#)", async (endpoint, invoke) => {
    jest
      .mocked(endpoint)
      .mockResolvedValue({ success: true, data: {} } as never);
    const i18n = createInstance();
    await i18n.init({ resources, lng: language, fallbackLng: false });
    const error = await invoke().catch(error => error);
    expect(error).toBeInstanceOf(NotegicValidationError);
    expect(error.getPresentation).toBe("auth.validation.invalidResponse");
    expect(tError(error, i18n.t)).toBe(
      i18n.t("auth.validation.invalidResponse")
    );
    expect(endpoint).toHaveBeenCalledTimes(1);
  });
});

test("translates a captured validation error using the language at display time", async () => {
  const error = await mutationFnLogin({
    body: { ...login, account: "broken@" },
  }).catch(error => error);
  const i18n = createInstance();
  await i18n.init({ resources, lng: "en", fallbackLng: false });
  const t = i18n.getFixedT(null, "translation");
  await i18n.changeLanguage("zh-TW");
  expect(tError(error, t)).toBe(
    "請輸入有效電子郵件，或同時包含英文字母與數字的帳號名稱。"
  );
});

test("keeps an unlabelled root-schema failure safe", async () => {
  const error = await mutationFnLogin(undefined as never).catch(error => error);
  const i18n = createInstance();
  await i18n.init({ resources, lng: "en", fallbackLng: false });
  expect(tError(error, i18n.t)).toBe(i18n.t("server.error.ZodParsingFailed"));
  expect(Login).not.toHaveBeenCalled();
});
