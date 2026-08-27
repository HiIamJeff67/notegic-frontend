import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./shared/api/local/migrations",
  schema: "./shared/api/local/schemas/index.ts",
  dialect: "sqlite",
});
