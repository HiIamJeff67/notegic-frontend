import { routerWithApolloClient } from "@apollo/client-integration-tanstack-start";
import { createApolloClient } from "@/api/apollo-client";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

const rawBasePath = import.meta.env.VITE_APP_BASE_PATH || "/development/v1";
const routerBasePath = `/${rawBasePath.replace(/^\/+|\/+$/g, "")}`;

export function getRouter() {
  const apolloClient = createApolloClient();
  const router = createTanStackRouter({
    routeTree,
    basepath: routerBasePath,
    scrollRestoration: true,
    notFoundMode: "root",
    context: {
      ...routerWithApolloClient.defaultContext,
    },
  });

  return routerWithApolloClient(router, apolloClient);
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
