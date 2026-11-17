import { SidebarProvider } from "@shared/components/shadcn/sidebar";
import { Outlet } from "@tanstack/react-router";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import AppUtilitiesWrapper from "../../components/core/AppUtilitiesWrapper/AppUtilitiesWrapper";
import { BackgroundImagesProvider } from "../../providers/BackgroundImagesProvider";
import { LoadingProvider } from "../../providers/LoadingProvider";
import { LocalPreferencesProvider } from "../../providers/LocalPreferencesProvider";
import { ModalProvider } from "../../providers/ModalProvider";
import { ThemeProvider } from "@shared/hooks/providers/ThemeProvider";

export default function AppLayout() {
  return (
    <ThemeProvider>
      <LocalPreferencesProvider>
        <LoadingProvider>
          <BackgroundImagesProvider>
            <DndProvider backend={HTML5Backend}>
              <ModalProvider>
                <SidebarProvider className="h-full min-h-0">
                  <AppUtilitiesWrapper>
                    <Outlet />
                  </AppUtilitiesWrapper>
                </SidebarProvider>
              </ModalProvider>
            </DndProvider>
          </BackgroundImagesProvider>
        </LoadingProvider>
      </LocalPreferencesProvider>
    </ThemeProvider>
  );
}
