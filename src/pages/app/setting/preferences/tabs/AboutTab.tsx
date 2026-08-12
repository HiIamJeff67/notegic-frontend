import { ClipboardIcon, RotateCcwIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useLocalPreferences } from "@/hooks/localPreferences";
import { Section, SettingRow } from "./PreferenceRows";

interface AboutTabProps {
  layout?: "panel" | "article";
}

const AboutTab = ({ layout = "panel" }: AboutTabProps) => {
  const { clipboardState, copyPreferences, resetPreferences } =
    useLocalPreferences();
  const { t } = useTranslation();

  return (
    <div>
      <Section article={layout === "article"}>
        <SettingRow
          title={t("settingsPage.preferences.about.version")}
          description={t("settingsPage.preferences.about.versionDescription")}
        >
          <span className="text-sm font-semibold">0.1.0</span>
        </SettingRow>
        <SettingRow
          title={t("settingsPage.preferences.about.exportPreferences")}
          description={t(
            "settingsPage.preferences.about.exportPreferencesDescription"
          )}
        >
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={copyPreferences}
          >
            <ClipboardIcon className="size-4" />
            {clipboardState === "copied"
              ? t("settingsPage.preferences.about.copied")
              : clipboardState === "failed"
                ? t("settingsPage.preferences.about.failed")
                : t("settingsPage.preferences.about.copy")}
          </Button>
        </SettingRow>
        <SettingRow
          title={t("settingsPage.preferences.about.resetPreferences")}
          description={t(
            "settingsPage.preferences.about.resetPreferencesDescription"
          )}
          hideSeparator
        >
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={resetPreferences}
          >
            <RotateCcwIcon className="size-4" />
            {t("settingsPage.preferences.about.reset")}
          </Button>
        </SettingRow>
      </Section>
    </div>
  );
};

export default AboutTab;
