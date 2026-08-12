import { createFileRoute } from "@tanstack/react-router";
import PrivacyPolicyPage from "@/pages/privacy-policy/PrivacyPolicyPage";

export const Route = createFileRoute("/privacy-policy")({
  component: PrivacyPolicyPage,
});
