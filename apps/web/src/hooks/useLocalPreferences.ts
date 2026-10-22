import { useContext } from "react";
import { LocalPreferencesContext } from "@/providers/LocalPreferencesProvider";

export const useLocalPreferences = () => {
  const context = useContext(LocalPreferencesContext);
  if (!context) {
    throw new Error(
      "useLocalPreferences must be used within LocalPreferencesProvider."
    );
  }
  return context;
};
