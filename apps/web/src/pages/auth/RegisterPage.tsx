import { getClientRequestHeaders } from "@/api/clientHeaders";
import { useRegister } from "@/api/hooks/auth.hook";
import {
  clearTurnstileToken,
  debugTurnstile,
  isTurnstileEnabled,
  setTurnstileToken,
} from "@/api/turnstile";
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
import { useRegisterLoadingDependencies } from "@/hooks/useLoading";
import { translateError } from "@shared/i18n/error";

const RegisterPage = () => {
  const router = useAppRouter();
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

  useRegisterLoadingDependencies(() => isRegisterPending);

  const resetTurnstile = useCallback(() => {
    debugTurnstile("register reset started");
    clearTurnstileToken();
    setTurnstileTokenValue(null);
    setTurnstileResetKey(value => value + 1);
    debugTurnstile("register reset completed");
  }, []);

  const handleTurnstileTokenChange = useCallback((token: string | null) => {
    debugTurnstile("register page received token change", {
      tokenPresent: Boolean(token),
      tokenLength: token?.length ?? 0,
    });
    setTurnstileTokenValue(token);
    if (token === null) {
      clearTurnstileToken();
    } else {
      setTurnstileToken(token);
    }
  }, []);

  const handleRegisterOnSubmit = useCallback(async (): Promise<void> => {
    debugTurnstile("password registration submitted", {
      turnstileRequired,
      tokenPresent: Boolean(turnstileToken),
    });
    if (turnstileRequired && !turnstileToken) {
      debugTurnstile("password registration blocked by missing token");
      toast.error(t("auth.turnstileRequired"));
      return;
    }

    const register = async () => {
      if (password !== confirmPassword) {
        throw new Error(
          t("auth.pleaseMakeSurePasswordAndConfirmPasswordAreMatch")
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
          toast.error(translateError(error, t));
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

  const handleGoogleRegister = useCallback(() => {
    debugTurnstile("Google registration clicked", {
      turnstileRequired,
      tokenPresent: Boolean(turnstileToken),
    });
    if (turnstileRequired && !turnstileToken) {
      debugTurnstile("Google registration blocked by missing token");
      toast.error(t("auth.turnstileRequired"));
      return;
    }
    const state = createPendingOAuthState("register");
    if (state === null) {
      toast.error(t("error.encounterUnknownError"));
      return;
    }

    debugTurnstile("Google registration OAuth navigation starting");
    router.forceNavigate(
      WebURLPathDictionary.oauth.google(getOAuthGoogleSearchParamsString(state))
    );
  }, [router, t, turnstileRequired, turnstileToken]);

  return (
    <GridBackground>
      <Suspense fallback={<StrictLoadingCover />}>
        <StrictLoadingCover condition={isRegisterPending} />
        <AuthPanel
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
              onClick: handleGoogleRegister,
              disabled: turnstileRequired && !turnstileToken,
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
