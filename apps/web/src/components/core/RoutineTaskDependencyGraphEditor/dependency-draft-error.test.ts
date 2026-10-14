import { NotegicAPIError, NotegicException } from "@shared/api/exceptions";
import i18n from "@/i18n";
import { getDependencyDraftErrorKey } from "./dependency-draft-error";

describe("dependency draft error keys", () => {
  afterEach(async () => {
    await i18n.changeLanguage("en");
  });

  test("persists a language-neutral server key and translates it after reload", async () => {
    const error = new NotegicAPIError(
      new NotegicException({
        reason: "InvalidDto",
        domain: "core",
        operation: "create",
        message: "invalid input",
        retryable: false,
      })
    );
    const draft = JSON.parse(
      JSON.stringify({ errorKey: getDependencyDraftErrorKey(error) })
    );
    expect(draft.errorKey).toBe("server.error.InvalidDto");
    await i18n.changeLanguage("zh-TW");
    expect(i18n.t(draft.errorKey)).toBe("提交的資料有部分格式不正確。");
  });

  test("keeps a known UI presentation ahead of a server reason", () => {
    const error = new NotegicAPIError(
      new NotegicException({
        reason: "InvalidDto",
        domain: "core",
        operation: "create",
        message: "invalid input",
        retryable: false,
      })
    ).setPresentation("auth.turnstileRequired");
    expect(getDependencyDraftErrorKey(error)).toBe("auth.turnstileRequired");
  });

  test("uses a translatable fallback for unknown errors", () => {
    expect(getDependencyDraftErrorKey(new Error("raw server text"))).toBe(
      "error.encounterUnknownError"
    );
  });
});
