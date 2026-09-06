import React, { Suspense, useEffect, useState } from "react";
import StrictLoadingCover from "@/components/covers/LoadingCover/StrictLoadingCover";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { WidgetProvider } from "@/providers/WidgetProvider";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const sidebarManager = useSidebar();

  return (
    <div className="relative z-0 h-full">
      <Suspense fallback={<StrictLoadingCover />}>
        {sidebarManager.isMobile && (
          <SidebarTrigger className="fixed top-2 left-2 z-[60] border-none bg-transparent" />
        )}
        <WidgetProvider>{children}</WidgetProvider>
      </Suspense>
    </div>
  );
};

export default DashboardLayout;
