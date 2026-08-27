import { useContext } from "react";
import { ScreenContext } from "@/providers/ScreenProvider";

export function useScreen() {
  const context = useContext(ScreenContext);
  if (!context) {
    throw new Error("useScreen must be used within ScreenProvider");
  }
  return context;
}
