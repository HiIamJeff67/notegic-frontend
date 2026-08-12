import { useTranslation } from "react-i18next";
import TimePicker from "@/components/commons/TimePicker/TimePicker";
import { useLocalPreferences } from "@/hooks/localPreferences";
import { Section, SettingRow, SwitchRow } from "./PreferenceRows";

const timeStringToDate = (time: string) => {
  const [hours = "0", minutes = "0"] = time.split(":");
  return new Date(2000, 0, 1, Number(hours), Number(minutes), 0, 0);
};

const dateToTimeString = (date: Date) =>
  `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`;

interface NotificationsTabProps {
  layout?: "panel" | "article";
}

const NotificationsTab = ({ layout = "panel" }: NotificationsTabProps) => {
  const { preferences, updatePreference } = useLocalPreferences();
  const { t } = useTranslation();

  return (
    <div>
      <Section article={layout === "article"}>
        <SwitchRow
          title={t("settingsPage.preferences.notifications.desktop")}
          description={t(
            "settingsPage.preferences.notifications.desktopDescription"
          )}
          checked={preferences.desktopNotifications}
          unsupportedReason={t(
            "settingsPage.preferences.appearance.unsupported"
          )}
          onCheckedChange={checked =>
            updatePreference("desktopNotifications", checked)
          }
        />
        <SwitchRow
          title={t("settingsPage.preferences.notifications.routine")}
          description={t(
            "settingsPage.preferences.notifications.routineDescription"
          )}
          checked={preferences.routineNudges}
          unsupportedReason={t(
            "settingsPage.preferences.appearance.unsupported"
          )}
          onCheckedChange={checked =>
            updatePreference("routineNudges", checked)
          }
        />
        <SwitchRow
          title={t("settingsPage.preferences.notifications.sync")}
          description={t(
            "settingsPage.preferences.notifications.syncDescription"
          )}
          checked={preferences.syncNotifications}
          onCheckedChange={checked =>
            updatePreference("syncNotifications", checked)
          }
        />
        <SwitchRow
          title={t("settingsPage.preferences.notifications.quietMode")}
          description={t(
            "settingsPage.preferences.notifications.quietModeDescription"
          )}
          checked={preferences.quietMode}
          onCheckedChange={checked => updatePreference("quietMode", checked)}
        />
        <SettingRow
          title={t("settingsPage.preferences.notifications.quietRange")}
          description={t(
            "settingsPage.preferences.notifications.quietRangeDescription"
          )}
          hideSeparator
        >
          <div className="flex items-center gap-2">
            <TimePicker
              value={timeStringToDate(preferences.quietModeStart)}
              onValueChange={value => {
                if (!value) return;
                updatePreference("quietModeStart", dateToTimeString(value));
              }}
              disabled={!preferences.quietMode}
              placeholder={t(
                "settingsPage.preferences.notifications.startTime"
              )}
              className="w-32"
            />
            <span className="text-xs text-muted-foreground">
              {t("settingsPage.preferences.notifications.to")}
            </span>
            <TimePicker
              value={timeStringToDate(preferences.quietModeEnd)}
              onValueChange={value => {
                if (!value) return;
                updatePreference("quietModeEnd", dateToTimeString(value));
              }}
              disabled={!preferences.quietMode}
              placeholder={t("settingsPage.preferences.notifications.endTime")}
              className="w-32"
            />
          </div>
        </SettingRow>
      </Section>
    </div>
  );
};

export default NotificationsTab;
