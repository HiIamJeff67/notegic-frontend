import { createFileRoute, notFound } from "@tanstack/react-router";
import SettingsPlaygroundPage from "@/pages/playground/SettingsPlaygroundPage";

export const Route = createFileRoute("/playground")({
  ssr: false,
  beforeLoad: () => {
    if (!import.meta.env.DEV) throw notFound();
  },
  component: SettingsPlaygroundPage,
});
