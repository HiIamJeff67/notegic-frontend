import {
  getClientMutationHeaders,
  getClientRequestHeaders,
} from "@shared/api/clientHeaders";
import { useUpdateMySetting } from "@shared/api/hooks/userSetting.hook";
import {
  Language,
  UserSettingDensity,
  UserSettingStartSurface,
} from "@shared/api/interfaces/enums";
import type { UserSetting } from "@shared/api/interfaces/userSetting.interface";
import { queryFnGetMySetting } from "@shared/api/invokers/userSetting.invoker";
import { AllLanguageData, LanguageKeyMap } from "@shared/constants";
import { useEffect, useRef } from "react";
import { useLocalPreferences } from "@/hooks/localPreferences";
import { useNetwork } from "@/hooks/useNetwork";
import { useUser } from "@/hooks/useUser";
import i18n from "@/i18n";
import type {
  Density,
  LocalPreferences,
  PreferenceChangeListener,
  StartSurface,
} from "./LocalPreferencesProvider";

const remoteDensityToLocal: Record<UserSettingDensity, Density> = {
  [UserSettingDensity.Comfortable]: "comfortable",
  [UserSettingDensity.Balanced]: "balanced",
  [UserSettingDensity.Compact]: "compact",
};
const localDensityToRemote: Record<Density, UserSettingDensity> = {
  comfortable: UserSettingDensity.Comfortable,
  balanced: UserSettingDensity.Balanced,
  compact: UserSettingDensity.Compact,
};
const remoteStartSurfaceToLocal: Record<UserSettingStartSurface, StartSurface> =
  {
    [UserSettingStartSurface.Dashboard]: "dashboard",
    [UserSettingStartSurface.Routines]: "routines",
  };
const localStartSurfaceToRemote: Record<StartSurface, UserSettingStartSurface> =
  {
    dashboard: UserSettingStartSurface.Dashboard,
    routines: UserSettingStartSurface.Routines,
  };

const timeToMinute = (value: string) => {
  const [hour = "0", minute = "0"] = value.split(":");
  return Number(hour) * 60 + Number(minute);
};

const minuteToTime = (value: number) =>
  `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;

const applyRemoteSettings = (
  setting: UserSetting,
  updatePreference: <Key extends keyof LocalPreferences>(
    key: Key,
    value: LocalPreferences[Key]
  ) => void
) => {
  updatePreference("density", remoteDensityToLocal[setting.density]);
  updatePreference(
    "startSurface",
    remoteStartSurfaceToLocal[setting.startSurface]
  );
  updatePreference("reduceMotion", setting.reduceMotion);
  updatePreference("lineWrap", setting.lineWrap);
  updatePreference("quickInsert", setting.quickInsert);
  updatePreference("privatePreviews", setting.privatePreviews);
  updatePreference("routineNudges", setting.routineNudges);
  updatePreference("syncNotifications", setting.syncNotifications);
  updatePreference("quietMode", setting.quietMode);
  updatePreference(
    "quietModeStart",
    minuteToTime(setting.quietModeStartMinute)
  );
  updatePreference("quietModeEnd", minuteToTime(setting.quietModeEndMinute));
};

const toRemoteUpdate = (
  key: keyof LocalPreferences,
  value: LocalPreferences[keyof LocalPreferences]
): Partial<UserSetting> | null => {
  switch (key) {
    case "density":
      return { density: localDensityToRemote[value as Density] };
    case "startSurface":
      return { startSurface: localStartSurfaceToRemote[value as StartSurface] };
    case "reduceMotion":
      return { reduceMotion: value as boolean };
    case "lineWrap":
      return { lineWrap: value as boolean };
    case "quickInsert":
      return { quickInsert: value as boolean };
    case "privatePreviews":
      return { privatePreviews: value as boolean };
    case "routineNudges":
      return { routineNudges: value as boolean };
    case "syncNotifications":
      return { syncNotifications: value as boolean };
    case "quietMode":
      return { quietMode: value as boolean };
    case "quietModeStart":
      return { quietModeStartMinute: timeToMinute(value as string) };
    case "quietModeEnd":
      return { quietModeEndMinute: timeToMinute(value as string) };
    default:
      return null;
  }
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
  const activeUserPublicId = useRef<string | null>(null);
  const applyingRemoteSettings = useRef(false);

  useEffect(() => {
    const listener: PreferenceChangeListener = (key, value) => {
      if (applyingRemoteSettings.current || !userData || !isOnline) return;
      const values = toRemoteUpdate(key, value);
      if (!values) return;
      updateSetting.mutate({
        header: getClientMutationHeaders(),
        body: { values },
      });
    };

    return subscribePreferenceChanges(listener);
  }, [isOnline, subscribePreferenceChanges, updateSetting, userData]);

  useEffect(() => {
    const onLanguageChanged = (language: string) => {
      const languageValue = AllLanguageData.find(
        item => item.code === language
      )?.key;
      if (!languageValue || !userData || !isOnline) return;
      if (ignoredLanguageCode.current === languageValue) {
        ignoredLanguageCode.current = null;
        return;
      }
      updateSetting.mutate({
        header: getClientMutationHeaders(),
        body: { values: { language: languageValue } },
      });
    };

    i18n.on("languageChanged", onLanguageChanged);
    return () => i18n.off("languageChanged", onLanguageChanged);
  }, [isOnline, updateSetting, userData]);

  useEffect(() => {
    if (
      !userData ||
      !isOnline ||
      activeUserPublicId.current === userData.publicId
    ) {
      return;
    }
    activeUserPublicId.current = userData.publicId;

    void queryFnGetMySetting({
      header: getClientRequestHeaders(),
    })
      .then(response => {
        const language = LanguageKeyMap[response.data.language]?.code ?? "en";
        applyingRemoteSettings.current = true;
        ignoredLanguageCode.current = response.data.language;
        void i18n.changeLanguage(language);
        applyRemoteSettings(response.data, updatePreference);
        applyingRemoteSettings.current = false;
      })
      .catch(() => undefined);
  }, [isOnline, updatePreference, userData]);

  useEffect(() => {
    if (userData === null) activeUserPublicId.current = null;
  }, [userData]);

  return children;
};
