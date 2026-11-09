import { NotegicError } from "@shared/api/exceptions/errors";
import { tError } from "@shared/i18n/error";
import toast from "@shared/lib/toast/toast";
import { WebURLPathDictionary } from "@shared/lib/url/web";
import { Suspense, useCallback, useState, useTransition } from "react";
import { getClientRequestHeaders } from "@/api/clientHeaders";
import { useRegister } from "@/api/hooks/auth.hook";
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
import { useTranslation } from "@/hooks/useTranslation";
import { useOAuth } from "@/hooks/useOAuth";

const RegisterPage = () => {
  const router = useAppRouter();
  const { beginOAuth, githubAvailable, xAvailable } = useOAuth();
  const { t } = useTranslation();
  const userManager = useUser();

  const registerMutator = useRegister();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const turnstileRequired = isTurnstileEnabled();
  const [turnstileToken, setTurnstileTokenValue] = useState<string | null>(
    null
  );
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);

  const [isRegisterPending, startRegisterTransition] = useTransition();

  useRegisterLoadingDependencies(isRegisterPending);

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

  const handleRegisterOnSubmit = useCallback(async (): Promise<void> => {
    if (turnstileRequired && !turnstileToken) {
      toast.error(t("auth.turnstileRequired"));
      return;
    }

    const register = async () => {
      if (password !== confirmPassword) {
        throw new NotegicError("PasswordConfirmationMismatch").setPresentation(
          "auth.validation.passwordMismatch"
        );
      }

      const userAgent = navigator.userAgent;
      await registerMutator.mutateAsync({
        header: getClientRequestHeaders(userAgent, turnstileToken),
        body: {
          name: name,
          email: email,
          password: password,
        },
      });

      await userManager.fetchUserData();

      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      router.push(WebURLPathDictionary.app.dashboard._);
    };

    startRegisterTransition(
      async () =>
        await register().catch(error => {
          setPassword("");
          setConfirmPassword("");
          resetTurnstile();
          toast.error(tError(error, t));
        })
    );
  }, [
    name,
    email,
    password,
    confirmPassword,
    t,
    userManager,
    registerMutator,
    router,
    resetTurnstile,
    turnstileRequired,
    turnstileToken,
  ]);

  return (
    <GridBackground>
      <Suspense fallback={<LoadingCover />}>
        <LoadingCover condition={isRegisterPending} />
        <AuthPanel
          noValidate
          title={t("auth.register")}
          subtitle={`${t(
            "auth.authenticationPanelSubtitle"
          )} ${t("auth.register")}`}
          inputs={[
            {
              title: t("auth.name"),
              placeholder: t("auth.nameExample"),
              type: "text",
              value: name,
              onChange: setName,
              required: true,
            },
            {
              title: t("auth.email"),
              placeholder: t("auth.emailExample"),
              type: "email",
              value: email,
              onChange: setEmail,
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
            {
              title: t("auth.confirmPassword"),
              placeholder: t("auth.passwordExample"),
              type: "password",
              value: confirmPassword,
              onChange: setConfirmPassword,
              required: true,
            },
          ]}
          submitButtonText={t("auth.register")}
          onSubmit={handleRegisterOnSubmit}
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
              description: t("auth.alreadyHaveAnAccount"),
              title: t("auth.login"),
              onClick: () => {
                router.push(WebURLPathDictionary.auth.login);
              },
            },
          ]}
          oauthButtons={[
            {
              provider: "google",
              label: t("workspace.pages.googleRegister"),
              onClick: () => beginOAuth("google", "register"),
              disabled: turnstileRequired && !turnstileToken,
            },
            {
              provider: "github",
              label: t("workspace.pages.githubRegister"),
              onClick: () => beginOAuth("github", "register"),
              disabled:
                !githubAvailable || (turnstileRequired && !turnstileToken),
            },
            {
              provider: "x",
              label: t("workspace.pages.xRegister"),
              onClick: () => beginOAuth("x", "register"),
              disabled: !xAvailable || (turnstileRequired && !turnstileToken),
            },
          ]}
          statusDetail={t("workspace.pages.systemReady")}
          isLoading={isRegisterPending}
        />
      </Suspense>
    </GridBackground>
  );
};

export default RegisterPage;
