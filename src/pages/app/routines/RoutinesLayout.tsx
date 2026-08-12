import React, { Suspense } from "react";
import StrictLoadingCover from "@/components/covers/LoadingCover/StrictLoadingCover";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";

const RoutinesLayout = ({ children }: { children: React.ReactNode }) => {
  const sidebarManager = useSidebar();

  return (
    <Suspense fallback={<StrictLoadingCover />}>
      {sidebarManager.isMobile && <SidebarTrigger className="fixed m-2" />}
      {children}
    </Suspense>
  );
};

export default RoutinesLayout;
