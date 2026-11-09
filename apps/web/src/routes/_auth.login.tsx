import { createFileRoute, isRedirect, redirect } from "@tanstack/react-router";
import { getClientRequestHeaders } from "@/api/clientHeaders";
import { fetchGetUserData } from "@/api/fetches/user.fetch";
import { HasAuthCookies } from "@/api/functions/auth.serverFn";
import LoginPage from "@/pages/auth/LoginPage";

export const Route = createFileRoute("/_auth/login")({
  validateSearch: search => ({
    oauthFailed: search.oauthFailed === true ? true : undefined,
  }),
  loaderDeps: ({ search }) => ({ oauthFailed: search.oauthFailed }),
  loader: async ({ deps }) => {
    if (deps.oauthFailed) return {};

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
        throw redirect({ to: "/app/dashboard", replace: true });
      }
      return {};
    } catch (error) {
      if (isRedirect(error)) throw error;

      // if the current user is not exist, return an empty object to the login page
      return {};
    }
  },
  component: LoginPage,
});
