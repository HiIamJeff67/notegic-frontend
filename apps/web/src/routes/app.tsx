import { createFileRoute } from "@tanstack/react-router";
import AppLayout from "@/pages/app/AppLayout";
import { createPrivatePageHead } from "@/seo/publicPage";

export const Route = createFileRoute("/app")({
  head: () => createPrivatePageHead(),
  component: AppLayout,
});
