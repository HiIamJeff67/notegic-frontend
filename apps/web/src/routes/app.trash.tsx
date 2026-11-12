import { createFileRoute } from "@tanstack/react-router";
import {
  loadTrash,
  readTrashSearch,
  TrashRoute,
} from "@/pages/app/trash/TrashRoute";
import { pageTitle } from "@/seo/pageTitle";

export const Route = createFileRoute("/app/trash")({
  ssr: false,
  head: () => ({
    meta: [{ title: pageTitle("Trash") }],
  }),
  validateSearch: readTrashSearch,
  loaderDeps: ({ search }) => ({ query: search.query }),
  loader: ({ context, deps }) => loadTrash({ context, deps }),
  component: TrashRoute,
});
