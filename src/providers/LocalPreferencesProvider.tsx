import { WebURLPathDictionary } from "@shared/constants";
import {
  DashboardWidthFrameCountStep,
  MaxDashboardWidthFrameCount,
  MinDashboardWidthFrameCount,
} from "@shared/constants/widgetLayout.constant";
import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import { LocalStorageKey } from "@shared/types/localStorage.type";
import React, { createContext, useEffect, useState } from "react";

export type PreferencePage =
  | "appearance"
  | "editor"
  | "offline"
  | "privacy"
  | "browserPermissions"
  | "notifications"
  | "about";

export type Density = "comfortable" | "balanced" | "compact";
export type StartSurface = "dashboard" | "routines";
export type EditorWidth = "narrow" | "standard" | "wide";
export type NotificationPermissionState =
  | "default"
  | "granted"
  | "denied"
  | "unknown";

export type StorageEstimate = {
  quota: number;
  usage: number;
};

export type LocalPreferences = {
  density: Density;
  reduceMotion: boolean;
  tactileFeedback: boolean;
  startSurface: StartSurface;
  editorWidth: EditorWidth;
  manualDashboardWidth: boolean;
  dashboardWidthFrameCount: number;
  editorFontSize: number;
  lineWrap: boolean;
  spellcheck: boolean;
  quickInsert: boolean;
  blockDragHandle: boolean;
  localVault: boolean;
  offlineQueue: boolean;
  cacheAttachments: boolean;
  cleanupAfterDays: number;
  privatePreviews: boolean;
  clipboardGuard: boolean;
  clipboardGuardPatterns: string[];
  desktopNotifications: boolean;
  routineNudges: boolean;
  syncNotifications: boolean;
  quietMode: boolean;
  quietModeStart: string;
  quietModeEnd: string;
};

export type UpdatePreference = <Key extends keyof LocalPreferences>(
  key: Key,
  value: LocalPreferences[Key]
) => void;

export type PreferenceChangeListener = <Key extends keyof LocalPreferences>(
  key: Key,
  value: LocalPreferences[Key]
) => void;

export const defaultLocalPreferences: LocalPreferences = {
  density: "balanced",
  reduceMotion: false,
  tactileFeedback: true,
  startSurface: "dashboard",
  editorWidth: "standard",
  manualDashboardWidth: false,
  dashboardWidthFrameCount: MinDashboardWidthFrameCount,
  editorFontSize: 15,
  lineWrap: true,
  spellcheck: true,
  quickInsert: true,
  blockDragHandle: true,
  localVault: true,
  offlineQueue: true,
  cacheAttachments: false,
  cleanupAfterDays: 30,
  privatePreviews: false,
  clipboardGuard: false,
  clipboardGuardPatterns: [],
  desktopNotifications: false,
  routineNudges: true,
  syncNotifications: true,
  quietMode: true,
  quietModeStart: "22:00",
  quietModeEnd: "08:00",
};

export const getPreferredStartPath = (preferences: LocalPreferences) => {
  if (preferences.startSurface === "dashboard") {
    return WebURLPathDictionary.app.dashboard._;
  }
  if (preferences.startSurface === "routines") {
    return WebURLPathDictionary.app.routines._;
  }
  return WebURLPathDictionary.app.dashboard._;
};

const normalizeLocalPreferences = (
  preferences: Partial<LocalPreferences>
): Partial<LocalPreferences> => ({
  ...preferences,
  manualDashboardWidth: preferences.manualDashboardWidth === true,
  startSurface:
    preferences.startSurface === "routines" ||
    preferences.startSurface === "dashboard"
      ? preferences.startSurface
      : defaultLocalPreferences.startSurface,
  dashboardWidthFrameCount:
    typeof preferences.dashboardWidthFrameCount === "number" &&
    preferences.dashboardWidthFrameCount >= MinDashboardWidthFrameCount &&
    preferences.dashboardWidthFrameCount <= MaxDashboardWidthFrameCount &&
    (preferences.dashboardWidthFrameCount - MinDashboardWidthFrameCount) %
      DashboardWidthFrameCountStep ===
      0
      ? preferences.dashboardWidthFrameCount
      : defaultLocalPreferences.dashboardWidthFrameCount,
});

export type LocalPreferencesContextValue = {
  preferences: LocalPreferences;
  updatePreference: UpdatePreference;
  subscribePreferenceChanges: (
    listener: PreferenceChangeListener
  ) => () => void;
  resetPreferences: () => void;
  copyPreferences: () => Promise<void>;
  clipboardState: "idle" | "copied" | "failed";
  storageEstimate: StorageEstimate | null;
  storageUsagePercent: number;
  notificationPermission: NotificationPermissionState;
  requestNotificationPermission: () => Promise<void>;
  isReady: boolean;
};

export const LocalPreferencesContext = createContext<
  LocalPreferencesContextValue | undefined
>(undefined);

export const LocalPreferencesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [preferences, setPreferences] = useState<LocalPreferences>(
    defaultLocalPreferences
  );
  const [isReady, setIsReady] = useState(false);
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermissionState>("unknown");
  const [storageEstimate, setStorageEstimate] =
    useState<StorageEstimate | null>(null);
  const [clipboardState, setClipboardState] = useState<
    "idle" | "copied" | "failed"
  >("idle");
  const preferenceChangeListeners = React.useRef<Set<PreferenceChangeListener>>(
    new Set()
  );

  useEffect(() => {
    const saved = LocalStorageManipulator.getItemByKey(
      LocalStorageKey.localPreferences
    );

    if (saved && typeof saved === "object" && !Array.isArray(saved)) {
      setPreferences({
        ...defaultLocalPreferences,
        ...normalizeLocalPreferences(saved as Partial<LocalPreferences>),
      });
    }

    setNotificationPermission(
      typeof window !== "undefined" && "Notification" in window
        ? Notification.permission
        : "unknown"
    );
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    LocalStorageManipulator.setItem(
      LocalStorageKey.localPreferences,
      preferences
    );
  }, [isReady, preferences]);

  useEffect(() => {
    const root = document.documentElement;

    root.dataset.density = preferences.density;
    root.dataset.reduceMotion = String(preferences.reduceMotion);

    return () => {
      delete root.dataset.density;
      delete root.dataset.reduceMotion;
    };
  }, [preferences.density, preferences.reduceMotion]);

  useEffect(() => {
    if (
      !preferences.tactileFeedback ||
      typeof navigator === "undefined" ||
      typeof navigator.vibrate !== "function"
    ) {
      return;
    }

    const handlePointerUp = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (!target.closest("button, a, [role='button'], input, select")) {
        return;
      }
      navigator.vibrate(8);
    };

    document.addEventListener("pointerup", handlePointerUp, {
      passive: true,
    });
    return () => document.removeEventListener("pointerup", handlePointerUp);
  }, [preferences.tactileFeedback]);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.storage?.estimate) {
      setStorageEstimate(null);
      return;
    }

    navigator.storage.estimate().then(estimate => {
      setStorageEstimate({
        quota: estimate.quota ?? 0,
        usage: estimate.usage ?? 0,
      });
    });
  }, []);

  const updatePreference: UpdatePreference = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value,
    }));
    preferenceChangeListeners.current.forEach(listener => listener(key, value));
  };

  const subscribePreferenceChanges = (listener: PreferenceChangeListener) => {
    preferenceChangeListeners.current.add(listener);
    return () => preferenceChangeListeners.current.delete(listener);
  };

  const resetPreferences = () => {
    setPreferences(defaultLocalPreferences);
    setClipboardState("idle");
  };

  const copyPreferences = async () => {
    try {
      if (typeof navigator === "undefined" || !navigator.clipboard) {
        throw new Error("Clipboard is not available.");
      }
      await navigator.clipboard.writeText(JSON.stringify(preferences, null, 2));
      setClipboardState("copied");
    } catch {
      setClipboardState("failed");
    }

    window.setTimeout(() => setClipboardState("idle"), 1400);
  };

  const requestNotificationPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setNotificationPermission("unknown");
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    if (permission === "granted") {
      updatePreference("desktopNotifications", true);
    }
  };

  const storageUsagePercent =
    storageEstimate && storageEstimate.quota > 0
      ? Math.min(
          100,
          Math.round((storageEstimate.usage / storageEstimate.quota) * 100)
        )
      : 0;

  return (
    <LocalPreferencesContext.Provider
      value={{
        preferences,
        updatePreference,
        subscribePreferenceChanges,
        resetPreferences,
        copyPreferences,
        clipboardState,
        storageEstimate,
        storageUsagePercent,
        notificationPermission,
        requestNotificationPermission,
        isReady,
      }}
    >
      {children}
    </LocalPreferencesContext.Provider>
  );
};
