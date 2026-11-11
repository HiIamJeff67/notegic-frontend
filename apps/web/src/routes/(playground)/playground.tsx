import { createFileRoute } from "@tanstack/react-router";
import PlaygroundPage from "@/pages/(playground)/PlaygroundPage";
import { createPrivatePageHead } from "@/seo/publicPage";

export const Route = createFileRoute("/(playground)/playground")({
  head: () => createPrivatePageHead(),
  component: PlaygroundPage,
});
