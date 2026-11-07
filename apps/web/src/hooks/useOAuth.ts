import { useContext } from "react";
import { OAuthContext } from "@/providers/OAuthProvider";

export const useOAuth = () => {
  const context = useContext(OAuthContext);
  if (!context) {
    throw new Error("useOAuth must be used within OAuthProvider.");
  }
  return context;
};
