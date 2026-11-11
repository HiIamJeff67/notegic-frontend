import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useTranslation } from "@/hooks/useTranslation";
import { pageTitle } from "@/seo/pageTitle";

const BlockPackEditorNotFoundPage = () => {
  usePageTitle(pageTitle("Block Pack Not Found"));

  const { t } = useTranslation();
  const sidebarManager = useSidebar();
  return (
    <div
      className={
        sidebarManager.isMobile
          ? "flex h-full w-full items-center justify-center pt-10"
          : "flex h-full w-full items-center justify-center"
      }
    >
      {sidebarManager.isMobile && (
        <SidebarTrigger className="fixed top-2 left-2 z-40 border-none bg-transparent" />
      )}
      {t("workspace.pages.blockPackNotFound")}
    </div>
  );
};

export default BlockPackEditorNotFoundPage;
