import { createFileRoute } from "@tanstack/react-router";
import PlaygroundPage from "@/pages/playground/PlaygroundPage";

export const Route = createFileRoute("/playground")({
  component: PlaygroundPage,
});
