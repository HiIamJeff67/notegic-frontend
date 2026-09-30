import { NotegicAPIError, NotegicException } from "@shared/api/exceptions";
import { NotegicError } from "@shared/api/exceptions/errors";
import { resources } from "@shared/i18n";
import { createInstance } from "i18next";
import { tError } from "./error";

describe("tError", () => {
  test.each([
    ["en", "Some submitted information is invalid."],
    ["zh-TW", "提交的資料有部分格式不正確。"],
    ["zh-CN", "提交的数据有部分格式不正确。"],
    ["ja", "送信した情報の一部が正しくありません。"],
    ["ko", "제출한 정보 중 일부 형식이 올바르지 않습니다."],
  ] as const)("translates server reasons in %s", async (language, message) => {
    const i18n = createInstance();
    await i18n.init({ resources, lng: language, fallbackLng: "en" });
    const error = new NotegicAPIError(
      new NotegicException({
        reason: "InvalidDto",
        domain: "core",
        operation: "create",
        message: "invalid input",
        retryable: false,
      })
    );

    expect(tError(error, i18n.t)).toBe(message);
  });

  test("keeps an explicit UI translation key ahead of the server reason", async () => {
    const i18n = createInstance();
    await i18n.init({ resources, lng: "en", fallbackLng: "en" });
    const error = new NotegicAPIError(
      new NotegicException({
        reason: "InvalidDto",
        domain: "core",
        operation: "create",
        message: "invalid input",
        retryable: false,
      })
    ).setPresentation("auth.turnstileRequired");

    expect(tError(error, i18n.t)).toBe(i18n.t("auth.turnstileRequired"));
  });

  test("uses the unknown-error fallback for an unmapped reason", async () => {
    const i18n = createInstance();
    await i18n.init({ resources, lng: "en", fallbackLng: "en" });
    const error = new NotegicAPIError(
      new NotegicException({
        reason: "UnmappedServerReason",
        domain: "core",
        operation: "create",
        message: "unmapped",
        retryable: false,
      })
    );

    expect(tError(error, i18n.t)).toBe(i18n.t("error.encounterUnknownError"));
  });

  test("translates a standalone NotegicError presentation key", async () => {
    const i18n = createInstance();
    await i18n.init({ resources, lng: "en", fallbackLng: "en" });

    expect(
      tError(
        new NotegicError().setPresentation("auth.turnstileRequired"),
        i18n.t
      )
    ).toBe(i18n.t("auth.turnstileRequired"));
  });
});
