import { createFileRoute } from "@tanstack/react-router";
import XRedirectPage from "@/pages/auth/redirect/XRedirectPage";

export const Route = createFileRoute("/_auth/redirect/x")({
  component: XRedirectPage,
});
