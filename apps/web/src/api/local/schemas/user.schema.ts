import { RootShelf, Transaction, UsersToShelves } from "@/api/local/schemas";
import { eq, relations } from "drizzle-orm";
import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { UsersToStations } from "./usersToStations.schema";

// the same schemas as the user in api interface and shard type
export const User = sqliteTable(
  "UserTable",
  {
    publicId: text("public_id").primaryKey(),
    name: text("name").unique().notNull(),
    displayName: text("display_name").notNull(),
    email: text("email").unique().notNull(),
    status: text("status").notNull().default("Online"),
    isLoggedIn: integer("is_logged_in", { mode: "boolean" })
      .notNull()
      .default(true), // frontend only column
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(new Date()),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(new Date()),
  },
  table => [
    uniqueIndex("user_unique_idx_is_logged_in")
      .on(table.isLoggedIn)
      .where(eq(table.isLoggedIn, true)),
  ]
);

export const UserRelations = relations(User, ({ many }) => ({
  rootShelves: many(RootShelf),
  usersToShelves: many(UsersToShelves),
  usersToStations: many(UsersToStations),
  transactions: many(Transaction),
}));
