import { createFileRoute } from "@tanstack/react-router";
import TutorialPage from "@/pages/tutorial/TutorialPage";

export const Route = createFileRoute("/tutorial")({
  component: TutorialPage,
});
