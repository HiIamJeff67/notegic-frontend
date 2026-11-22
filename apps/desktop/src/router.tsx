import { Toaster } from "@shared/components/shadcn/toaster";
import { ScreenProvider } from "@shared/hooks/providers/ScreenProvider";
import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { syncStoredLanguage } from "./i18n";
import AppLayout from "./pages/app/AppLayout";
import BlockPackPage from "./pages/app/block-packs/BlockPackPage";
import DashboardLayout from "./pages/app/dashboard/DashboardLayout";
import DashboardPage from "./pages/app/dashboard/DashboardPage";
import MaterialPage from "./pages/app/materials/MaterialPage";
import RoutinePage from "./pages/app/routines/RoutinePage";
import ShelfPage from "./pages/app/shelves/ShelfPage";
import StationPage from "./pages/app/stations/StationPage";
import { RootNotFoundPage } from "./pages/RootNotFoundPage";

const dashboardPath = "/app/dashboard";

function DesktopRoot() {
  useEffect(() => {
    syncStoredLanguage();
  }, []);

  return (
    <ScreenProvider>
      <Toaster>
        <Outlet />
      </Toaster>
    </ScreenProvider>
  );
}

function DashboardScreen() {
  return (
    <DashboardLayout>
      <DashboardPage />
    </DashboardLayout>
  );
}

const rootRoute = createRootRoute({
  component: DesktopRoot,
  notFoundComponent: RootNotFoundPage,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: dashboardPath });
  },
});

const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app",
  component: AppLayout,
});

const dashboardRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/dashboard",
  component: DashboardScreen,
});

const shelfRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/shelves/$rootShelfId",
  component: ShelfPage,
});

const materialRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/materials/$materialId",
  component: MaterialPage,
});

const blockPackRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/block-packs/$blockPackId",
  component: BlockPackPage,
});

const stationRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/stations/$stationId",
  component: StationPage,
});

const routineRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/routines/$routineId",
  component: RoutinePage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  appRoute.addChildren([
    dashboardRoute,
    shelfRoute,
    materialRoute,
    blockPackRoute,
    stationRoute,
    routineRoute,
  ]),
]);

export const router = createRouter({
  routeTree,
  scrollRestoration: true,
  notFoundMode: "root",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
