import { defineConfig, devices } from "@playwright/test";

const port = 4173;
const production = process.env.E2E_PRODUCTION === "true";
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./apps/web/test/e2e",
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
      VITE_APP_BASE_PATH: "/",
      PORT: String(port),
      HOST: "127.0.0.1",
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
