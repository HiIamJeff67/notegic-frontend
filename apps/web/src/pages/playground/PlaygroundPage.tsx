import AppCommand from "@/components/core/AppUtilitesWrapper/AppCommand/AppCommand";
import AppSidebarInset from "@/components/core/AppUtilitesWrapper/AppSidebar/AppSidebarInset";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppCommandProvider } from "@/providers/AppCommandProvider";
import { ResizeSidebarProvider } from "@/providers/ResizeSidebarProvider";

const PlaygroundPage = () => {
  return (
    <AppCommandProvider>
      <SidebarProvider>
        <ResizeSidebarProvider>
          <AppCommand />
          <AppSidebarInset>
            <div className="min-h-0 min-w-0 flex-1" />
          </AppSidebarInset>
        </ResizeSidebarProvider>
      </SidebarProvider>
    </AppCommandProvider>
  );
};

export default PlaygroundPage;
