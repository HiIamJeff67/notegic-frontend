import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./packages/api/local/migrations",
  schema: "./packages/api/local/schemas/index.ts",
  dialect: "sqlite",
});
