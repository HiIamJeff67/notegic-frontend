import { createFileRoute } from "@tanstack/react-router";
import { RootNotFoundPage } from "@/pages/RootNotFoundPage";
import { createPrivatePageHead } from "@/seo/publicPage";

export const Route = createFileRoute("/$")({
  head: () => createPrivatePageHead(),
  component: RootNotFoundPage,
});
