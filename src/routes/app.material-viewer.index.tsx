import { createFileRoute } from "@tanstack/react-router";
import MaterialViewerIndexPage from "@/pages/app/material-viewer/MaterialViewerIndexPage";

export const Route = createFileRoute("/app/material-viewer/")({
  component: MaterialViewerIndexPage,
});
