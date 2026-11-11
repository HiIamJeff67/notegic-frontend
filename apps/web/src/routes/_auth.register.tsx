import { createFileRoute } from "@tanstack/react-router";
import RegisterPage from "@/pages/auth/RegisterPage";
import { pageTitle } from "@/seo/pageTitle";

export const Route = createFileRoute("/_auth/register")({
  head: () => ({
    meta: [{ title: pageTitle("Register") }],
  }),
  component: RegisterPage,
});
