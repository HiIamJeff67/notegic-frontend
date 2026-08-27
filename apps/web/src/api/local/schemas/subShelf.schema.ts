import { BlockPack, RootShelf } from "@/api/local/schemas";
import { UUID } from "crypto";
import { relations } from "drizzle-orm";
import {
  foreignKey,
  integer,
  index,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

// the same schemas as the subShelf in api interface
export const SubShelf = sqliteTable(
  "SubShelfTable",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull().default("undefined"),
    rootShelfId: text("root_shelf_id")
      .notNull()
      .references(() => RootShelf.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      }),
    prevSubShelfId: text("prev_sub_shelf_id"),
    path: text("path", { mode: "json" }).$type<UUID[]>().notNull().default([]), // JSON string, but formed by uuid array
    deletedAt: integer("deleted_at", { mode: "timestamp" }),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(new Date()),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(new Date()),
  },
  table => [
    index("sub_shelf_root_shelf_idx").on(table.rootShelfId),
    index("sub_shelf_prev_idx").on(table.prevSubShelfId),
    foreignKey({
      columns: [table.prevSubShelfId],
      foreignColumns: [table.id],
      name: "sub_shelf_fk_prev_sub_shelf_id",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ]
);

export const SubShelfRelations = relations(SubShelf, ({ one, many }) => ({
  rootShelf: one(RootShelf, {
    fields: [SubShelf.rootShelfId],
    references: [RootShelf.id],
  }),
  prev: one(SubShelf, {
    fields: [SubShelf.prevSubShelfId],
    references: [SubShelf.id],
    relationName: "sub_shelf_relation_prev_next",
  }),
  next: one(SubShelf, {
    fields: [SubShelf.id],
    references: [SubShelf.prevSubShelfId],
    relationName: "sub_shelf_relation_prev_next",
  }),
  blockPacks: many(BlockPack),
}));
