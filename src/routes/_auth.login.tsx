import { fetchGetUserData } from "@shared/api/fetches/user.fetch";
import { createFileRoute, redirect } from "@tanstack/react-router";
import LoginPage from "@/pages/auth/LoginPage";

export const Route = createFileRoute("/_auth/login")({
  loader: async () => {
    try {
      const response = await fetchGetUserData({}); // try to get the user on SSR
      if (response && response.success) {
        throw redirect({ to: "/app/dashboard", replace: true });
      }
      return {};
    } catch (error) {
      // if the current user is not exist, return an empty object to the login page
      return {};
    }
  },
  component: LoginPage,
});
