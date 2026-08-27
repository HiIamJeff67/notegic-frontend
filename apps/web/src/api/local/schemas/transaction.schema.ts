import { User } from "@/api/local/schemas";
import { TransactionActionType } from "@/api/local/schemas/enums/transaction_action_type.enum";
import { TransactionEntityType } from "@/api/local/schemas/enums/transaction_entity_type.enum";
import { relations } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const Transaction = sqliteTable(
  "TransactionTable",
  {
    sequence: integer("sequence").primaryKey({ autoIncrement: true }),
    ownerPublicId: text("owner_public_id")
      .notNull()
      .references(() => User.publicId),
    entityType: text("entity_type").$type<TransactionEntityType>().notNull(), // "RootShelf", "SubShelf", "BlockPack", "Block"
    actionType: text("action_type").$type<TransactionActionType>().notNull(), // "CREATE", "UPDATE", "MOVE", "RESTORE", "DELETE", etc.
    body: text("body", { mode: "json" }).notNull(), // parsed request body
    affected: text("affected", { mode: "json" }),
    retryCount: integer("retry_count").notNull().default(0),
    lastError: text("last_error"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(new Date()),
  },
  table => [
    index("transaction_owner_retry_idx").on(
      table.ownerPublicId,
      table.retryCount
    ),
  ]
);

export const TransactionRelations = relations(Transaction, ({ one }) => ({
  owner: one(User, {
    fields: [Transaction.ownerPublicId],
    references: [User.publicId],
  }),
}));
