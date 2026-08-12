import { createFileRoute } from "@tanstack/react-router";
import AppLayout from "@/pages/app/AppLayout";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});
