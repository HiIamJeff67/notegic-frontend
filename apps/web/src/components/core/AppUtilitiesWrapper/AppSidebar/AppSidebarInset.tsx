import type { ReactNode } from "react";
import ResizableSidebarInset from "../ResizableSidebar/ResizableSidebarInset";

const AppSidebarInset = ({ children }: { children: ReactNode }) => {
  return (
    <ResizableSidebarInset className="h-dvh min-w-0 min-h-0 overflow-hidden">
      {children}
    </ResizableSidebarInset>
  );
};

export default AppSidebarInset;
