import { createFileRoute } from "@tanstack/react-router";
import { createLlmsTxt } from "@/seo/publicPage";

export const Route = createFileRoute("/llms.txt")({
  server: {
    handlers: {
      GET: async () =>
        new Response(createLlmsTxt(), {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
          },
        }),
    },
  },
});
