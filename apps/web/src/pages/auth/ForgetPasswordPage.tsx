import { NotegicError } from "@shared/api/exceptions/errors";
import { tError } from "@shared/i18n/error";
import toast from "@shared/lib/toast/toast";
import { WebURLPathDictionary } from "@shared/lib/url/web";
import { Suspense, useCallback, useState, useTransition } from "react";
import { getClientRequestHeaders } from "@/api/clientHeaders";
import { useForgetPassword } from "@/api/hooks/auth.hook";
import { clearTurnstileToken, isTurnstileEnabled } from "@/api/turnstile";
import GridBackground from "@/components/backgrounds/GridBackground/GridBackground";
import CloudflareTurnstile from "@/components/commons/CloudflareTurnstile/CloudflareTurnstile";
import LoadingCover from "@/components/covers/LoadingCover/LoadingCover";
import AuthPanel from "@/components/panels/AuthPanel/AuthPanel";
import { useAppRouter } from "@/hooks";
import { useAuthCode } from "@/hooks/useAuthCode";
import { useRegisterLoadingDependencies } from "@/hooks/useLoading";
import { useNetwork } from "@/hooks/useNetwork";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useTranslation } from "@/hooks/useTranslation";
import { pageTitle } from "@/seo/pageTitle";

const ForgetPasswordPage = () => {
  usePageTitle(pageTitle("Forgot Password"));

  const router = useAppRouter();
  const { t } = useTranslation();
  const { isOnline } = useNetwork();
  const { seconds, isSending, sendAuthCode } = useAuthCode();
  const forgetPasswordMutator = useForgetPassword();

  const [email, setEmail] = useState<string>("");
  const [sentEmail, setSentEmail] = useState<string>();
  const [authCode, setAuthCode] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>("");
  const turnstileRequired = isTurnstileEnabled();
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);

  const [isResetPasswordPending, startResetPasswordTransition] =
    useTransition();

  useRegisterLoadingDependencies(isResetPasswordPending);

  const resetTurnstile = useCallback(() => {
    clearTurnstileToken();
    setTurnstileToken(null);
    setTurnstileResetKey(value => value + 1);
  }, []);

  const handleSendAuthCode = async () => {
    try {
      if (!(await sendAuthCode(email, turnstileToken))) return;
      setSentEmail(email);
      toast.success(t("settingsPage.account.authCodeSent", { email }));
    } catch (error) {
      toast.error(tError(error, t));
    }
    resetTurnstile();
  };

  const handleResetPasswordOnSubmit = useCallback(
    async function (): Promise<void> {
      startResetPasswordTransition(async () => {
        try {
          if (newPassword !== confirmNewPassword) {
            throw new NotegicError(
              "PasswordConfirmationMismatch"
            ).setPresentation("auth.validation.passwordMismatch");
          }

          const userAgent = navigator.userAgent;
          await forgetPasswordMutator.mutateAsync({
            header: getClientRequestHeaders(userAgent),
            body: {
              account: email,
              newPassword: newPassword,
              authCode: authCode,
            },
          });
          setEmail("");
          setAuthCode("");
          setNewPassword("");
          setConfirmNewPassword("");
          router.push(WebURLPathDictionary.auth.login);
        } catch (error) {
          setNewPassword("");
          setConfirmNewPassword("");
          toast.error(tError(error, t));
        }
      });
    },
    [
      email,
      authCode,
      newPassword,
      confirmNewPassword,
      t,
      forgetPasswordMutator,
      router,
    ]
  );

  return (
    <GridBackground>
      <Suspense fallback={<LoadingCover />}>
        <LoadingCover
          condition={forgetPasswordMutator.isPending || isResetPasswordPending}
        />
        <AuthPanel
          noValidate
          title={t("auth.resetPassword")}
          subtitle={`${t(
            "auth.authenticationPanelSubtitle"
          )} ${t("auth.resetPassword")}`}
          inputs={[
            {
              title: t("auth.email"),
              placeholder: t("auth.emailExample"),
              type: "email",
              value: email,
              onChange: setEmail,
              required: true,
            },
            // Public recovery uses the AuthPanel field instead of AuthCodeInput.
            {
              title: t("auth.authCode"),
              placeholder: t("auth.authCodeExample"),
              type: "number",
              value: authCode,
              onChange: setAuthCode,
              rightButton: {
                description:
                  seconds > 0
                    ? `${seconds}s`
                    : sentEmail === email
                      ? t("settingsPage.account.security.resendCode")
                      : t("common.send"),
                onClick: handleSendAuthCode,
                disabled:
                  !isOnline ||
                  !email ||
                  isSending ||
                  seconds > 0 ||
                  (turnstileRequired && !turnstileToken),
              },
            },
            {
              title: t("auth.newPassword"),
              placeholder: t("auth.passwordExample"),
              type: "password",
              value: newPassword,
              onChange: setNewPassword,
              required: true,
            },
            {
              title: t("auth.confirmNewPassword"),
              placeholder: t("auth.passwordExample"),
              type: "password",
              value: confirmNewPassword,
              onChange: setConfirmNewPassword,
              required: true,
            },
          ]}
          submitButtonText={t("auth.resetPassword")}
          onSubmit={handleResetPasswordOnSubmit}
          verification={
            turnstileRequired ? (
              <CloudflareTurnstile
                key={turnstileResetKey}
                onTokenChange={setTurnstileToken}
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
              description: t("auth.alreadyHaveAnAccount"),
              title: t("auth.login"),
              onClick: () => {
                router.push(WebURLPathDictionary.auth.login);
              },
            },
          ]}
          statusDetail={t("workspace.pages.systemReady")}
          isLoading={isResetPasswordPending}
        />
      </Suspense>
    </GridBackground>
  );
};

export default ForgetPasswordPage;
