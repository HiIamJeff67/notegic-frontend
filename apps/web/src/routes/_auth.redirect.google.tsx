import { createFileRoute } from "@tanstack/react-router";
import OAuthRedirectPage from "@/pages/auth/redirect/OAuthRedirectPage";

export const Route = createFileRoute("/_auth/redirect/google")({
  component: () => <OAuthRedirectPage provider="google" />,
});
