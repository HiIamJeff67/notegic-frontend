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
import { createContext, useCallback, useState, type ReactNode } from "react";
import {
  getClientMutationHeaders,
  getClientRequestHeaders,
} from "@/api/clientHeaders";
import {
  useLoginViaGoogle,
  useRegisterViaGoogle,
  useLoginViaGithub,
  useLoginViaMeta,
  useRegisterViaMeta,
  useRegisterViaGithub,
} from "@/api/hooks/auth.hook";
import {
  useBindGoogleAccount,
  useBindGithubAccount,
  useBindMetaAccount,
  useUnbindGithubAccount,
  useUnbindMetaAccount,
} from "@/api/hooks/userAccount.hook";
import {
  clearTurnstileToken,
  getTurnstileToken,
  isTurnstileEnabled,
} from "@/api/turnstile";
import { useAppRouter, useUser } from "@/hooks";
import { useLocalPreferences } from "@/hooks/useLocalPreferences";
import { useTranslation } from "@/hooks/useTranslation";
import { getPreferredStartPath } from "@/providers/LocalPreferencesProvider";

const configuredOAuthStateTtlMs = Number.parseInt(
  import.meta.env.VITE_OAUTH_STATE_TTL_MS ?? "",
  10
);
const oauthStateTtlMs =
  configuredOAuthStateTtlMs > 0 ? configuredOAuthStateTtlMs : 5 * 60 * 1000;

export type OAuthProviderName = "google" | "github" | "meta";

type OAuthContextValue = {
  beginOAuth: (
    provider: OAuthProviderName,
    action: OAuthAction
  ) => Promise<void>;
  completeOAuth: (provider: string, search: string) => Promise<void>;
  unbindOAuth: (provider: "github" | "meta", authCode: string) => Promise<void>;
  githubAvailable: boolean;
  metaAvailable: boolean;
  isUnbinding: boolean;
  loadingPhase: "validating" | "redirecting";
  returnToHome: () => void;
};

export const OAuthContext = createContext<OAuthContextValue | undefined>(
  undefined
);

export const OAuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useAppRouter();
  const { t } = useTranslation();
  const { preferences } = useLocalPreferences();
  const userManager = useUser();

  const registerViaGoogleMutator = useRegisterViaGoogle();
  const loginViaGoogleMutator = useLoginViaGoogle();
  const bindGoogleAccountMutator = useBindGoogleAccount();
  const registerViaGithubMutator = useRegisterViaGithub();
  const loginViaGithubMutator = useLoginViaGithub();
  const bindGithubAccountMutator = useBindGithubAccount();
  const loginViaMetaMutator = useLoginViaMeta();
  const registerViaMetaMutator = useRegisterViaMeta();
  const bindMetaAccountMutator = useBindMetaAccount();
  const [loadingPhase, setLoadingPhase] = useState<
    "validating" | "redirecting"
  >("validating");

  const unbindGithubMutator = useUnbindGithubAccount();
  const unbindMetaMutator = useUnbindMetaAccount();
  const metaAvailable = Boolean(
    import.meta.env.VITE_OAUTH_META_CLIENT_ID &&
      import.meta.env.VITE_OAUTH_META_REDIRECT_URL
  );

  const performOAuthAction = useCallback(
    async (
      provider: OAuthProviderName,
      action: OAuthAction,
      code: string,
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
            if (provider === "github") {
              await registerViaGithubMutator.mutateAsync({
                header,
                body: { authorizationCode: code, codeVerifier: codeVerifier! },
              });
            } else if (provider === "meta") {
              await registerViaMetaMutator.mutateAsync({
                header,
                body: { authorizationCode: code },
              });
            } else {
              await registerViaGoogleMutator.mutateAsync({
                header,
                body: { authorizationCode: code },
              });
            }
            return;
          }
          case "login": {
            if (provider === "github") {
              await loginViaGithubMutator.mutateAsync({
                header,
                body: { authorizationCode: code, codeVerifier: codeVerifier! },
              });
            } else if (provider === "meta") {
              await loginViaMetaMutator.mutateAsync({
                header,
                body: { authorizationCode: code },
              });
            } else {
              await loginViaGoogleMutator.mutateAsync({
                header,
                body: { authorizationCode: code },
              });
            }
            return;
          }
          case "binding": {
            if (provider === "github") {
              await bindGithubAccountMutator.mutateAsync({
                header,
                body: { authorizationCode: code, codeVerifier: codeVerifier! },
              });
            } else if (provider === "meta") {
              await bindMetaAccountMutator.mutateAsync({
                header,
                body: { authorizationCode: code },
              });
            } else {
              await bindGoogleAccountMutator.mutateAsync({
                header,
                body: { authorizationCode: code },
              });
            }
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
      loginViaGithubMutator,
      registerViaGithubMutator,
      bindMetaAccountMutator,
      loginViaMetaMutator,
      registerViaMetaMutator,
    ]
  );

  const completeOAuth = useCallback(
    async (provider: string, search: string) => {
      setLoadingPhase("validating");
      const searchParams = new URLSearchParams(search);
      const code = searchParams.get("code");
      const error = searchParams.get("error");
      const state = searchParams.get("state");

      const now = Date.now();
      const pending: unknown = SessionStorage.getItemByKey(
        SessionStorageKey.pendingOAuthState
      );
      SessionStorage.removeItem(SessionStorageKey.pendingOAuthState);

      if (
        provider !== "google" &&
        provider !== "github" &&
        provider !== "meta"
      ) {
        router.push(
          WebURLPathDictionary.auth.redirect.error(
            t("workspace.pages.redirectError"),
            provider === "apple"
              ? t("workspace.pages.appleRedirectUnavailable")
              : t("workspace.pages.xRedirectUnavailable")
          )
        );
        return;
      }

      if (
        !isPendingOAuthState(pending) ||
        (pending.provider ?? "google") !== provider ||
        state === null ||
        !oauthStatePattern.test(state) ||
        state !== pending.state ||
        pending.createdAt > now ||
        now - pending.createdAt > oauthStateTtlMs
      ) {
        toast.error(
          t(
            provider === "github"
              ? "workspace.notifications.githubAuthError"
              : provider === "meta"
                ? "workspace.notifications.metaAuthError"
                : "workspace.notifications.googleAuthError",
            {
              error: t("error.encounterUnknownError"),
            }
          )
        );
        router.push(
          WebURLPathDictionary.auth.redirect.error(
            t(
              provider === "github"
                ? "workspace.pages.githubRedirectFailed"
                : provider === "meta"
                  ? "workspace.pages.metaRedirectFailed"
                  : "workspace.pages.googleRedirectFailed"
            ),
            t("error.encounterUnknownError")
          )
        );
        return;
      }

      try {
        const { action } = pending;

        if (error !== null) {
          toast.error(
            t(
              provider === "github"
                ? "workspace.notifications.githubAuthError"
                : provider === "meta"
                  ? "workspace.notifications.metaAuthError"
                  : "workspace.notifications.googleAuthError",
              {
                error: error,
              }
            )
          );
          router.push(
            WebURLPathDictionary.auth.redirect.error(
              t(
                provider === "github"
                  ? "workspace.pages.githubAuthFailed"
                  : provider === "meta"
                    ? "workspace.pages.metaAuthFailed"
                    : "workspace.pages.googleAuthFailed"
              ),
              tError(error, t)
            )
          );
          return;
        }

        if (code === null) {
          throw new Error("error.encounterUnknownError");
        }

        const turnstileEnabled = isTurnstileEnabled();
        const turnstileToken = getTurnstileToken();
        if (action !== "binding" && turnstileEnabled && !turnstileToken) {
          throw new Error("auth.turnstileRequired");
        }

        await performOAuthAction(provider, action, code, pending.codeVerifier);
        await userManager.fetchUserData();

        setLoadingPhase("redirecting");
        router.push(getPreferredStartPath(preferences));
      } catch (error) {
        toast.error(tError(error, t));
        router.push(
          WebURLPathDictionary.auth.redirect.error(
            t(
              provider === "github"
                ? "workspace.pages.githubRedirectFailed"
                : provider === "meta"
                  ? "workspace.pages.metaRedirectFailed"
                  : "workspace.pages.googleRedirectFailed"
            ),
            tError(error, t)
          )
        );
      }
    },
    [router, preferences, t, userManager, performOAuthAction]
  );

  const beginOAuth = async (
    provider: OAuthProviderName,
    action: OAuthAction
  ) => {
    try {
      if (provider === "meta" && !metaAvailable) {
        throw new Error("error.encounterUnknownError");
      }
      if (
        action !== "binding" &&
        isTurnstileEnabled() &&
        !getTurnstileToken()
      ) {
        throw new Error("auth.turnstileRequired");
      }
      const random = crypto.getRandomValues(new Uint8Array(64));
      const state = Array.from(random.slice(0, 32), byte =>
        byte.toString(16).padStart(2, "0")
      ).join("");
      const pending: PendingOAuthState = {
        provider,
        state,
        action,
        createdAt: Date.now(),
      };
      let authorizeURL: string;
      if (provider === "github") {
        if (
          !import.meta.env.VITE_OAUTH_GITHUB_CLIENT_ID ||
          !import.meta.env.VITE_OAUTH_GITHUB_REDIRECT_URL
        ) {
          throw new Error("error.encounterUnknownError");
        }
        pending.codeVerifier = Array.from(random.slice(32), byte =>
          byte.toString(16).padStart(2, "0")
        ).join("");
        const digest = await crypto.subtle.digest(
          "SHA-256",
          new TextEncoder().encode(pending.codeVerifier)
        );
        const codeChallenge = btoa(
          String.fromCharCode(...new Uint8Array(digest))
        )
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/=+$/, "");
        authorizeURL = WebURLPathDictionary.oauth.github(
          new URLSearchParams({
            client_id: import.meta.env.VITE_OAUTH_GITHUB_CLIENT_ID,
            redirect_uri: import.meta.env.VITE_OAUTH_GITHUB_REDIRECT_URL,
            scope: "user:email",
            state,
            code_challenge: codeChallenge,
            code_challenge_method: "S256",
          }).toString()
        );
      } else if (provider === "meta") {
        authorizeURL = WebURLPathDictionary.oauth.meta(
          new URLSearchParams({
            client_id: import.meta.env.VITE_OAUTH_META_CLIENT_ID,
            redirect_uri: import.meta.env.VITE_OAUTH_META_REDIRECT_URL,
            response_type: "code",
            scope: "public_profile,email",
            state,
          }).toString()
        );
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
          }).toString()
        );
      }
      if (
        !SessionStorage.setItem(SessionStorageKey.pendingOAuthState, pending)
      ) {
        throw new Error("error.encounterUnknownError");
      }
      router.forceNavigate(authorizeURL);
    } catch (error) {
      toast.error(tError(error, t));
    }
  };

  const unbindOAuth = async (provider: "github" | "meta", authCode: string) => {
    const mutator =
      provider === "github" ? unbindGithubMutator : unbindMetaMutator;
    await mutator.mutateAsync({
      header: getClientMutationHeaders(navigator.userAgent),
      body: { authCode },
    });
  };

  return (
    <OAuthContext.Provider
      value={{
        beginOAuth,
        completeOAuth,
        unbindOAuth,
        githubAvailable: Boolean(
          import.meta.env.VITE_OAUTH_GITHUB_CLIENT_ID &&
            import.meta.env.VITE_OAUTH_GITHUB_REDIRECT_URL
        ),
        metaAvailable,
        isUnbinding:
          unbindGithubMutator.isPending || unbindMetaMutator.isPending,
        loadingPhase,
        returnToHome: () => router.push(WebURLPathDictionary.home),
      }}
    >
      {children}
    </OAuthContext.Provider>
  );
};
