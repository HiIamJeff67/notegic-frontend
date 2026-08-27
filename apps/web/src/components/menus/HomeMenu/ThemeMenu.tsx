import { useTranslation } from "react-i18next";
import { useTheme } from "@/hooks";
import { HomeMenuSection } from "./HomeMenuSection";
import { SelectionDot } from "./SelectionDot";

export const ThemeMenu = () => {
  const { t } = useTranslation();
  const themeManager = useTheme();

  return (
    <HomeMenuSection label={t("themes.theme")}>
      <div className="max-h-[13rem] overflow-y-auto">
        {themeManager.availableThemes.map((theme, index) => (
          <div className="relative" key={theme.id}>
            <button
              className="relative z-10 flex min-w-0 w-full cursor-pointer items-start gap-3 py-1.5 text-left text-sm font-medium text-foreground transition-colors hover:text-foreground disabled:cursor-wait disabled:opacity-50"
              disabled={themeManager.isThemeLoading(theme.id)}
              onClick={() => void themeManager.switchCurrentTheme(theme.id)}
              type="button"
            >
              <SelectionDot
                selected={themeManager.currentTheme.id === theme.id}
              />
              <span className="min-w-0 break-words">
                {t(theme.translationKey)}
              </span>
            </button>
            {index < themeManager.availableThemes.length - 1 && (
              <span
                aria-hidden="true"
                className="absolute left-[5px] top-3 -bottom-3 w-px bg-foreground/35"
              />
            )}
          </div>
        ))}
      </div>
    </HomeMenuSection>
  );
};
