import type { ReactNode } from "react";
import AppSidebar from "./AppSidebar/AppSidebar";
import AppSidebarInset from "./AppSidebar/AppSidebarInset";

const AppUtilitiesWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-1 overflow-hidden">
      <AppSidebar />
      <AppSidebarInset>{children}</AppSidebarInset>
    </div>
  );
};

export default AppUtilitiesWrapper;
