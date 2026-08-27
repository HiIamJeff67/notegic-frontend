import { fetchGetUserData } from "@/api/fetches/user.fetch";
import { HasAuthCookies } from "@/api/functions/auth.serverFn";
import { createFileRoute, isRedirect, redirect } from "@tanstack/react-router";
import LoginPage from "@/pages/auth/LoginPage";

export const Route = createFileRoute("/_auth/login")({
  loader: async () => {
    try {
      if (!(await HasAuthCookies())) return {};

      const response = await fetchGetUserData({}, undefined, { staleTime: 0 }); // try to get the user on SSR
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
