import { ThemeContext } from "@shared/providers/ThemeProvider";
import { useContext } from "react";

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
