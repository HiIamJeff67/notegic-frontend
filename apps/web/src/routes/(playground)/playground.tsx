import { createFileRoute } from "@tanstack/react-router";
import PlaygroundPage from "@/pages/(playground)/PlaygroundPage";
import { pageTitle } from "@/seo/pageTitle";
import { createPrivatePageHead } from "@/seo/publicPage";

export const Route = createFileRoute("/(playground)/playground")({
  head: () => ({
    meta: [{ title: pageTitle("Playground") }, ...createPrivatePageHead().meta],
  }),
  component: PlaygroundPage,
});
