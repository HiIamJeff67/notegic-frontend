import { createFileRoute } from "@tanstack/react-router";
import { AuthLayout } from "@/pages/auth/AuthLayout";
import { createPrivatePageHead } from "@/seo/publicPage";

export const Route = createFileRoute("/_auth")({
  head: () => createPrivatePageHead(),
  component: AuthLayout,
});
