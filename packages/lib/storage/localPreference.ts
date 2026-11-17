import {
  LocalStorage,
  LocalStorageKey,
} from "@shared/lib/storage/localStorage";

export const isLocalPreferenceEnabled = (
  key: "localVault" | "offlineQueue" | "cacheAttachments"
): boolean => {
  const preferences = LocalStorage.getItemByKey(
    LocalStorageKey.localPreferences
  );
  if (!preferences || typeof preferences !== "object") return true;
  return (preferences as Record<string, unknown>)[key] !== false;
};
