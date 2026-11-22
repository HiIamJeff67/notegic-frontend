import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { client } from "@shared/api/local/client";
import { getSQLiteDriver } from "@shared/api/local/driver";
import { type MigrationEntry, Migrator } from "@shared/api/local/migrator";
import { UserRepository } from "@shared/api/local/repositories/user.repository";
import { localSchemaHead } from "@shared/api/local/schemaHead";
import { User } from "@shared/api/local/schemas";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

const migrationsDirectory = path.resolve(__dirname, "../migrations");

const readMigrations = (): MigrationEntry[] => {
  const journal = JSON.parse(
    readFileSync(
      path.join(migrationsDirectory, "meta", "_journal.json"),
      "utf8"
    )
  ) as { entries?: { idx: number; tag: string }[] };
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
        statements: Migrator.splitSqlStatements(sqlContent),
      };
    });
};

const openFixture = async () => {
  const directory = mkdtempSync(path.join(tmpdir(), "notegic-user-"));
  const sqlite = new Database(path.join(directory, "notegic.sqlite"));
  const migrator = new Migrator(
    {
      transaction: async operation => {
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
    },
    readMigrations()
  );
  const version = sqlite.prepare("PRAGMA user_version").get() as {
    user_version: number;
  };
  await migrator.ensure({
    currentVersion: version.user_version,
    targetVersion: localSchemaHead,
  });
  sqlite.pragma("foreign_keys = ON");
  return {
    db: drizzle(sqlite),
    client: client(getSQLiteDriver(sqlite)),
    close: () => sqlite.close(),
  };
};

describe("user repository", () => {
  it("keeps only the latest user logged in", async () => {
    const { db, client: local, close } = await openFixture();
    const first = "33333333-3333-4333-8333-333333333333";
    const second = "44444444-4444-4444-8444-444444444444";
    const inserted = await UserRepository.UpsertLoggedIn(local, {
      publicId: first,
      name: "ada",
      displayName: "Ada",
      email: "ada@example.invalid",
    });
    const switched = await UserRepository.UpsertLoggedIn(local, {
      publicId: second,
      name: "bea",
      displayName: "Bea",
      email: "bea@example.invalid",
    });
    const renamed = await UserRepository.UpsertLoggedIn(local, {
      publicId: second,
      name: "bea",
      displayName: "Beatrice",
      email: "bea@example.invalid",
    });
    const repeated = await UserRepository.UpsertLoggedIn(local, {
      publicId: second,
      name: "bea",
      displayName: "Beatrice",
      email: "bea@example.invalid",
    });
    const users = db.select().from(User).all();
    close();

    expect(inserted.changed).toBe(true);
    expect(switched.changed).toBe(true);
    expect(renamed.changed).toBe(true);
    expect(repeated.changed).toBe(false);
    expect(users).toHaveLength(2);
    expect(users).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ publicId: first, isLoggedIn: false }),
        expect.objectContaining({
          publicId: second,
          displayName: "Beatrice",
          isLoggedIn: true,
        }),
      ])
    );
  });
});
