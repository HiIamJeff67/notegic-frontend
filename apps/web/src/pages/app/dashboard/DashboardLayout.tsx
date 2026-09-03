import React, { Suspense, useEffect, useState } from "react";
import StrictLoadingCover from "@/components/covers/LoadingCover/StrictLoadingCover";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { WidgetProvider } from "@/providers/WidgetProvider";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const sidebarManager = useSidebar();

  return (
    <Suspense fallback={<StrictLoadingCover />}>
      {sidebarManager.isMobile && (
        <SidebarTrigger className="fixed top-2 left-2 z-50" />
      )}
      <WidgetProvider>{children}</WidgetProvider>
    </Suspense>
  );
};

export default DashboardLayout;
