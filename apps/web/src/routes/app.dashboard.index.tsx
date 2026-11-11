import { createFileRoute } from "@tanstack/react-router";
import DashboardPage from "@/pages/app/dashboard/DashboardPage";
import { pageTitle } from "@/seo/pageTitle";

export const Route = createFileRoute("/app/dashboard/")({
  head: () => ({
    meta: [{ title: pageTitle("Dashboard") }],
  }),
  component: DashboardPage,
});
