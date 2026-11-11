import { createFileRoute } from "@tanstack/react-router";
import ForgetPasswordPage from "@/pages/auth/ForgetPasswordPage";
import { pageTitle } from "@/seo/pageTitle";

export const Route = createFileRoute("/_auth/forgetPassword")({
  head: () => ({
    meta: [{ title: pageTitle("Forgot Password") }],
  }),
  component: ForgetPasswordPage,
});
