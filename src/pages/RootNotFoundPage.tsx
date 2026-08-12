import { useTranslation } from "react-i18next";

export function RootNotFoundPage() {
  const { t } = useTranslation();
  return (
    <div className="w-full min-h-screen flex justify-center items-center">
      <div className="text-center">{t("workspace.pages.notFound")}</div>
    </div>
  );
}
