import { createFileRoute, notFound } from "@tanstack/react-router";
import { RootNotFoundPage } from "@/pages/RootNotFoundPage";
import { pageTitle } from "@/seo/pageTitle";
import { createPrivatePageHead } from "@/seo/publicPage";

export const Route = createFileRoute("/$")({
  beforeLoad: () => {
    throw notFound();
  },
  head: () => ({
    meta: [{ title: pageTitle("Not Found") }, ...createPrivatePageHead().meta],
  }),
  notFoundComponent: RootNotFoundPage,
});
