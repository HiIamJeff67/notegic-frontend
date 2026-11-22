import { StationRoutineSidebarProvider } from "@shared/api/hooks/react/StationRoutineSidebarProvider";
import { getQueryClient } from "@shared/api/queryClient";
import { SidebarProvider } from "@shared/components/shadcn/sidebar";
import { ThemeProvider } from "@shared/hooks/providers/ThemeProvider";
import { QueryClientProvider } from "@tanstack/react-query";
import { Outlet } from "@tanstack/react-router";
import { type ReactNode } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  CreateRoutineTag,
  GetAllMyRoutineTags,
} from "../../api/functions/routineTag.function";
import {
  CreateStation,
  DeleteMyStationById,
  GetAllMyStations,
} from "../../api/functions/station.function";
import AppUtilitiesWrapper from "../../components/core/AppUtilitiesWrapper/AppUtilitiesWrapper";
import { BackgroundImagesProvider } from "../../providers/BackgroundImagesProvider";
import {
  DesktopSessionProvider,
  useDesktopSession,
} from "../../providers/DesktopSessionProvider";
import { LoadingProvider } from "../../providers/LoadingProvider";
import { LocalPreferencesProvider } from "../../providers/LocalPreferencesProvider";
import { ModalProvider } from "../../providers/ModalProvider";
import { ShelfItemProvider } from "../../providers/ShelfItemProvider";

const AppFrame = ({ children }: { children: ReactNode }) => (
  <SidebarProvider className="h-full min-h-0">
    <AppUtilitiesWrapper>{children}</AppUtilitiesWrapper>
  </SidebarProvider>
);

const SignedInFrame = ({ children }: { children: ReactNode }) => {
  const session = useDesktopSession();
  if (!session.client || !session.account) {
    return <AppFrame>{children}</AppFrame>;
  }
  return (
    <ShelfItemProvider
      client={session.client}
      owner={session.account}
      onObservedUser={session.setAccount}
    >
      <StationRoutineSidebarProvider
        getAllStations={GetAllMyStations}
        createStation={CreateStation}
        deleteStation={DeleteMyStationById}
        getAllRoutineTags={GetAllMyRoutineTags}
        createRoutineTag={CreateRoutineTag}
      >
        <AppFrame>{children}</AppFrame>
      </StationRoutineSidebarProvider>
    </ShelfItemProvider>
  );
};

export default function AppLayout() {
  return (
    <QueryClientProvider client={getQueryClient()}>
      <ThemeProvider>
        <LocalPreferencesProvider>
          <LoadingProvider>
            <BackgroundImagesProvider>
              <DndProvider backend={HTML5Backend}>
                <ModalProvider>
                  <DesktopSessionProvider>
                    <SignedInFrame>
                      <Outlet />
                    </SignedInFrame>
                  </DesktopSessionProvider>
                </ModalProvider>
              </DndProvider>
            </BackgroundImagesProvider>
          </LoadingProvider>
        </LocalPreferencesProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
