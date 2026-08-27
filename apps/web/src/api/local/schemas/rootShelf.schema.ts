import { SubShelf, UsersToShelves } from "@/api/local/schemas";
import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// the same schemas as the rootShelf in api interface
export const RootShelf = sqliteTable("RootShelfTable", {
  id: text("id").primaryKey(),
  name: text("name").notNull().default("undefined"),
  subShelfCount: integer("sub_shelf_count").notNull().default(0),
  itemCount: integer("item_count").notNull().default(0),
  lastAnalyzedAt: integer("last_analyzed_count", {
    mode: "timestamp",
  })
    .notNull()
    .default(new Date()),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(new Date()),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(new Date()),
});

export const RootShelfRelations = relations(RootShelf, ({ many }) => ({
  subShelves: many(SubShelf),
  usersToShelves: many(UsersToShelves),
}));
