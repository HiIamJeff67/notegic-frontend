import { WebURLPathDictionary } from "@shared/constants";
import { useLocation } from "@tanstack/react-router";
import { Suspense, useMemo } from "react";
import { useTranslation } from "react-i18next";
import StrictLoadingCover from "@/components/covers/LoadingCover/StrictLoadingCover";
import { Button } from "@/components/ui/button";
import { useAppRouter } from "@/hooks";

function RedirectErrorPage() {
  const location = useLocation();
  const router = useAppRouter();
  const { t } = useTranslation();
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const title = searchParams.get("title") || t("workspace.pages.redirectError");
  const description =
    searchParams.get("description") || t("workspace.pages.redirectUnknown");

  return (
    <Suspense fallback={<StrictLoadingCover />}>
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-red-500">{title}</h1>
        <p className="text-gray-600">{description}</p>
        <div className="flex justify-center items-center gap-4">
          <Button variant="outline" onClick={() => {}}>
            {t("workspace.pages.contactUs")}
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(WebURLPathDictionary.home)}
          >
            {t("workspace.pages.goBack")}
          </Button>
        </div>
      </div>
    </Suspense>
  );
}

export default RedirectErrorPage;
