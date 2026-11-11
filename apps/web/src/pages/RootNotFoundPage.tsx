import { usePageTitle } from "@/hooks/usePageTitle";
import { useTranslation } from "@/hooks/useTranslation";
import { pageTitle } from "@/seo/pageTitle";

export function RootNotFoundPage() {
  usePageTitle(pageTitle("Not Found"));

  const { t } = useTranslation();
  return (
    <div className="w-full min-h-screen flex justify-center items-center">
      <div className="text-center">{t("workspace.pages.notFound")}</div>
    </div>
  );
}
