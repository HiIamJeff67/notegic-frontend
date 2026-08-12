import { createFileRoute, Outlet } from "@tanstack/react-router";
import MaterialViewerNotFoundPage from "@/pages/app/material-viewer/MaterialViewerNotFoundPage";

export const Route = createFileRoute("/app/material-viewer")({
  component: MaterialViewerRouteLayout,
  notFoundComponent: () => <MaterialViewerNotFoundPage />,
});

function MaterialViewerRouteLayout() {
  return <Outlet />;
}
