import { useContext } from "react";
import { LocalPreferencesContext } from "@/providers/LocalPreferencesProvider";

export { getPreferredStartPath } from "@/providers/LocalPreferencesProvider";

export type {
  Density,
  EditorWidth,
  LocalPreferences,
  NotificationPermissionState,
  PreferencePage,
  StartSurface,
  StorageEstimate,
  UpdatePreference,
} from "@/providers/LocalPreferencesProvider";

export const useLocalPreferences = () => {
  const context = useContext(LocalPreferencesContext);
  if (!context) {
    throw new Error(
      "useLocalPreferences must be used within LocalPreferencesProvider."
    );
  }
  return context;
};
