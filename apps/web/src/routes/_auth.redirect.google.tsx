import { createFileRoute } from "@tanstack/react-router";
import GoogleRedirectPage from "@/pages/auth/redirect/GoogleRedirectPage";

export const Route = createFileRoute("/_auth/redirect/google")({
  component: GoogleRedirectPage,
});
