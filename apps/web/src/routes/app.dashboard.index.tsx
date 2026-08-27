import { createFileRoute } from "@tanstack/react-router";
import DashboardPage from "@/pages/app/dashboard/DashboardPage";

export const Route = createFileRoute("/app/dashboard/")({
  component: DashboardPage,
});
