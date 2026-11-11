import { createFileRoute } from "@tanstack/react-router";
import EulaPage from "@/pages/eula/EulaPage";
import { createPublicPageHead } from "@/seo/publicPage";

export const Route = createFileRoute("/eula")({
  head: () => createPublicPageHead("/eula"),
  component: EulaPage,
});
