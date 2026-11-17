import { MaterialContentType } from "@shared/api/interfaces/enums";
import { relations } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { RootShelf } from "./rootShelf.schema";
import { SubShelf } from "./subShelf.schema";

export const Material = sqliteTable(
  "MaterialTable",
  {
    id: text("id").primaryKey(),
    parentSubShelfId: text("parent_sub_shelf_id")
      .notNull()
      .references(() => SubShelf.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      }),
    rootShelfId: text("root_shelf_id")
      .notNull()
      .references(() => RootShelf.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      }),
    name: text("name").notNull().default("undefined"),
    size: integer("size").notNull().default(0),
    contentType: text("content_type")
      .$type<MaterialContentType>()
      .notNull()
      .default(MaterialContentType.PlainText),
    parseMediaType: text("parse_media_type").notNull().default(""),
    objectKey: text("object_key").notNull().default(""),
    deletedAt: integer("deleted_at", { mode: "timestamp" }),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(new Date()),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(new Date()),
  },
  table => [
    index("material_parent_sub_shelf_idx").on(table.parentSubShelfId),
    index("material_root_shelf_idx").on(table.rootShelfId),
  ]
);

export const MaterialRelations = relations(Material, ({ one }) => ({
  parentSubShelf: one(SubShelf, {
    fields: [Material.parentSubShelfId],
    references: [SubShelf.id],
  }),
  rootShelf: one(RootShelf, {
    fields: [Material.rootShelfId],
    references: [RootShelf.id],
  }),
}));
