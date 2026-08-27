import { createInstance } from "i18next";
import { resources, supportedLanguages } from "@shared/i18n";

const getLeafKeys = (value: object, prefix = ""): string[] =>
  Object.entries(value).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof child === "object" && child !== null
      ? getLeafKeys(child, path)
      : [path];
  });

describe("i18n resources", () => {
  test.each(
    supportedLanguages
  )("provides the complete translation tree for %s", language => {
    expect(getLeafKeys(resources[language].translation).sort()).toEqual(
      getLeafKeys(resources.en.translation).sort()
    );
  });

  test.each(
    supportedLanguages
  )("resolves shared keys for %s", async language => {
    const i18n = createInstance();
    await i18n.init({ resources, lng: language, fallbackLng: "en" });

    expect(i18n.t("auth.login")).not.toBe("auth.login");
    expect(i18n.t("error.encounterUnknownError")).not.toBe(
      "error.encounterUnknownError"
    );
    expect(i18n.t("settingsPage.preferences.appearance.title")).not.toBe(
      "settingsPage.preferences.appearance.title"
    );
    expect(i18n.t("workspace.trash.title")).not.toBe("workspace.trash.title");
  });

  test.each([
    ["en", "Appearance", "Account settings"],
    ["zh-TW", "外觀", "帳戶設定"],
    ["zh-CN", "外观", "账户设置"],
    ["ja", "外観", "アカウント設定"],
    ["ko", "모양", "계정 설정"],
  ] as const)("uses localized account and preference settings in %s", async (language, appearance, account) => {
    const i18n = createInstance();
    await i18n.init({ resources, lng: language, fallbackLng: "en" });

    expect(i18n.t("settingsPage.preferences.appearance.title")).toBe(
      appearance
    );
    expect(i18n.t("settingsPage.account.eyebrow")).toBe(account);
  });
});
