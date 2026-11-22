import { createFileRoute, isRedirect, redirect } from "@tanstack/react-router";
import { fetchGetUserData } from "@/api/fetches/user.fetch";
import { HasAuthCookies } from "@/api/functions/auth.serverFn";
import { getClientRequestHeaders } from "@/api/functions/headers/clientHeaders";
import { readNativeAuthorizationRequest } from "@/api/tokens/nativeAuthorization";
import LoginPage from "@/pages/auth/LoginPage";
import { pageTitle } from "@/seo/pageTitle";

export const Route = createFileRoute("/_auth/login")({
  validateSearch: (
    search: Record<string, unknown>
  ): { oauthFailed?: true; switchAccount?: true } => {
    const validated: { oauthFailed?: true; switchAccount?: true } = {};
    if (search.oauthFailed === true) validated.oauthFailed = true;
    if (search.switchAccount === true) validated.switchAccount = true;
    return validated;
  },
  loaderDeps: ({ search }) => ({
    oauthFailed: search.oauthFailed,
    switchAccount: search.switchAccount,
  }),
  loader: async ({ deps }) => {
    if (deps.oauthFailed || deps.switchAccount) return {};

    try {
      if (!(await HasAuthCookies())) return {};

      const response = await fetchGetUserData(
        typeof window === "undefined"
          ? {}
          : { header: getClientRequestHeaders() },
        undefined,
        { staleTime: 0 }
      );
      if (response && response.success) {
        throw redirect({
          to: readNativeAuthorizationRequest()
            ? "/native/authorize"
            : "/app/dashboard",
          replace: true,
        });
      }
      return {};
    } catch (error) {
      if (isRedirect(error)) throw error;

      // if the current user is not exist, return an empty object to the login page
      return {};
    }
  },
  head: () => ({
    meta: [{ title: pageTitle("Login") }],
  }),
  component: LoginPage,
});
