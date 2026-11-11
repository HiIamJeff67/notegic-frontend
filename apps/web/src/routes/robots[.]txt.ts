import { createFileRoute } from "@tanstack/react-router";
import { createRobotsTxt, isPublicSiteIndexable } from "@/seo/publicPage";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async () =>
        new Response(
          createRobotsTxt(
            isPublicSiteIndexable(import.meta.env.VITE_PUBLIC_SITE_ORIGIN)
          ),
          {
            headers: {
              "Content-Type": "text/plain; charset=utf-8",
            },
          }
        ),
    },
  },
});
