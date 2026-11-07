import { createFileRoute } from "@tanstack/react-router";
import OAuthRedirectPage from "@/pages/auth/redirect/OAuthRedirectPage";

export const Route = createFileRoute("/_auth/redirect/x")({
  component: () => <OAuthRedirectPage provider="x" />,
});
