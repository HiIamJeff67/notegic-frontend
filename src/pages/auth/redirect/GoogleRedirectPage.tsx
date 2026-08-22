import { getClientRequestHeaders } from "@shared/api/clientHeaders";
import {
  useLoginViaGoogle,
  useRegisterViaGoogle,
} from "@shared/api/hooks/auth.hook";
import { useBindGoogleAccount } from "@shared/api/hooks/userAccount.hook";
import { WebURLPathDictionary } from "@shared/constants";
import toast from "@shared/lib/toast";
import { RedirectState } from "@shared/types/redirectState.type";
import { useLocation } from "@tanstack/react-router";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import StrictLoadingCover from "@/components/covers/LoadingCover/StrictLoadingCover";
import { useAppRouter, useUser } from "@/hooks";
import {
  getPreferredStartPath,
  useLocalPreferences,
} from "@/hooks/localPreferences";
import { translateError } from "@/i18n/error";

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
    async (
      action: "register" | "login" | "binding",
      code: string
    ): Promise<void> => {
      const header = getClientRequestHeaders(navigator.userAgent);

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
    },
    [bindGoogleAccountMutator, loginViaGoogleMutator, registerViaGoogleMutator]
  );

  const handleOAuthOnRedirect = useCallback(async () => {
    const searchParams = new URLSearchParams(location.search);
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const state = searchParams.get("state");

    if (code === null || error !== null) {
      toast.error(
        t("workspace.notifications.googleAuthError", {
          error: error ?? t("error.encounterUnknownError"),
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

    try {
      let action: "register" | "login" | "binding" = "login";

      if (state) {
        const decoded = state.startsWith("{") ? state : atob(state);
        const parsedState = JSON.parse(decoded) as RedirectState;
        if (parsedState.action) {
          action = parsedState.action;
        }
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
