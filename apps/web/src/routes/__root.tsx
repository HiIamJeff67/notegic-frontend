import type { ApolloClientIntegration } from "@apollo/client-integration-tanstack-start";
import { requiresCrossOriginIsolation } from "@shared/lib/crossOriginIsolation";
import { createRootRouteWithContext, redirect } from "@tanstack/react-router";
import appCSS from "@/global/styles/globals.css?url";
import { RootDocument } from "@/pages/RootDocument";
import { RootNotFoundPage } from "@/pages/RootNotFoundPage";
// @ts-ignore: allow side-effect import of global CSS without declaration
import "@/global/styles/globals.css";

const isolatedDocument =
  typeof window === "undefined"
    ? null
    : requiresCrossOriginIsolation(
        window.location.pathname,
        import.meta.env.BASE_URL
      );

export const Route =
  createRootRouteWithContext<ApolloClientIntegration.RouterContext>()({
    beforeLoad: ({ location, preload }) => {
      // Router pathnames already exclude the application's base path.
      if (
        !preload &&
        isolatedDocument !== null &&
        isolatedDocument !== requiresCrossOriginIsolation(location.pathname)
      ) {
        // COEP belongs to the HTML document and cannot change during SPA navigation.
        throw redirect({ href: location.publicHref, reloadDocument: true });
      }
    },
    head: () => ({
      meta: [
        { charSet: "utf-8" },
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1",
        },
        { title: "Notegic" },
      ],
      links: [
        {
          rel: "icon",
          href: `${import.meta.env.BASE_URL}favicon.ico`,
        },
        {
          rel: "preconnect",
          href: "https://fonts.googleapis.com",
        },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossOrigin: "anonymous",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@100..800&display=swap",
        },
        {
          rel: "stylesheet",
          href: appCSS,
        },
      ],
    }),
    component: RootDocument,
    notFoundComponent: RootNotFoundPage,
  });
