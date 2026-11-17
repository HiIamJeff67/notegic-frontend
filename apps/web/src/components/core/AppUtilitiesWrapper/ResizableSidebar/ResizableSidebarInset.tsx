import { SidebarInset, useSidebar } from "@shared/components/shadcn/sidebar";
import React from "react";
import { useResizeSidebar } from "@/hooks";

interface AppSidebarInsetProps {
  className?: string;
  children?: React.ReactNode;
}

const ResizableSidebarInset = ({
  className,
  children,
}: AppSidebarInsetProps) => {
  const sidebarManager = useSidebar();
  const { insetStyle } = useResizeSidebar();

  return (
    <SidebarInset
      className={className}
      style={{
        transition: sidebarManager.isMobile ? undefined : "padding-left 0.2s",
        ...(sidebarManager.open && !sidebarManager.isMobile && insetStyle),
      }}
    >
      {children}
    </SidebarInset>
  );
};

export default ResizableSidebarInset;
