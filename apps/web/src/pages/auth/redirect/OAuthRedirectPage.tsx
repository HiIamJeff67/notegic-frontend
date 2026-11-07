import { useLocation } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import LoadingCover from "@/components/covers/LoadingCover/LoadingCover";
import { useOAuth } from "@/hooks/useOAuth";
import { useTranslation } from "@/hooks/useTranslation";
import type { OAuthProviderName } from "@/providers/OAuthProvider";

function OAuthRedirectPage({
  provider,
}: {
  provider: OAuthProviderName | "x" | "apple";
}) {
  const location = useLocation();
  const { completeOAuth, loadingPhase } = useOAuth();
  const { t } = useTranslation();
  const hasRendered = useRef(false);

  useEffect(() => {
    if (hasRendered.current) return;
    hasRendered.current = true;
    void completeOAuth(provider, location.searchStr);
  }, [completeOAuth, provider, location.searchStr]);

  return (
    <LoadingCover
      label={t(
        loadingPhase === "redirecting"
          ? "workspace.pages.redirectingToDashboard"
          : provider === "github"
            ? "workspace.pages.validatingGithub"
            : provider === "google"
              ? "workspace.pages.validatingGoogle"
              : provider === "meta"
                ? "workspace.pages.validatingMeta"
                : provider === "apple"
                  ? "workspace.pages.appleRedirectUnavailable"
                  : "workspace.pages.xRedirectUnavailable"
      )}
    />
  );
}

export default OAuthRedirectPage;
