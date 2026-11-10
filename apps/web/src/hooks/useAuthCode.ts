import { useContext } from "react";
import { AuthCodeContext } from "@/providers/AuthCodeProvider";

export const useAuthCode = () => {
  const context = useContext(AuthCodeContext);
  if (!context) {
    throw new Error("useAuthCode must be used within AuthCodeProvider.");
  }
  return context;
};
