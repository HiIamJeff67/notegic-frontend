import { createFileRoute } from "@tanstack/react-router";
import DocumentPage from "@/pages/document/DocumentPage";

export const Route = createFileRoute("/document")({
  component: DocumentPage,
});
