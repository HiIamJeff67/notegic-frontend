import { createFileRoute } from "@tanstack/react-router";
import { RootNotFoundPage } from "@/pages/RootNotFoundPage";
import { pageTitle } from "@/seo/pageTitle";
import { createPrivatePageHead } from "@/seo/publicPage";

export const Route = createFileRoute("/$")({
  head: () => ({
    meta: [{ title: pageTitle("Not Found") }, ...createPrivatePageHead().meta],
  }),
  component: RootNotFoundPage,
});
