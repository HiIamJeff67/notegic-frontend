import { tError } from "@shared/i18n/error";
import toast from "@shared/lib/toast/toast";
import { WebURLPathDictionary } from "@shared/lib/url/web";
import { Suspense, useCallback, useState, useTransition } from "react";
import { getClientRequestHeaders } from "@/api/clientHeaders";
import { useLogin } from "@/api/hooks/auth.hook";
import {
  clearTurnstileToken,
  isTurnstileEnabled,
  setTurnstileToken,
} from "@/api/turnstile";
import GridBackground from "@/components/backgrounds/GridBackground/GridBackground";
import CloudflareTurnstile from "@/components/commons/CloudflareTurnstile/CloudflareTurnstile";
import LoadingCover from "@/components/covers/LoadingCover/LoadingCover";
import AuthPanel from "@/components/panels/AuthPanel/AuthPanel";
import { useAppRouter, useUser } from "@/hooks";
import { useRegisterLoadingDependencies } from "@/hooks/useLoading";
import { useLocalPreferences } from "@/hooks/useLocalPreferences";
import { useTranslation } from "@/hooks/useTranslation";
import { useOAuth } from "@/hooks/useOAuth";

const LoginPage = () => {
  const router = useAppRouter();
  const { perform, githubAvailable, xAvailable } = useOAuth();
  const { t } = useTranslation();
  const { startPath } = useLocalPreferences();
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

  useRegisterLoadingDependencies(isLoginPending);

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
          router.push(startPath);
        } catch (error) {
          setPassword("");
          resetTurnstile();
          toast.error(tError(error, t));
        }
      });
    },
    [
      account,
      password,
      startPath,
      userManager,
      loginMutator,
      router,
      resetTurnstile,
      turnstileRequired,
      turnstileToken,
    ]
  );

  return (
    <GridBackground>
      <Suspense fallback={<LoadingCover />}>
        <LoadingCover condition={isLoginPending} />
        <AuthPanel
          noValidate
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
              onClick: () => perform("google", "login"),
              disabled: turnstileRequired && !turnstileToken,
            },
            {
              provider: "github",
              label: t("workspace.pages.githubLogin"),
              onClick: () => perform("github", "login"),
              disabled:
                !githubAvailable || (turnstileRequired && !turnstileToken),
            },
            {
              provider: "x",
              label: t("workspace.pages.xLogin"),
              onClick: () => perform("x", "login"),
              disabled: !xAvailable || (turnstileRequired && !turnstileToken),
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
