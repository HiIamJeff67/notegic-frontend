import { defineConfig, devices } from "@playwright/test";

const port = 4173;
const production = process.env.E2E_PRODUCTION === "true";
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./apps/web/test/e2e",
  workers: 2,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  webServer: {
    command: production
      ? "npm run start --workspace=@notegic/web"
      : "npm run dev --workspace=@notegic/web -- --host 127.0.0.1 --port 4173 --strictPort",
    env: {
      // E2E optimization must not replace a running developer server's chunks.
      NOTEGIC_VITE_CACHE_DIR: "node_modules/.vite-playwright",
      NOTEGIC_NITRO_BUILD_DIR: "node_modules/.nitro-playwright",
      VITE_APP_BASE_PATH: "/",
      PORT: String(port),
      HOST: "127.0.0.1",
      ...(process.env.E2E_ROUTINE_API_URL
        ? { VITE_API_DOMAIN_URL: process.env.E2E_ROUTINE_API_URL }
        : {}),
      ...(process.env.E2E_FEEDBACK_API_URL
        ? { VITE_API_DOMAIN_URL: process.env.E2E_FEEDBACK_API_URL }
        : {}),
    },
    url: `${baseURL}/`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    {
      name: "chromium",
      use: devices["Desktop Chrome"],
    },
  ],
});
