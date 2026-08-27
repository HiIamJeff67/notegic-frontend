import { createFileRoute } from "@tanstack/react-router";
import RoutinesIndexPage from "@/pages/app/routines/RoutinesIndexPage";

export const Route = createFileRoute("/app/routines/")({
  ssr: false,
  component: RoutinesIndexPage,
});
