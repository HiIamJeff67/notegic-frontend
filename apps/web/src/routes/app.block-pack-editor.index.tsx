import { createFileRoute } from "@tanstack/react-router";
import BlockPackEditorIndexPage from "@/pages/app/block-pack-editor/BlockPackEditorIndexPage";
import { pageTitle } from "@/seo/pageTitle";

export const Route = createFileRoute("/app/block-pack-editor/")({
  head: () => ({
    meta: [{ title: pageTitle("Block Packs") }],
  }),
  component: BlockPackEditorIndexPage,
});
