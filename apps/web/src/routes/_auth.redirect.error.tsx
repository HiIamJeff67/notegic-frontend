import { createFileRoute } from "@tanstack/react-router";
import RedirectErrorPage from "@/pages/auth/redirect/RedirectErrorPage";

export const Route = createFileRoute("/_auth/redirect/error")({
  component: RedirectErrorPage,
});
