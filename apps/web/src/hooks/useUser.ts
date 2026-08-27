import { useContext } from "react";
import { UserContext } from "@/providers/UserProvider";

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUserContext must be used within UserProvider");
  return ctx;
};
