import { ApolloProvider } from "@apollo/client/react";
import {
  createRootRouteWithContext,
  createRoute,
  createRouter,
  Outlet,
} from "@tanstack/react-router";
import { type ReactNode, useEffect } from "react";
import { createApolloClient } from "@/api/apolloClient";
import { Toaster } from "@/components/ui/toaster";
import { syncStoredLanguage } from "@/i18n";
import PlaygroundPage from "@/pages/(playground)/PlaygroundPage";
import AppLayout from "@/pages/app/AppLayout";
import BlockPackEditorIndexPage from "@/pages/app/block-pack-editor/BlockPackEditorIndexPage";
import {
  BlockPackEditorIndexRoute,
  loadBlockPackEditor,
} from "@/pages/app/block-pack-editor/BlockPackEditorIndexRoute";
import BlockPackEditorNotFoundPage from "@/pages/app/block-pack-editor/BlockPackEditorNotFoundPage";
import DashboardLayout from "@/pages/app/dashboard/DashboardLayout";
import DashboardPage from "@/pages/app/dashboard/DashboardPage";
import MaterialViewerIndexPage from "@/pages/app/material-viewer/MaterialViewerIndexPage";
import MaterialViewerNotFoundPage from "@/pages/app/material-viewer/MaterialViewerNotFoundPage";
import {
  loadMaterialViewer,
  MaterialViewerRoute,
  readMaterialViewerSearch,
} from "@/pages/app/material-viewer/MaterialViewerRoute";
import RoutinesIndexPage from "@/pages/app/routines/RoutinesIndexPage";
import RoutinesLayout from "@/pages/app/routines/RoutinesLayout";
import {
  loadRoutineTaskDependencyGraph,
  RoutineTaskDependencyGraphEditorRoute,
} from "@/pages/app/routines/RoutineTaskDependencyGraphEditorRoute";
import {
  loadStationRoutines,
  StationRoutinesRoute,
} from "@/pages/app/routines/StationRoutinesRoute";
import AccountSettingsPage from "@/pages/app/setting/account/AccountSettingsPage";
import PreferencesPage from "@/pages/app/setting/preferences/PreferencesPage";
import {
  loadTrash,
  readTrashSearch,
  TrashRoute,
} from "@/pages/app/trash/TrashRoute";
import { AuthLayout } from "@/pages/auth/AuthLayout";
import ForgetPasswordPage from "@/pages/auth/ForgetPasswordPage";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import OAuthRedirectPage from "@/pages/auth/redirect/OAuthRedirectPage";
import ContactPage from "@/pages/contact/ContactPage";
import DataDeletionPage from "@/pages/data-deletion/DataDeletionPage";
import DocumentPage from "@/pages/document/DocumentPage";
import EulaPage from "@/pages/eula/EulaPage";
import { HomePage } from "@/pages/home/HomePage";
import PrivacyPolicyPage from "@/pages/privacy-policy/PrivacyPolicyPage";
import { RootNotFoundPage } from "@/pages/RootNotFoundPage";
import Providers from "@/providers/Providers";

const apolloClient = createApolloClient();

function DesktopRoot() {
  useEffect(() => {
    syncStoredLanguage();
  }, []);

  return (
    <ApolloProvider client={apolloClient}>
      <Providers>
        <Toaster>
          <Outlet />
        </Toaster>
      </Providers>
    </ApolloProvider>
  );
}

const redirectPage = (
  provider: "google" | "github" | "x" | "discord" | "apple"
) => {
  const RedirectPage = () => <OAuthRedirectPage provider={provider} />;
  return RedirectPage;
};

const outletLayout = (
  Layout: (props: { children: ReactNode }) => ReactNode
) => {
  const LayoutRoute = () => (
    <Layout>
      <Outlet />
    </Layout>
  );
  return LayoutRoute;
};

const rootRoute = createRootRouteWithContext<{
  apolloClient: ReturnType<typeof createApolloClient>;
}>()({
  component: DesktopRoot,
  notFoundComponent: RootNotFoundPage,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/contact",
  component: ContactPage,
});

const dataDeletionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/data-deletion",
  component: DataDeletionPage,
});

const documentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/document",
  component: DocumentPage,
});

const eulaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/eula",
  component: EulaPage,
});

const privacyPolicyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/privacy-policy",
  component: PrivacyPolicyPage,
});

const playgroundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/playground",
  component: PlaygroundPage,
});

const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/$",
  component: RootNotFoundPage,
});

const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "/_auth",
  component: AuthLayout,
});

const loginRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/login",
  component: LoginPage,
});

const registerRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/register",
  component: RegisterPage,
});

const forgetPasswordRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/forgetPassword",
  component: ForgetPasswordPage,
});

const redirectGoogleRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/redirect/google",
  component: redirectPage("google"),
});

const redirectGithubRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/redirect/github",
  component: redirectPage("github"),
});

const redirectXRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/redirect/x",
  component: redirectPage("x"),
});

const redirectDiscordRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/redirect/discord",
  component: redirectPage("discord"),
});

const redirectAppleRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/redirect/apple",
  component: redirectPage("apple"),
});

const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app",
  component: AppLayout,
});

const DashboardRoute = outletLayout(DashboardLayout);
const RoutinesRoute = outletLayout(RoutinesLayout);

const dashboardRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/dashboard",
  component: DashboardRoute,
});

const dashboardIndexRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "/",
  component: DashboardPage,
});

const routinesRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/routines",
  component: RoutinesRoute,
});

const routinesIndexRoute = createRoute({
  getParentRoute: () => routinesRoute,
  path: "/",
  component: RoutinesIndexPage,
});

const stationRoute = createRoute({
  getParentRoute: () => routinesRoute,
  path: "/$stationId",
  loader: ({ params }) => loadStationRoutines(params.stationId),
  component: StationRoutinesRoute,
});

const dependencyGraphRoute = createRoute({
  getParentRoute: () => routinesRoute,
  path: "/$routineId/dependency-graph-editor",
  loader: ({ params }) => loadRoutineTaskDependencyGraph(params.routineId),
  component: RoutineTaskDependencyGraphEditorRoute,
});

const blockPackEditorRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/block-pack-editor",
  component: Outlet,
  notFoundComponent: BlockPackEditorNotFoundPage,
});

const blockPackIndexRoute = createRoute({
  getParentRoute: () => blockPackEditorRoute,
  path: "/",
  component: BlockPackEditorIndexPage,
});

const blockPackIdRoute = createRoute({
  getParentRoute: () => blockPackEditorRoute,
  path: "/$blockPackId",
  loader: ({ params }) => loadBlockPackEditor(params.blockPackId),
  component: BlockPackEditorIndexRoute,
  notFoundComponent: BlockPackEditorNotFoundPage,
});

const materialViewerRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/material-viewer",
  component: Outlet,
  notFoundComponent: MaterialViewerNotFoundPage,
});

const materialIndexRoute = createRoute({
  getParentRoute: () => materialViewerRoute,
  path: "/",
  component: MaterialViewerIndexPage,
});

const materialIdRoute = createRoute({
  getParentRoute: () => materialViewerRoute,
  path: "/$materialId",
  validateSearch: readMaterialViewerSearch,
  loaderDeps: ({ search }) => search,
  loader: ({ params, deps }) =>
    loadMaterialViewer({
      materialId: params.materialId,
      parentSubShelfId: deps.parentSubShelfId,
      rootShelfId: deps.rootShelfId,
    }),
  component: MaterialViewerRoute,
  notFoundComponent: MaterialViewerNotFoundPage,
});

const accountRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/setting/account",
  component: AccountSettingsPage,
});

const preferencesRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/setting/preferences",
  component: PreferencesPage,
});

const trashRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/trash",
  validateSearch: readTrashSearch,
  loaderDeps: ({ search }) => ({ query: search.query }),
  loader: ({ context, deps }) => loadTrash({ context, deps }),
  component: TrashRoute,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  contactRoute,
  dataDeletionRoute,
  documentRoute,
  eulaRoute,
  privacyPolicyRoute,
  playgroundRoute,
  notFoundRoute,
  authRoute.addChildren([
    loginRoute,
    registerRoute,
    forgetPasswordRoute,
    redirectGoogleRoute,
    redirectGithubRoute,
    redirectXRoute,
    redirectDiscordRoute,
    redirectAppleRoute,
  ]),
  appRoute.addChildren([
    dashboardRoute.addChildren([dashboardIndexRoute]),
    routinesRoute.addChildren([
      routinesIndexRoute,
      stationRoute,
      dependencyGraphRoute,
    ]),
    blockPackEditorRoute.addChildren([blockPackIndexRoute, blockPackIdRoute]),
    materialViewerRoute.addChildren([materialIndexRoute, materialIdRoute]),
    accountRoute,
    preferencesRoute,
    trashRoute,
  ]),
]);

export const router = createRouter({
  routeTree,
  context: { apolloClient },
  scrollRestoration: true,
  notFoundMode: "root",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
