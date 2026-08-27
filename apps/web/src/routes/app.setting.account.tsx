import { createFileRoute } from "@tanstack/react-router";
import AccountSettingsPage from "@/pages/app/setting/account/AccountSettingsPage";

export const Route = createFileRoute("/app/setting/account")({
  component: AccountSettingsPage,
});
