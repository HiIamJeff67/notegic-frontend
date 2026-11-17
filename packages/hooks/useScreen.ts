import { ScreenContext } from "@shared/hooks/providers/ScreenProvider";
import { useContext } from "react";

export function useScreen() {
  const context = useContext(ScreenContext);
  if (!context) {
    throw new Error("useScreen must be used within ScreenProvider");
  }
  return context;
}
