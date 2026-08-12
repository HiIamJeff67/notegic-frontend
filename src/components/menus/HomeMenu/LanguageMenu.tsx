import { AllLanguageData } from "@shared/constants";
import { useTranslation } from "react-i18next";
import { HomeMenuSection } from "./HomeMenuSection";
import { SelectionDot } from "./SelectionDot";

export const LanguageMenu = () => {
  const { i18n, t } = useTranslation();

  return (
    <HomeMenuSection label={t("languages.language")}>
      <div>
        {AllLanguageData.map((language, index) => (
          <div className="flex flex-col items-start" key={language.code}>
            <button
              className="flex min-w-0 w-full cursor-pointer items-start gap-3 py-1.5 text-left text-sm font-medium text-foreground transition-colors hover:text-foreground"
              onClick={() => void i18n.changeLanguage(language.code)}
              type="button"
            >
              <SelectionDot
                selected={i18n.resolvedLanguage === language.code}
              />
              <span className="min-w-0 break-words">{language.nativeName}</span>
            </button>
            {index < AllLanguageData.length - 1 && (
              <span
                aria-hidden="true"
                className="ml-[5px] h-2 w-px bg-foreground/35"
              />
            )}
          </div>
        ))}
      </div>
    </HomeMenuSection>
  );
};
