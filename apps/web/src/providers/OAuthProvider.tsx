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
  oauthStatePattern,
  type PendingOAuthState,
} from "@shared/lib/auth/oauthState.type";
import {
  SessionStorage,
  SessionStorageKey,
} from "@shared/lib/storage/sessionStorage";
import toast from "@shared/lib/toast/toast";
import { WebURLPathDictionary } from "@shared/lib/url/web";
import type { OAuthProviderType } from "@shared/types/oauthProvider.type";
import {
  type Context,
  createContext,
  type ReactNode,
  useCallback,
  useRef,
} from "react";
import {
  getClientMutationHeaders,
  getClientRequestHeaders,
} from "@/api/clientHeaders";
import {
  useLoginViaGithub,
  useLoginViaGoogle,
  useLoginViaX,
  useLoginViaDiscord,
  useRegisterViaGithub,
  useRegisterViaGoogle,
  useRegisterViaX,
  useRegisterViaDiscord,
} from "@/api/hooks/auth.hook";
import {
  useBindGithubAccount,
  useBindGoogleAccount,
  useBindXAccount,
  useBindDiscordAccount,
  usePrepareOAuthOperation,
  useUnbindGithubAccount,
  useUnbindGoogleAccount,
  useUnbindXAccount,
  useUnbindDiscordAccount,
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

const xLoopbackStatePrefix = "localhost.";

type OAuthContextValue = {
  prepare: (
    body: PrepareOAuthOperationRequest["body"]
  ) => Promise<PrepareOAuthOperationResponse>;
  isPreparingOAuthOperation: boolean;
  perform: (
    provider: OAuthProviderType,
    action: OAuthAction,
    operation?: { state: string; codeChallenge: string }
  ) => Promise<void>;
  complete: (provider: string, search: string) => Promise<void>;
  unbind: (
    provider: OAuthProviderType,
    body: UnbindGoogleAccountRequest["body"]
  ) => Promise<UnbindGoogleAccountResponse>;
  githubAvailable: boolean;
  xAvailable: boolean;
  discordAvailable: boolean;
  isUnbinding: boolean;
};

// Vite retains context identity across HMR without retaining OAuth state.
export const OAuthContext: Context<OAuthContextValue | undefined> =
  import.meta.hot?.data.context ??
  createContext<OAuthContextValue | undefined>(undefined);
if (import.meta.hot) import.meta.hot.data.context = OAuthContext;

export const OAuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useAppRouter();
  const { t } = useTranslation();
  const { startPath } = useLocalPreferences();
  const userManager = useUser();
  const { startAsyncTransactionLoading } = useLoading();

  const registerViaGoogleMutator = useRegisterViaGoogle();
  const loginViaGoogleMutator = useLoginViaGoogle();
  const bindGoogleAccountMutator = useBindGoogleAccount();
  const registerViaGithubMutator = useRegisterViaGithub();
  const loginViaGithubMutator = useLoginViaGithub();
  const bindGithubAccountMutator = useBindGithubAccount();
  const registerViaXMutator = useRegisterViaX();
  const registerViaDiscordMutator = useRegisterViaDiscord();
  const loginViaXMutator = useLoginViaX();
  const loginViaDiscordMutator = useLoginViaDiscord();
  const bindXAccountMutator = useBindXAccount();
  const bindDiscordAccountMutator = useBindDiscordAccount();

  const lastCallback = useRef<{
    provider: string;
    state: string | null;
  } | null>(null);

  const prepareOAuthOperationMutator = usePrepareOAuthOperation();
  const unbindGoogleMutator = useUnbindGoogleAccount();
  const unbindGithubMutator = useUnbindGithubAccount();
  const unbindXMutator = useUnbindXAccount();
  const unbindDiscordMutator = useUnbindDiscordAccount();

  const unbind = useCallback(
    async (
      provider: OAuthProviderType,
      body: UnbindGoogleAccountRequest["body"]
    ) => {
      const mutator = {
        google: unbindGoogleMutator,
        github: unbindGithubMutator,
        x: unbindXMutator,
        discord: unbindDiscordMutator,
      }[provider];
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
    [
      unbindGoogleMutator,
      unbindGithubMutator,
      unbindXMutator,
      unbindDiscordMutator,
    ]
  );

  const complete = useCallback(
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
        state?.startsWith(xLoopbackStatePrefix)
      ) {
        const localState = state.slice(xLoopbackStatePrefix.length);
        if (oauthStatePattern.test(localState)) {
          // The dev app uses an IP callback while the verifier and session stay on localhost.
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
            provider !== "x" &&
            provider !== "discord"
          ) {
            throw new NotegicError().setPresentation(
              "workspace.pages.appleRedirectUnavailable"
            );
          }

          const _oauthStateTtlMs = Number.parseInt(
            import.meta.env.VITE_OAUTH_STATE_TTL_MS ?? "",
            10
          );
          const oauthStateTtlMs =
            _oauthStateTtlMs > 0 ? _oauthStateTtlMs : 5 * 60 * 1000;

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
            provider === "discord" &&
            searchParams.get("iss") !== "https://discord.com"
          ) {
            throw new NotegicError().setPresentation(
              "workspace.pages.oauthError.restart"
            );
          }

          const { action, codeVerifier } = pending;
          if (action === "binding") {
            const mutator = {
              google: bindGoogleAccountMutator,
              github: bindGithubAccountMutator,
              x: bindXAccountMutator,
              discord: bindDiscordAccountMutator,
            }[provider];
            await mutator.mutateAsync({
              header: getClientRequestHeaders(navigator.userAgent, null),
              body: { authorizationCode: code, state: pending.state },
            });
          } else {
            const turnstileToken = getTurnstileToken();
            if (isTurnstileEnabled() && !turnstileToken) {
              throw new NotegicError().setPresentation(
                "auth.turnstileRequired"
              );
            }
            if (!codeVerifier) {
              throw new NotegicError().setPresentation(
                "workspace.pages.oauthError.restart"
              );
            }

            const mutator = {
              register: {
                google: registerViaGoogleMutator,
                github: registerViaGithubMutator,
                x: registerViaXMutator,
                discord: registerViaDiscordMutator,
              },
              login: {
                google: loginViaGoogleMutator,
                github: loginViaGithubMutator,
                x: loginViaXMutator,
                discord: loginViaDiscordMutator,
              },
            }[action][provider];
            try {
              await mutator.mutateAsync({
                header: getClientRequestHeaders(
                  navigator.userAgent,
                  turnstileToken
                ),
                body: { authorizationCode: code, codeVerifier },
              });
            } finally {
              clearTurnstileToken();
            }
            await userManager.fetchUserData();
          }

          setLabel(
            t(
              action === "binding"
                ? "common.loading"
                : "workspace.pages.redirectingToDashboard"
            )
          );
          await router.replace(
            action === "binding"
              ? `${WebURLPathDictionary.app.setting.account}#binding`
              : startPath
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
      startPath,
      t,
      userManager,
      bindGoogleAccountMutator,
      bindGithubAccountMutator,
      bindXAccountMutator,
      bindDiscordAccountMutator,
      loginViaGoogleMutator,
      loginViaGithubMutator,
      loginViaXMutator,
      loginViaDiscordMutator,
      registerViaGoogleMutator,
      registerViaGithubMutator,
      registerViaXMutator,
      registerViaDiscordMutator,
      startAsyncTransactionLoading,
    ]
  );

  const perform = async (
    provider: OAuthProviderType,
    action: OAuthAction,
    operation?: { state: string; codeChallenge: string }
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
        const { clientId, redirectURL } = {
          github: {
            clientId: import.meta.env.VITE_OAUTH_GITHUB_CLIENT_ID,
            redirectURL: import.meta.env.VITE_OAUTH_GITHUB_REDIRECT_URL,
          },
          x: {
            clientId: import.meta.env.VITE_OAUTH_X_CLIENT_ID,
            redirectURL: import.meta.env.VITE_OAUTH_X_REDIRECT_URL,
          },
          discord: {
            clientId: import.meta.env.VITE_OAUTH_DISCORD_CLIENT_ID,
            redirectURL: import.meta.env.VITE_OAUTH_DISCORD_REDIRECT_URL,
          },
        }[provider];
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
          state: useLocalXCallback ? xLoopbackStatePrefix + state : state,
          code_challenge: codeChallenge,
          code_challenge_method: "S256",
        });
        if (provider === "github") {
          params.set("scope", "user:email");
          params.set("prompt", "select_account");
          authorizeURL = WebURLPathDictionary.oauth.github(params.toString());
        } else {
          params.set("response_type", "code");
          params.set(
            "scope",
            provider === "discord"
              ? "identify email"
              : "tweet.read users.read users.email"
          );
          authorizeURL = WebURLPathDictionary.oauth[provider](
            params.toString()
          );
        }
      } else {
        authorizeURL = WebURLPathDictionary.oauth.google(
          new URLSearchParams({
            client_id: import.meta.env.VITE_OAUTH_GOOGLE_CLIENT_ID,
            redirect_uri: import.meta.env.VITE_OAUTH_GOOGLE_REDIRECT_URL,
            access_type: "offline",
            response_type: "code",
            prompt: "select_account consent",
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
        perform,
        complete,
        unbind,
        prepare: body =>
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
        discordAvailable: Boolean(
          import.meta.env.VITE_OAUTH_DISCORD_CLIENT_ID &&
            import.meta.env.VITE_OAUTH_DISCORD_REDIRECT_URL
        ),
        isUnbinding:
          unbindGoogleMutator.isPending ||
          unbindGithubMutator.isPending ||
          unbindXMutator.isPending ||
          unbindDiscordMutator.isPending,
      }}
    >
      {children}
    </OAuthContext.Provider>
  );
};
