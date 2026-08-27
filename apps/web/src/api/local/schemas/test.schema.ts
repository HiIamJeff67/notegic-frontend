import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const Test = sqliteTable("TestTable", {
  id: text("id").primaryKey(),
  purpose: text("title").notNull().default("unknown"),
  content: text("content"),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(new Date()),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(new Date()),
});
