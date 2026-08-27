import { createFileRoute } from "@tanstack/react-router";
import ForgetPasswordPage from "@/pages/auth/ForgetPasswordPage";

export const Route = createFileRoute("/_auth/forgetPassword")({
  component: ForgetPasswordPage,
});
