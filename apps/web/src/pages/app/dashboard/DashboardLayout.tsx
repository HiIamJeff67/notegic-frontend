import React, { Suspense } from "react";
import LoadingCover from "@/components/covers/LoadingCover/LoadingCover";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { useTranslation } from "@/hooks/useTranslation";
import { WidgetProvider } from "@/providers/WidgetProvider";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation();
  const sidebarManager = useSidebar();

  return (
    <div className="relative z-0 h-full">
      <Suspense fallback={<LoadingCover />}>
        {sidebarManager.isMobile && (
          <SidebarTrigger
            className="app-sidebar-trigger fixed top-2 left-2 z-[60] border text-white shadow-none transition-colors hover:bg-accent hover:text-white"
            aria-label={t("common.sidebarHint")}
            title={t("common.sidebarHint")}
          />
        )}
        <WidgetProvider>{children}</WidgetProvider>
      </Suspense>
    </div>
  );
};

export default DashboardLayout;
