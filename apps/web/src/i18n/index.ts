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
  if (isSupportedLanguage(i18n.language)) {
    document.documentElement.lang = i18n.language;
  }
};

if (typeof window !== "undefined") {
  i18n.on("languageChanged", language => {
    if (!isSupportedLanguage(language)) return;

    document.documentElement.lang = language;
  });
}

export { resources } from "@shared/i18n";
export default i18n;
