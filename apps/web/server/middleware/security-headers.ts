import { defineHandler, setResponseHeaders } from "nitro/h3";

/**
 * Keep production responses cross-origin isolated for the local SQLite/OPFS
 * runtime. The same headers are configured on the Vite dev server as well.
 */
export default defineHandler(event => {
  setResponseHeaders(event, {
    "Cross-Origin-Embedder-Policy": "require-corp",
    "Cross-Origin-Opener-Policy": "same-origin",
  });
});
