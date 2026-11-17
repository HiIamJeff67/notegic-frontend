import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import {
  LocalDBMigrator,
  type MigrationEntry,
  splitSqlStatements,
} from "../../../../packages/api/local/migrator";
import * as schema from "../../../../packages/api/local/schemas";
import {
  BlockPackDocument,
  ensureBlockPackDocumentTable,
} from "./blockPackDocument";

export const sharedSchema = {
  ...schema,
  BlockPackDocument,
};

export type DriverDatabase = ReturnType<typeof drizzle<typeof sharedSchema>>;

const readMigrations = (migrationsDirectory: string): MigrationEntry[] => {
  const journal = JSON.parse(
    readFileSync(
      path.join(migrationsDirectory, "meta", "_journal.json"),
      "utf8"
    )
  ) as { entries?: { idx: number; tag: string }[] };
  const downSql = new Map(
    readdirSync(migrationsDirectory)
      .filter(file => file.endsWith(".down.sql"))
      .map(file => [
        file.slice(0, -".down.sql".length),
        readFileSync(path.join(migrationsDirectory, file), "utf8"),
      ])
  );

  return (journal.entries ?? [])
    .slice()
    .sort((left, right) => left.idx - right.idx)
    .map(entry => {
      const sqlContent = readFileSync(
        path.join(migrationsDirectory, `${entry.tag}.sql`),
        "utf8"
      );
      const [prefix] = entry.tag.split("_");
      return {
        idx: entry.idx,
        tag: entry.tag,
        versionNumber: Number(prefix),
        sqlContent,
        statements: splitSqlStatements(sqlContent),
        downStatements: downSql.has(entry.tag)
          ? splitSqlStatements(downSql.get(entry.tag) ?? "")
          : undefined,
      };
    });
};

const migrationClient = (sqlite: Database.Database) => ({
  transaction: async <T>(
    operation: (transaction: {
      run: (query: string) => Promise<unknown>;
    }) => Promise<T>
  ) => {
    sqlite.exec("BEGIN");
    try {
      const result = await operation({
        run: async query => {
          const statement = query.trim();
          if (/^pragma\s+user_version$/i.test(statement)) {
            return [sqlite.prepare(statement).get()];
          }
          sqlite.exec(statement);
          return [];
        },
      });
      sqlite.exec("COMMIT");
      return result;
    } catch (error) {
      sqlite.exec("ROLLBACK");
      throw error;
    }
  },
});

export const openDatabase = async (
  filePath: string,
  migrationsDirectory = path.resolve(
    process.cwd(),
    "packages/api/local/migrations"
  )
) => {
  const sqlite = new Database(filePath);
  const migrator = new LocalDBMigrator(
    migrationClient(sqlite),
    readMigrations(migrationsDirectory)
  );
  const currentVersion = (
    sqlite.prepare("PRAGMA user_version").get() as { user_version: number }
  ).user_version;
  await migrator.ensureMigrated({ currentVersion });
  ensureBlockPackDocumentTable(sqlite);
  sqlite.pragma("foreign_keys = ON");
  const database = drizzle(sqlite, { schema: sharedSchema });

  return {
    database,
    close: () => sqlite.close(),
  };
};

export const saveRootShelf = (
  database: DriverDatabase,
  shelf: {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    lastAnalyzedAt: Date;
  }
) => {
  database.insert(schema.RootShelf).values(shelf).run();
};

export const readRootShelf = (database: DriverDatabase, id: string) =>
  database
    .select()
    .from(schema.RootShelf)
    .where(eq(schema.RootShelf.id, id))
    .get();
