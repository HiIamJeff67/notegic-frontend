import {
  Language,
  UserSettingDensity,
  UserSettingStartSurface,
} from "@shared/api/interfaces/enums";
import type { UserSetting } from "@shared/api/interfaces/userSetting.interface";
import { AllLanguageData, LanguageKeyMap } from "@shared/constants";
import { useEffect, useRef } from "react";
import {
  getClientMutationHeaders,
  getClientRequestHeaders,
} from "@/api/clientHeaders";
import { useUpdateMySetting } from "@/api/hooks/userSetting.hook";
import { queryFnGetMySetting } from "@/api/invokers/userSetting.invoker";
import { UserSettingLocalSynchronizer } from "@/api/local/synchronizers/userSetting.synchronizer";
import { useLocalPreferences } from "@/hooks/localPreferences";
import { useNetwork } from "@/hooks/useNetwork";
import { useUser } from "@/hooks/useUser";
import i18n from "@/i18n";
import type {
  Density,
  PreferenceChangeListener,
  StartSurface,
  UpdatePreference,
} from "./LocalPreferencesProvider";

const applyRemoteSettings = (
  setting: UserSetting,
  updatePreference: UpdatePreference
) => {
  const density = {
    [UserSettingDensity.Comfortable]: "comfortable",
    [UserSettingDensity.Balanced]: "balanced",
    [UserSettingDensity.Compact]: "compact",
  }[setting.density] as Density;
  const startSurface = {
    [UserSettingStartSurface.Dashboard]: "dashboard",
    [UserSettingStartSurface.Routines]: "routines",
  }[setting.startSurface] as StartSurface;
  const startHour = Math.floor(setting.quietModeStartMinute / 60);
  const startMinute = setting.quietModeStartMinute % 60;
  const endHour = Math.floor(setting.quietModeEndMinute / 60);
  const endMinute = setting.quietModeEndMinute % 60;

  updatePreference("density", density);
  updatePreference("startSurface", startSurface);
  updatePreference("reduceMotion", setting.reduceMotion);
  updatePreference("lineWrap", setting.lineWrap);
  updatePreference("quickInsert", setting.quickInsert);
  updatePreference("privatePreviews", setting.privatePreviews);
  updatePreference("routineNudges", setting.routineNudges);
  updatePreference("syncNotifications", setting.syncNotifications);
  updatePreference("quietMode", setting.quietMode);
  updatePreference(
    "quietModeStart",
    `${String(startHour).padStart(2, "0")}:${String(startMinute).padStart(2, "0")}`
  );
  updatePreference(
    "quietModeEnd",
    `${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}`
  );
};

export const UserSettingsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { userData } = useUser();
  const { isOnline } = useNetwork();
  const { updatePreference, subscribePreferenceChanges } =
    useLocalPreferences();
  const updateSetting = useUpdateMySetting();
  const ignoredLanguageCode = useRef<Language | null>(null);
  const applyingRemoteSettings = useRef(false);

  useEffect(() => {
    const listener: PreferenceChangeListener = (key, value) => {
      if (applyingRemoteSettings.current || !userData) return;
      let values: Partial<UserSetting> | null = null;
      switch (key) {
        case "density":
          values = {
            density: {
              comfortable: UserSettingDensity.Comfortable,
              balanced: UserSettingDensity.Balanced,
              compact: UserSettingDensity.Compact,
            }[value as Density],
          };
          break;
        case "startSurface":
          values = {
            startSurface: {
              dashboard: UserSettingStartSurface.Dashboard,
              routines: UserSettingStartSurface.Routines,
            }[value as StartSurface],
          };
          break;
        case "reduceMotion":
          values = { reduceMotion: value as boolean };
          break;
        case "lineWrap":
          values = { lineWrap: value as boolean };
          break;
        case "quickInsert":
          values = { quickInsert: value as boolean };
          break;
        case "privatePreviews":
          values = { privatePreviews: value as boolean };
          break;
        case "routineNudges":
          values = { routineNudges: value as boolean };
          break;
        case "syncNotifications":
          values = { syncNotifications: value as boolean };
          break;
        case "quietMode":
          values = { quietMode: value as boolean };
          break;
        case "quietModeStart": {
          const [hour = "0", minute = "0"] = (value as string).split(":");
          values = {
            quietModeStartMinute: Number(hour) * 60 + Number(minute),
          };
          break;
        }
        case "quietModeEnd": {
          const [hour = "0", minute = "0"] = (value as string).split(":");
          values = {
            quietModeEndMinute: Number(hour) * 60 + Number(minute),
          };
          break;
        }
      }
      if (!values) return;
      void UserSettingLocalSynchronizer.syncUpdateMySetting(
        userData.publicId,
        values
      ).catch(error => {
        console.error("Failed to cache user settings.", error);
      });
      if (!isOnline) return;
      updateSetting.mutate({
        header: getClientMutationHeaders(),
        body: { values },
      });
    };

    return subscribePreferenceChanges(listener);
  }, [isOnline, subscribePreferenceChanges, updateSetting, userData]);

  useEffect(() => {
    if (!userData) return;

    let cancelled = false;
    void UserSettingLocalSynchronizer.getMySetting(userData.publicId)
      .then(setting => {
        if (cancelled || !setting) return;
        const language = LanguageKeyMap[setting.language]?.code ?? "en";
        applyingRemoteSettings.current = true;
        ignoredLanguageCode.current = setting.language;
        void i18n.changeLanguage(language);
        applyRemoteSettings(setting, updatePreference);
        applyingRemoteSettings.current = false;
      })
      .catch(error => {
        console.error("Failed to load cached user settings.", error);
      });

    if (!isOnline) {
      return () => {
        cancelled = true;
      };
    }

    void queryFnGetMySetting({
      header: getClientRequestHeaders(),
    })
      .then(response => {
        if (cancelled) return;
        void UserSettingLocalSynchronizer.syncGetMySetting(response).catch(
          error => {
            console.error("Failed to cache user settings.", error);
          }
        );
        const language = LanguageKeyMap[response.data.language]?.code ?? "en";
        applyingRemoteSettings.current = true;
        ignoredLanguageCode.current = response.data.language;
        void i18n.changeLanguage(language);
        applyRemoteSettings(response.data, updatePreference);
        applyingRemoteSettings.current = false;
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [isOnline, updatePreference, userData]);

  useEffect(() => {
    const onLanguageChanged = (language: string) => {
      const languageValue = AllLanguageData.find(
        item => item.code === language
      )?.key;
      if (!languageValue || !userData) return;
      if (ignoredLanguageCode.current === languageValue) {
        ignoredLanguageCode.current = null;
        return;
      }
      void UserSettingLocalSynchronizer.syncUpdateMySetting(userData.publicId, {
        language: languageValue,
      }).catch(error => {
        console.error("Failed to cache user language.", error);
      });
      if (!isOnline) return;
      updateSetting.mutate({
        header: getClientMutationHeaders(),
        body: { values: { language: languageValue } },
      });
    };

    i18n.on("languageChanged", onLanguageChanged);
    return () => i18n.off("languageChanged", onLanguageChanged);
  }, [isOnline, updateSetting, userData]);

  return children;
};
