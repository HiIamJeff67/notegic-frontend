import { useContext } from "react";
import { WidgetContext } from "@/providers/WidgetProvider";

export const useWidget = () => {
  const context = useContext(WidgetContext);
  if (context === undefined) {
    throw new Error("useWidget must be used within a WidgetProvider");
  }
  return context;
};
