import { AccessControlPermission } from "@shared/api/interfaces/enums/accessControlPermission.enum";
import { RootShelf } from "@/api/local/schemas/rootShelf.schema";
import { User } from "@/api/local/schemas/user.schema";
import { eq, relations } from "drizzle-orm";
import {
  integer,
  index,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const UsersToShelves = sqliteTable(
  "UsersToShelvesTable",
  {
    userPublicId: text("user_public_id")
      .notNull()
      .references(() => User.publicId),
    rootShelfId: text("root_shelf_id")
      .notNull()
      .references(() => RootShelf.id),
    permission: text("permission").$type<AccessControlPermission>().notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(new Date()),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(new Date()),
  },
  table => [
    index("users_to_shelves_root_shelf_idx").on(table.rootShelfId),
    primaryKey({ columns: [table.userPublicId, table.rootShelfId] }),
    uniqueIndex("users_to_shelves_unique_idx_root_shelf_owner")
      .on(table.rootShelfId)
      .where(eq(table.permission, AccessControlPermission.Owner)),
  ]
);

export const UsersToShelvesRelations = relations(UsersToShelves, ({ one }) => ({
  user: one(User, {
    fields: [UsersToShelves.userPublicId],
    references: [User.publicId],
  }),
  rootShelf: one(RootShelf, {
    fields: [UsersToShelves.rootShelfId],
    references: [RootShelf.id],
  }),
}));
