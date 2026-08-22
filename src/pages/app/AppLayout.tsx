import { Outlet } from "@tanstack/react-router";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import StationRoutineInspectorHost from "@/components/inspectors/StationRoutineInspectorHost";
import SettingsSheet from "@/components/sheets/SettingsSheet/SettingsSheet";
import { AppSidebar } from "@/components/sidebar/AppSidebar/AppSidebar";
import AppSidebarInset from "@/components/sidebar/AppSidebar/AppSidebarInset";
import { SidebarProvider } from "@/components/ui/sidebar";
import { BackgroundImagesProvider } from "@/providers/BackgroundImagesProvider";
import { ModalProvider } from "@/providers/ModalProvider";
import { RealtimeProvider } from "@/providers/RealtimeProvider";
import { ResizeSidebarProvider } from "@/providers/ResizeSidebarProvider";
import { SettingsDisplayProvider } from "@/providers/SettingsDisplayProvider";
import { ShelfItemProvider } from "@/providers/ShelfItemProvider/ShelfItemProvider";
import { StationRoutineProvider } from "@/providers/StationRoutineProvider/StationRoutineProvider";
import { TransactionSynchronizerProvider } from "@/providers/TransactionSynchronizerProvider/TransactionSynchronizerProvider";
import { UserProvider } from "@/providers/UserProvider";
import { UserSettingsProvider } from "@/providers/UserSettingsProvider";

export default function AppLayout() {
  return (
    <TransactionSynchronizerProvider>
      <UserProvider autoFetchUserData>
        <UserSettingsProvider>
          <RealtimeProvider>
            <BackgroundImagesProvider>
              <DndProvider backend={HTML5Backend}>
                <SidebarProvider>
                  <ResizeSidebarProvider>
                    <ShelfItemProvider>
                      <StationRoutineProvider>
                        <ModalProvider>
                          <SettingsDisplayProvider>
                            <AppSidebar />
                            <AppSidebarInset>
                              <Outlet />
                            </AppSidebarInset>
                            <SettingsSheet />
                            <StationRoutineInspectorHost />
                          </SettingsDisplayProvider>
                        </ModalProvider>
                      </StationRoutineProvider>
                    </ShelfItemProvider>
                  </ResizeSidebarProvider>
                </SidebarProvider>
              </DndProvider>
            </BackgroundImagesProvider>
          </RealtimeProvider>
        </UserSettingsProvider>
      </UserProvider>
    </TransactionSynchronizerProvider>
  );
}
