import type Database from "better-sqlite3";
import { eq } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { blob, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const BlockPackDocument = sqliteTable("BlockPackDocumentTable", {
  blockPackId: text("block_pack_id").primaryKey(),
  update: blob("document_update", { mode: "buffer" }).notNull(),
  stateVector: blob("state_vector", { mode: "buffer" }).notNull(),
  byteSize: integer("byte_size").notNull(),
  needsFlush: integer("needs_flush", { mode: "boolean" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export type BlockPackDocumentRow = {
  blockPackId: string;
  update: Uint8Array;
  stateVector: Uint8Array;
  needsFlush: boolean;
  updatedAt: Date;
};

type DocumentDB = BetterSQLite3Database<{
  BlockPackDocument: typeof BlockPackDocument;
}>;

const bytes = (value: Buffer): Uint8Array => Uint8Array.from(value);

export const ensureBlockPackDocumentTable = (sqlite: Database.Database) => {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS BlockPackDocumentTable (
      block_pack_id text PRIMARY KEY NOT NULL,
      document_update blob NOT NULL,
      state_vector blob NOT NULL,
      byte_size integer NOT NULL,
      needs_flush integer NOT NULL,
      updated_at integer NOT NULL
    )
  `);
};

export const saveBlockPackDocument = (
  db: DocumentDB,
  document: BlockPackDocumentRow
) => {
  const update = Buffer.from(document.update);
  const stateVector = Buffer.from(document.stateVector);
  db.insert(BlockPackDocument)
    .values({
      blockPackId: document.blockPackId,
      update,
      stateVector,
      byteSize: document.update.byteLength + document.stateVector.byteLength,
      needsFlush: document.needsFlush,
      updatedAt: document.updatedAt,
    })
    .onConflictDoUpdate({
      target: BlockPackDocument.blockPackId,
      set: {
        update,
        stateVector,
        byteSize: document.update.byteLength + document.stateVector.byteLength,
        needsFlush: document.needsFlush,
        updatedAt: document.updatedAt,
      },
    })
    .run();
};

export const readBlockPackDocument = (
  db: DocumentDB,
  blockPackId: string
): BlockPackDocumentRow | undefined => {
  const row = db
    .select()
    .from(BlockPackDocument)
    .where(eq(BlockPackDocument.blockPackId, blockPackId))
    .get();
  if (!row) return undefined;
  return {
    blockPackId: row.blockPackId,
    update: bytes(row.update),
    stateVector: bytes(row.stateVector),
    needsFlush: row.needsFlush,
    updatedAt: row.updatedAt,
  };
};
