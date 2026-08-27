import { getClientRequestHeaders } from "@/api/clientHeaders";
import { useForgetPassword, useSendAuthCode } from "@/api/hooks/auth.hook";
import { AuthCodeBlockedSecond, WebURLPathDictionary } from "@shared/constants";
import toast from "@shared/lib/toast";
import {
  Suspense,
  useCallback,
  useEffect,
  useState,
  useTransition,
} from "react";
import { useTranslation } from "react-i18next";
import GridBackground from "@/components/backgrounds/GridBackground/GridBackground";
import StrictLoadingCover from "@/components/covers/LoadingCover/StrictLoadingCover";
import AuthPanel from "@/components/panels/AuthPanel/AuthPanel";
import { useAppRouter } from "@/hooks";
import { useRegisterLoadingDependencies } from "@/hooks/useLoading";
import { translateError } from "@shared/i18n/error";

const ForgetPasswordPage = () => {
  const router = useAppRouter();
  const { t } = useTranslation();
  const sendAuthCodeMutator = useSendAuthCode();
  const forgetPasswordMutator = useForgetPassword();

  const [email, setEmail] = useState<string>("");
  const [authCode, setAuthCode] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>("");
  const [sendAuthCodeTimeCounter, setSendAuthCodeTimeCounter] =
    useState<number>(0);

  const [isSendAuthCodePending, startSendAuthCodeTransition] = useTransition();
  const [isResetPasswordPending, startResetPasswordTransition] =
    useTransition();

  useRegisterLoadingDependencies(
    () => isSendAuthCodePending,
    () => isResetPasswordPending
  );

  useEffect(() => {
    if (sendAuthCodeTimeCounter === 0) return;
    const timer = setInterval(() => {
      setSendAuthCodeTimeCounter(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sendAuthCodeTimeCounter]);

  const handleSendAuthCodeOnClick = useCallback(
    async (): Promise<void> =>
      startSendAuthCodeTransition(async () => {
        try {
          const userAgent = navigator.userAgent;
          const responseOfSendingAuthCode =
            await sendAuthCodeMutator.mutateAsync({
              header: getClientRequestHeaders(userAgent),
              body: {
                email: email,
              },
            });

          const blockUntil = new Date(
            responseOfSendingAuthCode.data.blockAuthCodeUntil
          );
          const blockTime = Math.floor(
            (blockUntil.getTime() - new Date().getTime()) / 1000
          );
          setSendAuthCodeTimeCounter(
            Math.max(AuthCodeBlockedSecond, blockTime)
          );
        } catch (error) {
          setSendAuthCodeTimeCounter(0);
          toast.error(translateError(error, t));
        }
      }),
    [email, t, sendAuthCodeMutator]
  );

  const handleResetPasswordOnSubmit = useCallback(
    async function (): Promise<void> {
      startResetPasswordTransition(async () => {
        try {
          if (newPassword !== confirmNewPassword) {
            throw new Error(
              t("auth.pleaseMakeSurePasswordAndConfirmPasswordAreMatch")
            );
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
          toast.error(translateError(error, t));
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
      <Suspense fallback={<StrictLoadingCover />}>
        <StrictLoadingCover
          condition={
            sendAuthCodeMutator.isPending ||
            forgetPasswordMutator.isPending ||
            router.isNavigating
          }
        />
        <AuthPanel
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
            {
              title: t("auth.authCode"),
              placeholder: t("auth.authCodeExample"),
              type: "number",
              value: authCode,
              onChange: setAuthCode,
              required: true,
              rightButton: {
                description:
                  sendAuthCodeTimeCounter > 0
                    ? `${sendAuthCodeTimeCounter}s`
                    : `${t("common.send")}${t(
                        "syntax.separator"
                      )}${t("auth.authCode")}`,
                onClick: async () => handleSendAuthCodeOnClick(),
                disabled: sendAuthCodeTimeCounter > 0,
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
