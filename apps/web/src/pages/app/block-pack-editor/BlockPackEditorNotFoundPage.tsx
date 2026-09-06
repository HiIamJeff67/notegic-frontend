import type { UUID } from "crypto";
import { useTranslation } from "react-i18next";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";

const BlockPackEditorNotFoundPage = ({ id }: { id?: UUID }) => {
  const { t } = useTranslation();
  const sidebarManager = useSidebar();
  const notFoundMessage = id
    ? t("workspace.pages.blockPackIdNotFound", { id })
    : t("workspace.pages.blockPackNotFound");
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
      {notFoundMessage}
    </div>
  );
};

export default BlockPackEditorNotFoundPage;
