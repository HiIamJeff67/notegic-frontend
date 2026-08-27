import React from "react";
import { SidebarInset, useSidebar } from "@/components/ui/sidebar";
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
        transition: "padding-left 0.2s",
        ...(sidebarManager.open && insetStyle),
      }}
    >
      {children}
    </SidebarInset>
  );
};

export default ResizableSidebarInset;
