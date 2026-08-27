import React from "react";
import ResizableSidebarInset from "@/components/sidebar/ResizableSidebar/ResizableSidebarInset";

interface AppSidebarInsetProps {
  children: React.ReactNode;
}

const AppSidebarInset = ({ children }: AppSidebarInsetProps) => {
  return (
    <ResizableSidebarInset className="h-dvh min-w-0 min-h-0 overflow-hidden">
      {children}
    </ResizableSidebarInset>
  );
};

export default AppSidebarInset;
