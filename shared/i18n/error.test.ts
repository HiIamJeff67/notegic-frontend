import { NotegicAPIError, NotegicException } from "@shared/api/exceptions";
import { NotegicError } from "@shared/api/exceptions/errors";
import { resources } from "@shared/i18n";
import { createInstance } from "i18next";
import { tError } from "./error";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import { z } from "zod";

describe("tError", () => {
  test.each([
    "en",
    "zh-TW",
    "zh-CN",
    "ja",
    "ko",
  ])("presents validation safely in %s", async language => {
    const i18n = createInstance();
    await i18n.init({ resources, lng: language, fallbackLng: false });
    const parsed = z
      .object({ privateField: z.string() })
      .safeParse({ privateField: 123 });
    if (parsed.success) throw new Error("Expected invalid fixture");
    const error = new NotegicValidationError(
      ValidationClientException.ZodParsingFailed(parsed.error)
    );
    const message = tError(error, i18n.t);
    expect(message).toBe(i18n.t("server.error.ZodParsingFailed"));
    expect(message).not.toBe("server.error.ZodParsingFailed");
    expect(message).not.toBe(i18n.t("error.encounterUnknownError"));
    expect(message).not.toContain("privateField");
  });
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

test.each([
  ["en", "Your current plan's quota has been reached."],
  ["zh-TW", "已達到目前方案的使用額度。"],
  ["zh-CN", "已达到当前方案的使用额度。"],
  ["ja", "現在のプランの利用上限に達しました。"],
  ["ko", "현재 요금제의 사용 한도에 도달했습니다."],
] as const)("translates quota failures in %s", async (language, message) => {
  const i18n = createInstance();
  await i18n.init({ resources, lng: language, fallbackLng: false });
  const error = new NotegicAPIError(
    new NotegicException({
      reason: "QuotaExceeded",
      domain: "UserQuota",
      operation: "EnforceLimit",
      message: "Do not display the backend message directly",
      retryable: false,
    })
  );

  expect(tError(error, i18n.t)).toBe(message);
});

test.each([
  "en",
  "zh-TW",
  "zh-CN",
  "ja",
  "ko",
])("translates quota exceptions thrown directly by providers in %s", async language => {
  const i18n = createInstance();
  await i18n.init({ resources, lng: language, fallbackLng: false });
  const exception = {
    reason: "QuotaExceeded",
    domain: "UserQuota",
    operation: "EnforceLimit",
    message: "Private database diagnostics must not appear in the UI",
    retryable: false,
  };
  const legacyException = new NotegicException(exception, 403);

  for (const error of [exception, legacyException, legacyException.toJSON()]) {
    expect(tError(error, i18n.t)).toBe(i18n.t("server.error.QuotaExceeded"));
  }
});

test.each([
  { reason: "QuotaExceeded", message: "Private diagnostics" },
  {
    reason: "UnmappedServerReason",
    domain: "UserQuota",
    operation: "EnforceLimit",
    message: "Private diagnostics",
    retryable: false,
  },
  null,
])("keeps malformed or unmapped exceptions safe: %j", async error => {
  const i18n = createInstance();
  await i18n.init({ resources, lng: "en", fallbackLng: false });

  expect(tError(error, i18n.t)).toBe(i18n.t("error.encounterUnknownError"));
});

test.each([
  "en",
  "zh-TW",
  "zh-CN",
  "ja",
  "ko",
])("localizes Routine conflicts and rescheduling in %s", async language => {
  const i18n = createInstance();
  await i18n.init({ resources, lng: language, fallbackLng: false });
  for (const reason of ["DefinitionConflict", "RescheduleRequired"]) {
    const error = new NotegicAPIError(
      new NotegicException({
        reason,
        domain: "Routine",
        operation: "UpdateDefinition",
        message: "Do not expose this fallback",
        retryable: false,
      })
    );
    expect(tError(error, i18n.t)).not.toBe(
      i18n.t("error.encounterUnknownError")
    );
    expect(tError(error, i18n.t)).not.toContain("server.error.");
    expect(tError(error, i18n.t)).not.toContain("fallback");
  }
});
