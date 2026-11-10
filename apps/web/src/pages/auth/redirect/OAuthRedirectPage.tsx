import type { OAuthProviderType } from "@shared/types/oauthProvider.type";
import { useLocation } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { useOAuth } from "@/hooks/useOAuth";

function OAuthRedirectPage({
  provider,
}: {
  provider: OAuthProviderType | "apple";
}) {
  const location = useLocation();
  const { complete } = useOAuth();
  const hasStartedCallback = useRef(false);

  useEffect(() => {
    // The router can publish the destination before this callback page unmounts.
    if (hasStartedCallback.current) return;
    hasStartedCallback.current = true;
    void complete(provider, location.searchStr);
  }, [complete, provider, location.searchStr]);

  return null;
}

export default OAuthRedirectPage;
