import { useContext } from "react";
import { ThemeContext } from "@/providers/ThemeProvider";

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
