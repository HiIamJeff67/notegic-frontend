import { createFileRoute } from "@tanstack/react-router";
import PrivacyPolicyPage from "@/pages/privacy-policy/PrivacyPolicyPage";
import { createPublicPageHead } from "@/seo/publicPage";

export const Route = createFileRoute("/privacy-policy")({
  head: () => createPublicPageHead("/privacy-policy"),
  component: PrivacyPolicyPage,
});
