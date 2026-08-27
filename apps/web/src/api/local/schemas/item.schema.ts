import { ItemType } from "@shared/api/interfaces/enums";
import { relations } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { RootShelf } from "./rootShelf.schema";
import { RoutinesToItems } from "./routinesToItems.schema";
import { SubShelf } from "./subShelf.schema";

export const Item = sqliteTable(
  "ItemTable",
  {
    id: text("id").primaryKey(),
    parentSubShelfId: text("parent_sub_shelf_id")
      .notNull()
      .references(() => SubShelf.id),
    rootShelfId: text("root_shelf_id")
      .notNull()
      .references(() => RootShelf.id),
    type: text("type").$type<ItemType>().notNull(),
    deletedAt: integer("deleted_at", { mode: "timestamp" }),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(new Date()),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(new Date()),
  },
  table => [
    index("item_parent_sub_shelf_idx").on(table.parentSubShelfId),
    index("item_root_shelf_idx").on(table.rootShelfId),
  ]
);

export const ItemRelations = relations(Item, ({ one, many }) => ({
  parentSubShelf: one(SubShelf, {
    fields: [Item.parentSubShelfId],
    references: [SubShelf.id],
  }),
  rootShelf: one(RootShelf, {
    fields: [Item.rootShelfId],
    references: [RootShelf.id],
  }),
  routinesToItems: many(RoutinesToItems),
}));
