import { createFileRoute } from "@tanstack/react-router";
import PreferencesPage from "@/pages/app/setting/preferences/PreferencesPage";
import { pageTitle } from "@/seo/pageTitle";

export const Route = createFileRoute("/app/setting/preferences")({
  head: () => ({
    meta: [{ title: pageTitle("Preferences") }],
  }),
  component: PreferencesPage,
});
