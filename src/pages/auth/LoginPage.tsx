import { getClientRequestHeaders } from "@shared/api/clientHeaders";
import { useLogin } from "@shared/api/hooks/auth.hook";
import { queryFnGetUserData } from "@shared/api/invokers/user.invoker";
import { WebURLPathDictionary } from "@shared/constants";
import { getOAuthGoogleSearchParamsString } from "@shared/lib/getURL";
import toast from "@shared/lib/toast";
import { CSRFTokenGenerator } from "@shared/lib/tokenGenerator";
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
import { translateError } from "@/i18n/error";

const LoginPage = () => {
  const router = useAppRouter();
  const { t } = useTranslation();
  const { preferences } = useLocalPreferences();
  const userManager = useUser();

  const loginMutator = useLogin();

  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");

  const [isLoginPending, startLoginTransition] = useTransition();

  useRegisterLoadingDependencies(() => isLoginPending);

  const handleLoginOnSubmit = useCallback(
    async function (): Promise<void> {
      startLoginTransition(async () => {
        try {
          const userAgent = navigator.userAgent;
          await loginMutator.mutateAsync({
            header: getClientRequestHeaders(userAgent),
            body: {
              account: account,
              password: password,
            },
          });

          const responseOfGettingUserData = await queryFnGetUserData({
            header: getClientRequestHeaders(userAgent),
          });

          setAccount("");
          setPassword("");
          userManager.setUserData(responseOfGettingUserData.data);
          router.push(getPreferredStartPath(preferences));
        } catch (error) {
          setPassword("");
          toast.error(translateError(error, t));
        }
      });
    },
    [account, password, t, preferences, userManager, loginMutator, router]
  );

  return (
    <GridBackground>
      <Suspense fallback={<StrictLoadingCover />}>
        <StrictLoadingCover condition={loginMutator.isPending} />
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
              onClick: () =>
                router.forceNavigate(
                  WebURLPathDictionary.oauth.google(
                    getOAuthGoogleSearchParamsString({
                      csrfToken: CSRFTokenGenerator.generate(),
                      action: "login",
                      from: router.getCurrentPath(),
                    })
                  )
                ),
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
