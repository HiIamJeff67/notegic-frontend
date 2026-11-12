import { createFileRoute } from "@tanstack/react-router";
import {
  BlockPackEditorIndexRoute,
  loadBlockPackEditor,
} from "@/pages/app/block-pack-editor/BlockPackEditorIndexRoute";
import BlockPackEditorNotFoundPage from "@/pages/app/block-pack-editor/BlockPackEditorNotFoundPage";

export const Route = createFileRoute("/app/block-pack-editor/$blockPackId")({
  ssr: false, // since the blocknote editor view is a client side component
  loader: ({ params }) => loadBlockPackEditor(params.blockPackId),
  component: BlockPackEditorIndexRoute,
  notFoundComponent: () => <BlockPackEditorNotFoundPage />,
});
