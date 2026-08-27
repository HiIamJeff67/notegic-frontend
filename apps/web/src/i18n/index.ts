import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import { LocalStorageKey } from "@shared/types/localStorage.type";
import {
  isSupportedLanguage,
  resources,
  supportedLanguages,
} from "@shared/i18n";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  supportedLngs: supportedLanguages,
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

export const syncStoredLanguage = () => {
  const storedLanguage = LocalStorageManipulator.getItemByKey(
    LocalStorageKey.language
  );
  const code =
    typeof storedLanguage === "string"
      ? storedLanguage
      : (storedLanguage as { code?: unknown } | null)?.code;

  if (isSupportedLanguage(code)) {
    void i18n.changeLanguage(code);
  }
};

if (typeof window !== "undefined") {
  i18n.on("languageChanged", language => {
    if (!isSupportedLanguage(language)) return;

    document.documentElement.lang = language;
    LocalStorageManipulator.setItem(LocalStorageKey.language, language);
  });
}

export { resources } from "@shared/i18n";
export default i18n;
