import { createFileRoute } from "@tanstack/react-router";
import DataDeletionPage from "@/pages/data-deletion/DataDeletionPage";
import { createPublicPageHead } from "@/seo/publicPage";

export const Route = createFileRoute("/data-deletion")({
  head: () => createPublicPageHead("/data-deletion"),
  component: DataDeletionPage,
});
