import AppCommand from "@/components/core/AppUtilitiesWrapper/AppCommand/AppCommand";
import AppSidebarInset from "@/components/core/AppUtilitiesWrapper/AppSidebar/AppSidebarInset";
import { SidebarProvider } from "@/components/ui/sidebar";
import { usePageTitle } from "@/hooks/usePageTitle";
import { AppCommandProvider } from "@/providers/AppCommandProvider";
import { ResizeSidebarProvider } from "@/providers/ResizeSidebarProvider";
import { UserProvider } from "@/providers/UserProvider";
import { pageTitle } from "@/seo/pageTitle";

const PlaygroundPage = () => {
  usePageTitle(pageTitle("Playground"));

  return (
    <UserProvider>
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
    </UserProvider>
  );
};

export default PlaygroundPage;
