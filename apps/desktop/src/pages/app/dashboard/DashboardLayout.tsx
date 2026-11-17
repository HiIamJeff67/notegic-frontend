import { SidebarTrigger, useSidebar } from "@shared/components/shadcn/sidebar";
import type { ReactNode } from "react";
import { useTranslation } from "@shared/hooks/useTranslation";
import { WidgetProvider } from "../../../providers/WidgetProvider";

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslation();
  const sidebarManager = useSidebar();

  return (
    <div className="relative z-0 h-full min-h-0 min-w-0 overflow-hidden">
      {sidebarManager.isMobile && (
        <SidebarTrigger
          className="app-sidebar-trigger fixed top-2 left-2 z-[60] border text-white shadow-none transition-colors hover:bg-accent hover:text-white"
          aria-label={t("common.sidebarHint")}
          title={t("common.sidebarHint")}
        />
      )}
      {children && <WidgetProvider>{children}</WidgetProvider>}
    </div>
  );
};

export default DashboardLayout;
