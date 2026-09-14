import { getClientRequestHeaders } from "@/api/clientHeaders";
import { useLoginViaGoogle, useRegisterViaGoogle } from "@/api/hooks/auth.hook";
import { OAUTH_STATE_TTL_MS } from "@/api/oauthState";
import {
  clearTurnstileToken,
  getTurnstileToken,
  isTurnstileEnabled,
} from "@/api/turnstile";
import { useBindGoogleAccount } from "@/api/hooks/userAccount.hook";
import { WebURLPathDictionary } from "@shared/constants";
import { consumePendingOAuthState } from "@shared/lib/oauthState";
import toast from "@shared/lib/toast";
import type { OAuthAction } from "@shared/types/redirectState.type";
import { useLocation } from "@tanstack/react-router";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import StrictLoadingCover from "@/components/covers/LoadingCover/StrictLoadingCover";
import { useAppRouter, useUser } from "@/hooks";
import {
  getPreferredStartPath,
  useLocalPreferences,
} from "@/hooks/localPreferences";
import { translateError } from "@shared/i18n/error";

function GoogleRedirectPage() {
  const location = useLocation();

  const router = useAppRouter();
  const { t } = useTranslation();
  const { preferences } = useLocalPreferences();
  const userManager = useUser();

  const registerViaGoogleMutator = useRegisterViaGoogle();
  const loginViaGoogleMutator = useLoginViaGoogle();
  const bindGoogleAccountMutator = useBindGoogleAccount();
  const [loadingPhase, setLoadingPhase] = useState<
    "validating" | "redirecting"
  >("validating");

  const hasRendered = useRef(false);

  const performGoogleOAuthAction = useCallback(
    async (action: OAuthAction, code: string): Promise<void> => {
      const turnstileToken = action === "binding" ? null : getTurnstileToken();
      const header = getClientRequestHeaders(
        navigator.userAgent,
        turnstileToken
      );

      try {
        switch (action) {
          case "register": {
            await registerViaGoogleMutator.mutateAsync({
              header,
              body: { authorizationCode: code },
            });
            return;
          }
          case "login": {
            await loginViaGoogleMutator.mutateAsync({
              header,
              body: { authorizationCode: code },
            });
            return;
          }
          case "binding": {
            await bindGoogleAccountMutator.mutateAsync({
              header,
              body: { authorizationCode: code },
            });
            return;
          }
        }
      } finally {
        if (action !== "binding") clearTurnstileToken();
      }
    },
    [bindGoogleAccountMutator, loginViaGoogleMutator, registerViaGoogleMutator]
  );

  const handleOAuthOnRedirect = useCallback(async () => {
    const searchParams = new URLSearchParams(location.search);
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const state = searchParams.get("state");

    const pending = consumePendingOAuthState(
      state,
      Date.now(),
      OAUTH_STATE_TTL_MS
    );
    if (pending === null) {
      toast.error(
        t("workspace.notifications.googleAuthError", {
          error: t("error.encounterUnknownError"),
        })
      );
      router.push(
        WebURLPathDictionary.auth.redirect.error(
          t("workspace.pages.googleRedirectFailed"),
          t("error.encounterUnknownError")
        )
      );
      return;
    }

    try {
      const { action } = pending;

      if (error !== null) {
        toast.error(
          t("workspace.notifications.googleAuthError", {
            error: error,
          })
        );
        router.push(
          WebURLPathDictionary.auth.redirect.error(
            t("workspace.pages.googleAuthFailed"),
            translateError(error, t)
          )
        );
        return;
      }

      if (code === null) {
        throw new Error(t("error.encounterUnknownError"));
      }

      if (
        action !== "binding" &&
        isTurnstileEnabled() &&
        !getTurnstileToken()
      ) {
        throw new Error(t("auth.turnstileRequired"));
      }

      await performGoogleOAuthAction(action, code);
      await userManager.fetchUserData();

      setLoadingPhase("redirecting");
      router.push(getPreferredStartPath(preferences));
    } catch (error) {
      toast.error(translateError(error, t));
      router.push(
        WebURLPathDictionary.auth.redirect.error(
          t("workspace.pages.googleRedirectFailed"),
          translateError(error, t)
        )
      );
    }
  }, [
    location.search,
    router,
    preferences,
    t,
    userManager,
    performGoogleOAuthAction,
  ]);

  useEffect(() => {
    if (hasRendered.current) return;
    hasRendered.current = true;

    handleOAuthOnRedirect();
  }, [handleOAuthOnRedirect]);

  return (
    <Suspense fallback={<StrictLoadingCover />}>
      <StrictLoadingCover
        label={t(
          loadingPhase === "validating"
            ? "workspace.pages.validatingGoogle"
            : "workspace.pages.redirectingToDashboard"
        )}
      />
    </Suspense>
  );
}

export default GoogleRedirectPage;
