import { getClientRequestHeaders } from "@shared/api/clientHeaders";
import { useRegister } from "@shared/api/hooks/auth.hook";
import { useGetUserData } from "@shared/api/hooks/user.hook";
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
import { useRegisterLoadingDependencies } from "@/hooks/useLoading";
import { translateError } from "@/i18n/error";

const RegisterPage = () => {
  const router = useAppRouter();
  const { t } = useTranslation();
  const userManager = useUser();

  const registerMutator = useRegister();
  const getUserDataQuerier = useGetUserData();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isRegisterPending, startRegisterTransition] = useTransition();

  useRegisterLoadingDependencies(() => isRegisterPending);

  const handleRegisterOnSubmit = useCallback(async (): Promise<void> => {
    const register = async () => {
      if (password !== confirmPassword) {
        throw new Error(
          t("auth.pleaseMakeSurePasswordAndConfirmPasswordAreMatch")
        );
      }

      const userAgent = navigator.userAgent;
      await registerMutator.mutateAsync({
        header: getClientRequestHeaders(userAgent),
        body: {
          name: name,
          email: email,
          password: password,
        },
      });

      const responseOfGettingUserData = await getUserDataQuerier.fetch({
        header: getClientRequestHeaders(navigator.userAgent),
        body: {},
      });

      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      userManager.setUserData(responseOfGettingUserData.data);
      router.push(WebURLPathDictionary.root.dashboard._);
    };

    startRegisterTransition(
      async () =>
        await register().catch(error => {
          setPassword("");
          setConfirmPassword("");
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
  ]);

  return (
    <GridBackground>
      <Suspense fallback={<StrictLoadingCover />}>
        <StrictLoadingCover condition={registerMutator.isPending} />
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
              onClick: () =>
                router.forceNavigate(
                  WebURLPathDictionary.oauth.google(
                    getOAuthGoogleSearchParamsString({
                      csrfToken: CSRFTokenGenerator.generate(),
                      action: "register",
                      from: router.getCurrentPath(),
                    })
                  )
                ),
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
