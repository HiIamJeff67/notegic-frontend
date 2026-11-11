import { createFileRoute } from "@tanstack/react-router";
import { createSitemapXml } from "@/seo/publicPage";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () =>
        new Response(createSitemapXml(), {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
          },
        }),
    },
  },
});
