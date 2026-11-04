import { useTranslation } from "@/hooks/useTranslation";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";

const MaterialViewerNotFoundPage = () => {
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
      {t("workspace.pages.materialNotFound")}
    </div>
  );
};

export default MaterialViewerNotFoundPage;
