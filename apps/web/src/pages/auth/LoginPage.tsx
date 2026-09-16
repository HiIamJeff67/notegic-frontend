import { getClientRequestHeaders } from "@/api/clientHeaders";
import { useLogin } from "@/api/hooks/auth.hook";
import CloudflareTurnstile from "@/components/commons/CloudflareTurnstile/CloudflareTurnstile";
import { WebURLPathDictionary } from "@shared/constants";
import { getOAuthGoogleSearchParamsString } from "@shared/lib/getURL";
import { createPendingOAuthState } from "@shared/lib/oauthState";
import toast from "@shared/lib/toast";
import { Suspense, useCallback, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import GridBackground from "@/components/backgrounds/GridBackground/GridBackground";
import StrictLoadingCover from "@/components/covers/LoadingCover/StrictLoadingCover";
import AuthPanel from "@/components/panels/AuthPanel/AuthPanel";
import { useAppRouter, useUser } from "@/hooks";
import {
  getPreferredStartPath,
  useLocalPreferences,
} from "@/hooks/localPreferences";
import { useRegisterLoadingDependencies } from "@/hooks/useLoading";
import { translateError } from "@shared/i18n/error";
import {
  clearTurnstileToken,
  isTurnstileEnabled,
  setTurnstileToken,
} from "@/api/turnstile";

const LoginPage = () => {
  const router = useAppRouter();
  const { t } = useTranslation();
  const { preferences } = useLocalPreferences();
  const userManager = useUser();

  const loginMutator = useLogin();

  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const turnstileRequired = isTurnstileEnabled();
  const [turnstileToken, setTurnstileTokenValue] = useState<string | null>(
    null
  );
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);

  const [isLoginPending, startLoginTransition] = useTransition();

  useRegisterLoadingDependencies(() => isLoginPending);

  const resetTurnstile = useCallback(() => {
    clearTurnstileToken();
    setTurnstileTokenValue(null);
    setTurnstileResetKey(value => value + 1);
  }, []);

  const handleTurnstileTokenChange = useCallback((token: string | null) => {
    setTurnstileTokenValue(token);
    if (token === null) {
      clearTurnstileToken();
    } else {
      setTurnstileToken(token);
    }
  }, []);

  const handleLoginOnSubmit = useCallback(
    async function (): Promise<void> {
      if (turnstileRequired && !turnstileToken) {
        toast.error(t("auth.turnstileRequired"));
        return;
      }

      startLoginTransition(async () => {
        try {
          const userAgent = navigator.userAgent;
          await loginMutator.mutateAsync({
            header: getClientRequestHeaders(userAgent, turnstileToken),
            body: {
              account: account,
              password: password,
            },
          });

          await userManager.fetchUserData();

          setAccount("");
          setPassword("");
          router.push(getPreferredStartPath(preferences));
        } catch (error) {
          setPassword("");
          resetTurnstile();
          toast.error(translateError(error, t));
        }
      });
    },
    [
      account,
      password,
      t,
      preferences,
      userManager,
      loginMutator,
      router,
      resetTurnstile,
      turnstileRequired,
      turnstileToken,
    ]
  );

  const handleGoogleLogin = useCallback(() => {
    if (turnstileRequired && !turnstileToken) {
      toast.error(t("auth.turnstileRequired"));
      return;
    }
    const state = createPendingOAuthState("login");
    if (state === null) {
      toast.error(t("error.encounterUnknownError"));
      return;
    }

    router.forceNavigate(
      WebURLPathDictionary.oauth.google(getOAuthGoogleSearchParamsString(state))
    );
  }, [router, t, turnstileRequired, turnstileToken]);

  return (
    <GridBackground>
      <Suspense fallback={<StrictLoadingCover />}>
        <StrictLoadingCover condition={isLoginPending} />
        <AuthPanel
          title={t("auth.login")}
          subtitle={`${t(
            "auth.authenticationPanelSubtitle"
          )} ${t("auth.login")}`}
          inputs={[
            {
              title: t("auth.account"),
              placeholder: t("auth.accountExample"),
              type: "text",
              value: account,
              onChange: setAccount,
              required: true,
            },
            {
              title: t("auth.password"),
              placeholder: t("auth.passwordExample"),
              type: "password",
              value: password,
              onChange: setPassword,
              required: true,
            },
          ]}
          submitButtonText={t("auth.login")}
          onSubmit={handleLoginOnSubmit}
          submitButtonDisabled={turnstileRequired && !turnstileToken}
          verification={
            turnstileRequired ? (
              <CloudflareTurnstile
                key={turnstileResetKey}
                onTokenChange={handleTurnstileTokenChange}
              />
            ) : null
          }
          switchButtons={[
            {
              description: t("auth.haveNotRegisterAnAccount"),
              title: t("auth.register"),
              onClick: () => {
                router.push(WebURLPathDictionary.auth.register);
              },
            },
            {
              description: t("auth.oopsIForgotMyAccount"),
              title: t("auth.resetPassword"),
              onClick: () => {
                router.push(WebURLPathDictionary.auth.forgetPassword);
              },
            },
          ]}
          oauthButtons={[
            {
              provider: "google",
              label: t("workspace.pages.googleLogin"),
              onClick: handleGoogleLogin,
              disabled: turnstileRequired && !turnstileToken,
            },
          ]}
          statusDetail={t("workspace.pages.systemReady")}
          isLoading={isLoginPending}
        />
      </Suspense>
    </GridBackground>
  );
};

export default LoginPage;
