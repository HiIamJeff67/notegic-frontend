import { createFileRoute } from "@tanstack/react-router";
import AccountSettingsPage from "@/pages/app/setting/account/AccountSettingsPage";
import { pageTitle } from "@/seo/pageTitle";

export const Route = createFileRoute("/app/setting/account")({
  head: () => ({
    meta: [{ title: pageTitle("Account") }],
  }),
  component: AccountSettingsPage,
});
