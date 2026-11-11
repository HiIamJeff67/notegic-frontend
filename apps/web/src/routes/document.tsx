import { createFileRoute } from "@tanstack/react-router";
import DocumentPage from "@/pages/document/DocumentPage";
import { createPublicPageHead } from "@/seo/publicPage";

export const Route = createFileRoute("/document")({
  head: () => createPublicPageHead("/document"),
  component: DocumentPage,
});
