import { createFileRoute } from "@tanstack/react-router";
import PlaygroundPage from "@/pages/app/playground/PlaygroundPage";

export const Route = createFileRoute("/app/playground")({
  component: PlaygroundPage,
});
