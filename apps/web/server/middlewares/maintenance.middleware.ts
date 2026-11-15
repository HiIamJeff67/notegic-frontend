import { defineHandler } from "nitro/h3";

const maintenancePage = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex">
    <title>Notegic is under maintenance</title>
    <style>
      :root {
        color-scheme: light dark;
        font-family: system-ui, sans-serif;
      }

      body {
        position: relative;
        overflow: hidden;
        display: grid;
        min-height: 100vh;
        margin: 0;
        place-items: center;
        background: #000;
        color: #f9fafb;
      }

      body::before,
      body::after {
        position: absolute;
        inset: 0;
        content: "";
      }

      body::before {
        background-image:
          linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
        background-size: 20px 20px;
      }

      body::after {
        background: linear-gradient(
          135deg,
          transparent 0%,
          transparent 30%,
          rgba(0, 0, 0, 0.3) 50%,
          rgba(0, 0, 0, 0.7) 70%,
          #000 100%
        );
      }

      main {
        position: relative;
        z-index: 1;
        max-width: 36rem;
        padding: 2rem;
        text-align: center;
      }

      p {
        color: #d1d5db;
        line-height: 1.6;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>Notegic is under maintenance</h1>
      <p>We are upgrading the service and will be back shortly.</p>
    </main>
  </body>
</html>`;

export default defineHandler(event => {
  const maintenanceValue = event.req.runtime?.cloudflare?.env?.IS_MAINTENANCE;
  const isMaintenance =
    maintenanceValue === true ||
    (typeof maintenanceValue === "string" &&
      maintenanceValue.trim().toLowerCase() === "true");

  if (!isMaintenance) return;

  return new Response(maintenancePage, {
    status: 503,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "text/html; charset=utf-8",
      "Retry-After": "3600",
    },
  });
});
