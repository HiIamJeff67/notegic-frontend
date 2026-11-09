import { NotegicAPIError } from "@shared/api/exceptions";
import { NotegicError } from "@shared/api/exceptions/errors";
import type {
  GetMyAccountResponse,
  PrepareOAuthOperationRequest,
  PrepareOAuthOperationResponse,
  UnbindGoogleAccountRequest,
  UnbindGoogleAccountResponse,
} from "@shared/api/interfaces/userAccount.interface";
import { getQueryClient } from "@shared/api/queryClient";
import { queryKeys } from "@shared/api/queryKeys";
import { tError } from "@shared/i18n/error";
import {
  isPendingOAuthState,
  type OAuthAction,
  type PendingOAuthState,
  oauthStatePattern,
} from "@shared/lib/auth/oauthState.type";
import {
  SessionStorage,
  SessionStorageKey,
} from "@shared/lib/storage/sessionStorage";
import toast from "@shared/lib/toast/toast";
import { WebURLPathDictionary } from "@shared/lib/url/web";
import { createContext, useCallback, useRef, type ReactNode } from "react";
import {
  getClientMutationHeaders,
  getClientRequestHeaders,
} from "@/api/clientHeaders";
import {
  useLoginViaGoogle,
  useRegisterViaGoogle,
  useLoginViaGithub,
  useLoginViaX,
  useRegisterViaGithub,
  useRegisterViaX,
} from "@/api/hooks/auth.hook";
import {
  useBindGoogleAccount,
  useBindGithubAccount,
  useBindXAccount,
  usePrepareOAuthOperation,
  useUnbindGithubAccount,
  useUnbindGoogleAccount,
  useUnbindXAccount,
} from "@/api/hooks/userAccount.hook";
import {
  clearTurnstileToken,
  getTurnstileToken,
  isTurnstileEnabled,
} from "@/api/turnstile";
import { useAppRouter, useUser } from "@/hooks";
import { useLoading } from "@/hooks/useLoading";
import { useLocalPreferences } from "@/hooks/useLocalPreferences";
import { useTranslation } from "@/hooks/useTranslation";
import { getPreferredStartPath } from "@/providers/LocalPreferencesProvider";

const localXStatePrefix = "localhost.";

const configuredOAuthStateTtlMs = Number.parseInt(
  import.meta.env.VITE_OAUTH_STATE_TTL_MS ?? "",
  10
);
const oauthStateTtlMs =
  configuredOAuthStateTtlMs > 0 ? configuredOAuthStateTtlMs : 5 * 60 * 1000;

export type OAuthProviderName = "google" | "github" | "x";

type VerifiedOAuthOperation = {
  state: string;
  codeChallenge: string;
};

type OAuthContextValue = {
  prepareOAuthOperation: (
    body: PrepareOAuthOperationRequest["body"]
  ) => Promise<PrepareOAuthOperationResponse>;
  isPreparingOAuthOperation: boolean;
  beginOAuth: (
    provider: OAuthProviderName,
    action: OAuthAction,
    operation?: VerifiedOAuthOperation
  ) => Promise<void>;
  completeOAuth: (provider: string, search: string) => Promise<void>;
  unbindOAuth: (
    provider: OAuthProviderName,
    body: UnbindGoogleAccountRequest["body"]
  ) => Promise<UnbindGoogleAccountResponse>;
  githubAvailable: boolean;
  xAvailable: boolean;
  isUnbinding: boolean;
};

export const OAuthContext = createContext<OAuthContextValue | undefined>(
  undefined
);

export const OAuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useAppRouter();
  const { t } = useTranslation();
  const { preferences } = useLocalPreferences();
  const userManager = useUser();
  const { startAsyncTransactionLoading } = useLoading();

  const registerViaGoogleMutator = useRegisterViaGoogle();
  const loginViaGoogleMutator = useLoginViaGoogle();
  const bindGoogleAccountMutator = useBindGoogleAccount();
  const registerViaGithubMutator = useRegisterViaGithub();
  const loginViaGithubMutator = useLoginViaGithub();
  const bindGithubAccountMutator = useBindGithubAccount();
  const registerViaXMutator = useRegisterViaX();
  const loginViaXMutator = useLoginViaX();
  const bindXAccountMutator = useBindXAccount();

  const lastCallback = useRef<{
    provider: string;
    state: string | null;
  } | null>(null);

  const prepareOAuthOperationMutator = usePrepareOAuthOperation();
  const unbindGoogleMutator = useUnbindGoogleAccount();
  const unbindGithubMutator = useUnbindGithubAccount();
  const unbindXMutator = useUnbindXAccount();

  const unbindOAuth = useCallback(
    async (
      provider: OAuthProviderName,
      body: UnbindGoogleAccountRequest["body"]
    ) => {
      const mutator =
        provider === "google"
          ? unbindGoogleMutator
          : provider === "github"
            ? unbindGithubMutator
            : unbindXMutator;
      const response = await mutator.mutateAsync({
        header: getClientMutationHeaders(navigator.userAgent),
        body,
      });
      if (response.data.verificationRequired) return response;

      const queryClient = getQueryClient();
      const queryKey = queryKeys.userAccount.my();
      queryClient.setQueryData<GetMyAccountResponse>(queryKey, current =>
        current
          ? {
              ...current,
              data: {
                ...current.data,
                [`${provider}Bound`]: false,
                registeredAuthProviderType:
                  response.data.fallbackProvider ??
                  current.data.registeredAuthProviderType,
                oauthFallbackProviders:
                  current.data.oauthFallbackProviders?.filter(
                    candidate => candidate.toLowerCase() !== provider
                  ),
              },
            }
          : undefined
      );
      void queryClient.invalidateQueries({ queryKey });
      return response;
    },
    [unbindGoogleMutator, unbindGithubMutator, unbindXMutator]
  );

  const performOAuthAction = useCallback(
    async (
      provider: OAuthProviderName,
      action: OAuthAction,
      code: string,
      state: string,
      codeVerifier?: string
    ): Promise<void> => {
      const turnstileToken = action === "binding" ? null : getTurnstileToken();
      const header = getClientRequestHeaders(
        navigator.userAgent,
        turnstileToken
      );

      try {
        switch (action) {
          case "register": {
            if (provider !== "google") {
              const mutator =
                provider === "github"
                  ? registerViaGithubMutator
                  : registerViaXMutator;
              await mutator.mutateAsync({
                header,
                body: { authorizationCode: code, codeVerifier: codeVerifier! },
              });
            } else {
              await registerViaGoogleMutator.mutateAsync({
                header,
                body: { authorizationCode: code, codeVerifier: codeVerifier! },
              });
            }
            return;
          }
          case "login": {
            if (provider !== "google") {
              const mutator =
                provider === "github"
                  ? loginViaGithubMutator
                  : loginViaXMutator;
              await mutator.mutateAsync({
                header,
                body: { authorizationCode: code, codeVerifier: codeVerifier! },
              });
            } else {
              await loginViaGoogleMutator.mutateAsync({
                header,
                body: { authorizationCode: code, codeVerifier: codeVerifier! },
              });
            }
            return;
          }
          case "binding": {
            const mutator =
              provider === "google"
                ? bindGoogleAccountMutator
                : provider === "github"
                  ? bindGithubAccountMutator
                  : bindXAccountMutator;
            await mutator.mutateAsync({
              header,
              body: { authorizationCode: code, state },
            });
            return;
          }
        }
      } finally {
        if (action !== "binding") {
          clearTurnstileToken();
        }
      }
    },
    [
      bindGoogleAccountMutator,
      loginViaGoogleMutator,
      registerViaGoogleMutator,
      bindGithubAccountMutator,
      bindXAccountMutator,
      loginViaGithubMutator,
      loginViaXMutator,
      registerViaGithubMutator,
      registerViaXMutator,
    ]
  );

  const completeOAuth = useCallback(
    async (provider: string, search: string) => {
      const searchParams = new URLSearchParams(search);
      const code = searchParams.get("code");
      const error = searchParams.get("error");
      const state = searchParams.get("state");
      if (
        lastCallback.current?.provider === provider &&
        lastCallback.current.state === state
      ) {
        return;
      }
      lastCallback.current = { provider, state };

      if (
        import.meta.env.DEV &&
        provider === "x" &&
        window.location.hostname === "127.0.0.1" &&
        window.location.origin + window.location.pathname ===
          import.meta.env.VITE_OAUTH_X_REDIRECT_URL &&
        state?.startsWith(localXStatePrefix)
      ) {
        const localState = state.slice(localXStatePrefix.length);
        if (oauthStatePattern.test(localState)) {
          // X requires the IP callback. The verifier and session stay on localhost.
          const callback = new URL(window.location.href);
          callback.hostname = "localhost";
          callback.search = new URLSearchParams({
            state: localState,
          }).toString();
          if (code) callback.searchParams.set("code", code);
          if (error !== null) callback.searchParams.set("error", error);
          window.location.replace(callback.toString());
          return;
        }
      }

      await startAsyncTransactionLoading(async setLabel => {
        const now = Date.now();
        const pending: unknown = SessionStorage.getItemByKey(
          SessionStorageKey.pendingOAuthState
        );
        const matchesAttempt =
          isPendingOAuthState(pending) &&
          (pending.provider ?? "google") === provider &&
          state === pending.state;
        if (matchesAttempt || !isPendingOAuthState(pending)) {
          SessionStorage.removeItem(SessionStorageKey.pendingOAuthState);
        }

        try {
          if (
            provider !== "google" &&
            provider !== "github" &&
            provider !== "x"
          ) {
            throw new NotegicError().setPresentation(
              "workspace.pages.appleRedirectUnavailable"
            );
          }

          if (
            !matchesAttempt ||
            pending.createdAt > now ||
            now - pending.createdAt > oauthStateTtlMs
          ) {
            throw new NotegicError().setPresentation(
              "workspace.pages.oauthError.restart"
            );
          }

          if (error !== null || !code) {
            throw new NotegicError().setPresentation(
              error === "access_denied"
                ? "workspace.pages.oauthError.cancelled"
                : error !== null
                  ? "server.error.OAuthProviderUnavailable"
                  : "workspace.pages.oauthError.missingCode"
            );
          }

          if (
            pending.action !== "binding" &&
            isTurnstileEnabled() &&
            !getTurnstileToken()
          ) {
            throw new NotegicError().setPresentation("auth.turnstileRequired");
          }

          await performOAuthAction(
            provider,
            pending.action,
            code,
            pending.state,
            pending.codeVerifier
          );
          if (pending.action !== "binding") await userManager.fetchUserData();

          setLabel(
            t(
              pending.action === "binding"
                ? "common.loading"
                : "workspace.pages.redirectingToDashboard"
            )
          );
          await router.replace(
            pending.action === "binding"
              ? `${WebURLPathDictionary.app.setting.account}#binding`
              : getPreferredStartPath(preferences)
          );
        } catch (error) {
          let message = tError(error, t);
          if (error instanceof NotegicAPIError) {
            if (error.unWrap.reason === "WrongPassword") {
              message = t("workspace.pages.oauthError.notLinked");
            } else if (error.unWrap.reason === "OAuthVerificationRequired") {
              message = t("settingsPage.account.binding.oauthVerifyAgain");
            }
          }
          toast.error(
            message === t("error.encounterUnknownError")
              ? t("workspace.pages.oauthError.failed")
              : message
          );
          setLabel(t("common.loading"));
          await router.replace(
            matchesAttempt && pending.action === "binding"
              ? `${WebURLPathDictionary.app.setting.account}#binding`
              : `${WebURLPathDictionary.auth.login}?oauthFailed=true`
          );
        }
      });
    },
    [
      router,
      preferences,
      t,
      userManager,
      performOAuthAction,
      startAsyncTransactionLoading,
    ]
  );

  const beginOAuth = async (
    provider: OAuthProviderName,
    action: OAuthAction,
    operation?: VerifiedOAuthOperation
  ) => {
    try {
      if (
        action !== "binding" &&
        isTurnstileEnabled() &&
        !getTurnstileToken()
      ) {
        throw new NotegicError().setPresentation("auth.turnstileRequired");
      }
      const random = crypto.getRandomValues(new Uint8Array(64));
      if (action === "binding" && !operation) {
        throw new NotegicError().setPresentation(
          "workspace.pages.oauthError.restart"
        );
      }
      const state =
        operation?.state ??
        Array.from(random.slice(0, 32), byte =>
          byte.toString(16).padStart(2, "0")
        ).join("");
      const pending: PendingOAuthState = {
        provider,
        state,
        action,
        createdAt: Date.now(),
      };
      let codeChallenge = operation?.codeChallenge;
      if (!codeChallenge) {
        pending.codeVerifier = Array.from(random.slice(32), byte =>
          byte.toString(16).padStart(2, "0")
        ).join("");
        const digest = await crypto.subtle.digest(
          "SHA-256",
          new TextEncoder().encode(pending.codeVerifier)
        );
        codeChallenge = btoa(String.fromCharCode(...new Uint8Array(digest)))
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/=+$/, "");
      }

      let authorizeURL: string;
      if (provider !== "google") {
        const clientId =
          provider === "github"
            ? import.meta.env.VITE_OAUTH_GITHUB_CLIENT_ID
            : import.meta.env.VITE_OAUTH_X_CLIENT_ID;
        const redirectURL =
          provider === "github"
            ? import.meta.env.VITE_OAUTH_GITHUB_REDIRECT_URL
            : import.meta.env.VITE_OAUTH_X_REDIRECT_URL;
        if (!clientId || !redirectURL) {
          throw new NotegicError().setPresentation(
            "workspace.pages.oauthError.unavailable"
          );
        }
        const callback = new URL(redirectURL);
        const useLocalXCallback =
          import.meta.env.DEV &&
          provider === "x" &&
          window.location.hostname === "localhost" &&
          callback.hostname === "127.0.0.1" &&
          callback.protocol === window.location.protocol &&
          callback.port === window.location.port;
        const params = new URLSearchParams({
          client_id: clientId,
          redirect_uri: redirectURL,
          state: useLocalXCallback ? localXStatePrefix + state : state,
          code_challenge: codeChallenge,
          code_challenge_method: "S256",
        });
        if (provider === "github") {
          params.set("scope", "user:email");
          authorizeURL = WebURLPathDictionary.oauth.github(params.toString());
        } else {
          params.set("response_type", "code");
          params.set("scope", "tweet.read users.read users.email");
          authorizeURL = WebURLPathDictionary.oauth.x(params.toString());
        }
      } else {
        authorizeURL = WebURLPathDictionary.oauth.google(
          new URLSearchParams({
            client_id: import.meta.env.VITE_OAUTH_GOOGLE_CLIENT_ID,
            redirect_uri: import.meta.env.VITE_OAUTH_GOOGLE_REDIRECT_URL,
            access_type: "offline",
            response_type: "code",
            prompt: "consent",
            scope:
              "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
            state,
            code_challenge: codeChallenge,
            code_challenge_method: "S256",
          }).toString()
        );
      }
      if (
        !SessionStorage.setItem(SessionStorageKey.pendingOAuthState, pending)
      ) {
        throw new NotegicError().setPresentation(
          "workspace.pages.oauthError.storage"
        );
      }
      router.forceNavigate(authorizeURL);
    } catch (error) {
      toast.error(tError(error, t));
    }
  };

  return (
    <OAuthContext.Provider
      value={{
        beginOAuth,
        completeOAuth,
        unbindOAuth,
        prepareOAuthOperation: body =>
          prepareOAuthOperationMutator.mutateAsync({
            header: getClientMutationHeaders(navigator.userAgent),
            body,
          }),
        isPreparingOAuthOperation: prepareOAuthOperationMutator.isPending,
        githubAvailable: Boolean(
          import.meta.env.VITE_OAUTH_GITHUB_CLIENT_ID &&
            import.meta.env.VITE_OAUTH_GITHUB_REDIRECT_URL
        ),
        xAvailable: Boolean(
          import.meta.env.VITE_OAUTH_X_CLIENT_ID &&
            import.meta.env.VITE_OAUTH_X_REDIRECT_URL
        ),
        isUnbinding:
          unbindGoogleMutator.isPending ||
          unbindGithubMutator.isPending ||
          unbindXMutator.isPending,
      }}
    >
      {children}
    </OAuthContext.Provider>
  );
};
