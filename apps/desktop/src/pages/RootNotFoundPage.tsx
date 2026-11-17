import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export function RootNotFoundPage() {
  const { t } = useTranslation();

  return (
    <main className="flex min-h-svh min-w-0 items-center justify-center p-6">
      <Link to="/app/dashboard" className="text-sm underline">
        {t("workspace.navigation.dashboard")}
      </Link>
    </main>
  );
}
