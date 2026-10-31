import { defineHandler } from "nitro/h3";
import { getCrossOriginIsolationHeaders } from "../../../../shared/lib/browser/crossOriginIsolation";

/**
 * Public documentation embeds third-party players without the SQLite runtime.
 * Other pages retain isolation; crossing this boundary requires a document load.
 */
export default defineHandler(event => {
  const headers = getCrossOriginIsolationHeaders(
    event.url.pathname,
    import.meta.env.BASE_URL
  );
  for (const [name, value] of Object.entries(headers)) {
    event.res.headers.set(name, value);
    event.res.errHeaders.set(name, value);
  }
});
