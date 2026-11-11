import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/pages/home/HomePage";
import { createPublicPageHead } from "@/seo/publicPage";

export const Route = createFileRoute("/")({
  head: () => createPublicPageHead("/"),
  component: HomePage,
});
