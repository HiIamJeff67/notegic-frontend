import { createFileRoute } from "@tanstack/react-router";
import ContactPage from "@/pages/contact/ContactPage";
import { createPublicPageHead } from "@/seo/publicPage";

export const Route = createFileRoute("/contact")({
  head: () => createPublicPageHead("/contact"),
  component: ContactPage,
});
