import { useContext } from "react";
import { AppCommandContext } from "@/providers/AppCommandProvider";

export const useAppCommand = () => {
  const context = useContext(AppCommandContext);
  if (!context) {
    throw new Error("useAppCommand must be used within an AppCommandProvider");
  }
  return context;
};
