import { ScreenProvider } from "@shared/hooks/providers/ScreenProvider";
import { Toaster } from "@shared/components/shadcn/toaster";
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
import DashboardLayout from "./pages/app/dashboard/DashboardLayout";
import DashboardPage from "./pages/app/dashboard/DashboardPage";
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

const routeTree = rootRoute.addChildren([
  indexRoute,
  appRoute.addChildren([dashboardRoute]),
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
