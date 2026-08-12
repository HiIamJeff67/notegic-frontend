import { createFileRoute, Outlet } from "@tanstack/react-router";
import BlockPackEditorNotFoundPage from "@/pages/app/block-pack-editor/BlockPackEditorNotFoundPage";

export const Route = createFileRoute("/app/block-pack-editor")({
  component: BlockPackEditorRouteLayout,
  notFoundComponent: () => <BlockPackEditorNotFoundPage />,
});

function BlockPackEditorRouteLayout() {
  return <Outlet />;
}
