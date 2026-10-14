import { useMemo } from "react";
import { useTranslation as useReactTranslation } from "react-i18next";

/** React translation entry point; retained translators use the current language. */
export function useTranslation() {
  const { t: renderT, i18n, ready } = useReactTranslation();
  const language = i18n.resolvedLanguage ?? i18n.language;

  const t = useMemo(
    // Bind the namespace, not the language. Old callbacks remain locale-current.
    () => i18n.getFixedT(null, "translation"),
    [i18n, language, renderT]
  );

  return { t, i18n, ready };
}
