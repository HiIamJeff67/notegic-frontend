import type {
  LocalPreferences,
  NotificationPermissionState,
} from "./LocalPreferencesProvider";

const timeToMinute = (value: string) => {
  const [hours = "", minutes = ""] = value.split(":");
  const hour = Number(hours);
  const minute = Number(minutes);

  if (
    !Number.isInteger(hour) ||
    !Number.isInteger(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }

  return hour * 60 + minute;
};

export const isQuietHours = (now: Date, start: string, end: string) => {
  const startMinute = timeToMinute(start);
  const endMinute = timeToMinute(end);
  if (startMinute === null || endMinute === null || startMinute === endMinute) {
    return false;
  }

  const currentMinute = now.getHours() * 60 + now.getMinutes();
  return startMinute < endMinute
    ? currentMinute >= startMinute && currentMinute < endMinute
    : currentMinute >= startMinute || currentMinute < endMinute;
};

export const canSendDesktopNotification = (
  preferences: Pick<
    LocalPreferences,
    "desktopNotifications" | "quietMode" | "quietModeStart" | "quietModeEnd"
  >,
  permission: NotificationPermissionState,
  priority: "low" | "normal" | "high" | "critical",
  now = new Date()
) =>
  preferences.desktopNotifications &&
  permission === "granted" &&
  (!preferences.quietMode ||
    priority === "critical" ||
    !isQuietHours(now, preferences.quietModeStart, preferences.quietModeEnd));
