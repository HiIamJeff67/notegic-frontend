import { SidebarInset } from "@shared/components/ui/sidebar";
import type { ReactNode } from "react";

const AppSidebarInset = ({ children }: { children: ReactNode }) => {
  return (
    <SidebarInset className="h-full min-h-0 min-w-0 overflow-hidden">
      {children}
    </SidebarInset>
  );
};

export default AppSidebarInset;
