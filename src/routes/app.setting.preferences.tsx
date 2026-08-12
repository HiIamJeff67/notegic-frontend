import { createFileRoute } from "@tanstack/react-router";
import PreferencesPage from "@/pages/app/setting/preferences/PreferencesPage";

export const Route = createFileRoute("/app/setting/preferences")({
  component: PreferencesPage,
});
