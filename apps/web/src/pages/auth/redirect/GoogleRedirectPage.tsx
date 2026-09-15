import { getClientRequestHeaders } from "@/api/clientHeaders";
import { useLoginViaGoogle, useRegisterViaGoogle } from "@/api/hooks/auth.hook";
import { OAUTH_STATE_TTL_MS } from "@/api/oauthState";
import {
  clearTurnstileToken,
  debugTurnstile,
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
      debugTurnstile("OAuth action preparing request", {
        action,
        tokenPresent: Boolean(turnstileToken),
        tokenLength: turnstileToken?.length ?? 0,
      });
      const header = getClientRequestHeaders(
        navigator.userAgent,
        turnstileToken
      );
      debugTurnstile("OAuth request headers prepared", {
        action,
        tokenPresent: Boolean(turnstileToken),
      });

      try {
        switch (action) {
          case "register": {
            debugTurnstile("sending Google registration request");
            await registerViaGoogleMutator.mutateAsync({
              header,
              body: { authorizationCode: code },
            });
            debugTurnstile("Google registration request completed");
            return;
          }
          case "login": {
            debugTurnstile("sending Google login request");
            await loginViaGoogleMutator.mutateAsync({
              header,
              body: { authorizationCode: code },
            });
            debugTurnstile("Google login request completed");
            return;
          }
          case "binding": {
            debugTurnstile("sending Google account binding request");
            await bindGoogleAccountMutator.mutateAsync({
              header,
              body: { authorizationCode: code },
            });
            debugTurnstile("Google account binding request completed");
            return;
          }
        }
      } finally {
        if (action !== "binding") {
          debugTurnstile("clearing token after OAuth request");
          clearTurnstileToken();
        }
      }
    },
    [bindGoogleAccountMutator, loginViaGoogleMutator, registerViaGoogleMutator]
  );

  const handleOAuthOnRedirect = useCallback(async () => {
    const searchParams = new URLSearchParams(location.search);
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const state = searchParams.get("state");

    debugTurnstile("Google redirect received", {
      codePresent: Boolean(code),
      errorPresent: error !== null,
      statePresent: Boolean(state),
    });

    const pending = consumePendingOAuthState(
      state,
      Date.now(),
      OAUTH_STATE_TTL_MS
    );
    if (pending === null) {
      debugTurnstile("Google redirect rejected because OAuth state is invalid");
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
      debugTurnstile("OAuth state consumed", { action });

      if (error !== null) {
        debugTurnstile("Google returned an OAuth error", {
          errorPresent: true,
        });
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
        debugTurnstile("Google redirect rejected because code is missing");
        throw new Error(t("error.encounterUnknownError"));
      }

      const turnstileEnabled = isTurnstileEnabled();
      const turnstileToken = getTurnstileToken();
      debugTurnstile("OAuth Turnstile gate checked", {
        action,
        turnstileEnabled,
        tokenPresent: Boolean(turnstileToken),
        tokenLength: turnstileToken?.length ?? 0,
      });
      if (action !== "binding" && turnstileEnabled && !turnstileToken) {
        debugTurnstile("OAuth redirect blocked by missing token");
        throw new Error(t("auth.turnstileRequired"));
      }

      await performGoogleOAuthAction(action, code);
      debugTurnstile("OAuth action completed; fetching user data");
      await userManager.fetchUserData();

      setLoadingPhase("redirecting");
      router.push(getPreferredStartPath(preferences));
    } catch (error) {
      debugTurnstile("OAuth redirect failed", {
        errorName: error instanceof Error ? error.name : "unknown",
        errorMessage: error instanceof Error ? error.message : "unknown",
      });
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
