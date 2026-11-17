import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./test/e2e",
  outputDir: "./test/results",
  workers: 1,
  timeout: 180_000,
  reporter: "list",
  projects: [{ name: "api" }],
});
