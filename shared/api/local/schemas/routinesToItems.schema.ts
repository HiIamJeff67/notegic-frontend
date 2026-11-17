import { relations } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { Item } from "./item.schema";
import { Routine } from "./routine.schema";

export const RoutinesToItems = sqliteTable(
  "RoutinesToItemsTable",
  {
    routineId: text("routine_id")
      .notNull()
      .references(() => Routine.id),
    itemId: text("item_id")
      .notNull()
      .references(() => Item.id),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(new Date()),
  },
  table => [
    index("routines_to_items_routine_idx").on(table.routineId),
    index("routines_to_items_item_idx").on(table.itemId),
  ]
);

export const RoutinesToItemsRelations = relations(
  RoutinesToItems,
  ({ one }) => ({
    routine: one(Routine, {
      fields: [RoutinesToItems.routineId],
      references: [Routine.id],
    }),
    item: one(Item, {
      fields: [RoutinesToItems.itemId],
      references: [Item.id],
    }),
  })
);
