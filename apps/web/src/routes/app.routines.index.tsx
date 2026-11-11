import { createFileRoute } from "@tanstack/react-router";
import RoutinesIndexPage from "@/pages/app/routines/RoutinesIndexPage";
import { pageTitle } from "@/seo/pageTitle";

export const Route = createFileRoute("/app/routines/")({
  ssr: false,
  head: () => ({
    meta: [{ title: pageTitle("Routines Overview") }],
  }),
  component: RoutinesIndexPage,
});
