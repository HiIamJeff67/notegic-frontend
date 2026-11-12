import { createFileRoute } from "@tanstack/react-router";
import MaterialViewerNotFoundPage from "@/pages/app/material-viewer/MaterialViewerNotFoundPage";
import {
  loadMaterialViewer,
  MaterialViewerRoute,
  readMaterialViewerSearch,
} from "@/pages/app/material-viewer/MaterialViewerRoute";

export const Route = createFileRoute("/app/material-viewer/$materialId")({
  ssr: false,
  validateSearch: readMaterialViewerSearch,
  loaderDeps: ({ search }) => search,
  loader: ({ params, deps }) =>
    loadMaterialViewer({
      materialId: params.materialId,
      parentSubShelfId: deps.parentSubShelfId,
      rootShelfId: deps.rootShelfId,
    }),
  component: MaterialViewerRoute,
  notFoundComponent: () => <MaterialViewerNotFoundPage />,
});
