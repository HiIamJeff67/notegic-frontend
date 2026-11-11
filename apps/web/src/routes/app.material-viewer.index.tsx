import { createFileRoute } from "@tanstack/react-router";
import MaterialViewerIndexPage from "@/pages/app/material-viewer/MaterialViewerIndexPage";
import { pageTitle } from "@/seo/pageTitle";

export const Route = createFileRoute("/app/material-viewer/")({
  head: () => ({
    meta: [{ title: pageTitle("Materials") }],
  }),
  component: MaterialViewerIndexPage,
});
