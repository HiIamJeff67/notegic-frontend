import type { ReactNode } from "react";
import { AppCommandProvider } from "@/providers/AppCommandProvider";
import { ResizeSidebarProvider } from "@/providers/ResizeSidebarProvider";
import AppCommand from "./AppCommand/AppCommand";
import { AppSidebar } from "./AppSidebar/AppSidebar";
import AppSidebarInset from "./AppSidebar/AppSidebarInset";

const AppUtilitiesWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <ResizeSidebarProvider>
      <AppCommandProvider>
        <div className="flex min-h-svh w-full min-w-0 flex-1">
          <AppCommand />
          <AppSidebar />
          <AppSidebarInset>{children}</AppSidebarInset>
        </div>
      </AppCommandProvider>
    </ResizeSidebarProvider>
  );
};

export default AppUtilitiesWrapper;
