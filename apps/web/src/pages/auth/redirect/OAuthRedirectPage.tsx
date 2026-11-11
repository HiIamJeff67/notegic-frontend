import type { OAuthProviderType } from "@shared/types/oauthProvider.type";
import { useLocation } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { useOAuth } from "@/hooks/useOAuth";
import { usePageTitle } from "@/hooks/usePageTitle";
import { pageTitle } from "@/seo/pageTitle";

function OAuthRedirectPage({
  provider,
}: {
  provider: OAuthProviderType | "apple";
}) {
  usePageTitle(pageTitle("Sign-in"));

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
