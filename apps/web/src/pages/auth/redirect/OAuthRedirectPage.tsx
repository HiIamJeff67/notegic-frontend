import { useLocation } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { useOAuth } from "@/hooks/useOAuth";
import type { OAuthProviderName } from "@/providers/OAuthProvider";

function OAuthRedirectPage({
  provider,
}: {
  provider: OAuthProviderName | "apple";
}) {
  const location = useLocation();
  const { completeOAuth } = useOAuth();
  const hasStartedCallback = useRef(false);

  useEffect(() => {
    // The router can publish the destination before this callback page unmounts.
    if (hasStartedCallback.current) return;
    hasStartedCallback.current = true;
    void completeOAuth(provider, location.searchStr);
  }, [completeOAuth, provider, location.searchStr]);

  return null;
}

export default OAuthRedirectPage;
