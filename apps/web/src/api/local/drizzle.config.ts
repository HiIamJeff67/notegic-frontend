import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./apps/web/src/api/local/migrations",
  schema: "./apps/web/src/api/local/schemas/index.ts",
  dialect: "sqlite",
});
