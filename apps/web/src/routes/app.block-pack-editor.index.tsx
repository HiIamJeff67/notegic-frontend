import { createFileRoute } from "@tanstack/react-router";
import BlockPackEditorIndexPage from "@/pages/app/block-pack-editor/BlockPackEditorIndexPage";

export const Route = createFileRoute("/app/block-pack-editor/")({
  component: BlockPackEditorIndexPage,
});
