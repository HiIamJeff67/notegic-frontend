import { createFileRoute } from "@tanstack/react-router";
import EulaPage from "@/pages/eula/EulaPage";

export const Route = createFileRoute("/eula")({
  component: EulaPage,
});
