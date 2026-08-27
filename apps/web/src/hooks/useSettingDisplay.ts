import { useContext } from "react";
import { SettingsDisplayContext } from "@/providers/SettingsDisplayProvider";

export const useSettingsDisplay = () => {
  const context = useContext(SettingsDisplayContext);
  if (!context) {
    throw new Error(
      "useSettingsDisplay must be used within SettingsDisplayProvider"
    );
  }

  return context;
};
