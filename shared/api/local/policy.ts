import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import { LocalStorageKey } from "@shared/types/localStorage.type";

export const isLocalPreferenceEnabled = (
  key: "localVault" | "offlineQueue"
): boolean => {
  const preferences = LocalStorageManipulator.getItemByKey(
    LocalStorageKey.localPreferences
  );
  if (!preferences || typeof preferences !== "object") return true;
  return (preferences as Record<string, unknown>)[key] !== false;
};
