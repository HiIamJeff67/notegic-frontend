import {
  LocalDBMigrator,
  type LocalDBMigratorClient,
  type MigrationEntry,
  splitSqlStatements,
} from "./migrator";

const migration = (
  versionNumber: number,
  tag: string,
  sqlContent: string
): MigrationEntry => ({
  idx: versionNumber,
  tag,
  versionNumber,
  sqlContent,
  statements: sqlContent.split(";").filter(Boolean),
});

const createTransactionalClient = () => {
  const committedQueries: string[] = [];
  let pendingQueries: string[] = [];
  let failOnQuery: string | null = null;
  let reportedVersion: number | null = null;

  const client: LocalDBMigratorClient = {
    transaction: async operation => {
      pendingQueries = [];
      let pendingVersion = 0;
      const transaction = {
        run: async (query: string) => {
          if (query === failOnQuery) throw new Error("migration failed");
          pendingQueries.push(query);
          const versionAssignment = query.match(
            /^PRAGMA user_version = (\d+)$/
          );
          if (versionAssignment) {
            pendingVersion = Number(versionAssignment[1]);
            return [];
          }
          if (query === "PRAGMA user_version") {
            return [{ user_version: reportedVersion ?? pendingVersion }];
          }
        },
      };

      try {
        const result = await operation(transaction);
        committedQueries.push(...pendingQueries);
        return result;
      } catch (error) {
        pendingQueries = [];
        throw error;
      }
    },
  };

  return {
    client,
    committedQueries,
    failOnQuery: (query: string | null) => {
      failOnQuery = query;
    },
    reportVersion: (version: number | null) => {
      reportedVersion = version;
    },
  };
};

describe("LocalDBMigrator", () => {
  it("commits each migration and its version flag together", async () => {
    const database = createTransactionalClient();
    const migrator = new LocalDBMigrator(database.client, [
      migration(0, "0000_initial", "CREATE TABLE initial;"),
      migration(1, "0001_next", "ALTER TABLE initial ADD COLUMN name;"),
    ]);

    await expect(
      migrator.ensureMigrated({ currentVersion: 0, targetVersion: 2 })
    ).resolves.toEqual({
      appliedTags: ["0000_initial", "0001_next"],
      finalVersion: 2,
    });

    expect(database.committedQueries).toEqual([
      "CREATE TABLE initial",
      "PRAGMA user_version = 1",
      "PRAGMA user_version",
      "ALTER TABLE initial ADD COLUMN name",
      "PRAGMA user_version = 2",
      "PRAGMA user_version",
    ]);
  });

  it("does not commit the failed migration or its version flag", async () => {
    const database = createTransactionalClient();
    database.failOnQuery("ALTER TABLE initial ADD COLUMN name");
    const migrator = new LocalDBMigrator(database.client, [
      migration(0, "0000_initial", "CREATE TABLE initial;"),
      migration(1, "0001_next", "ALTER TABLE initial ADD COLUMN name;"),
    ]);

    await expect(
      migrator.ensureMigrated({ currentVersion: 0, targetVersion: 2 })
    ).rejects.toThrow("migration failed");

    expect(database.committedQueries).toEqual([
      "CREATE TABLE initial",
      "PRAGMA user_version = 1",
      "PRAGMA user_version",
    ]);
  });

  it("can retry a failed migration from the unchanged version", async () => {
    const database = createTransactionalClient();
    database.failOnQuery("ALTER TABLE initial ADD COLUMN name");
    const migrator = new LocalDBMigrator(database.client, [
      migration(0, "0000_initial", "CREATE TABLE initial;"),
      migration(1, "0001_next", "ALTER TABLE initial ADD COLUMN name;"),
    ]);

    await expect(
      migrator.ensureMigrated({ currentVersion: 0, targetVersion: 2 })
    ).rejects.toThrow("migration failed");

    database.failOnQuery(null);
    await expect(
      migrator.ensureMigrated({ currentVersion: 1, targetVersion: 2 })
    ).resolves.toEqual({
      appliedTags: ["0001_next"],
      finalVersion: 2,
    });
    expect(database.committedQueries).toEqual([
      "CREATE TABLE initial",
      "PRAGMA user_version = 1",
      "PRAGMA user_version",
      "ALTER TABLE initial ADD COLUMN name",
      "PRAGMA user_version = 2",
      "PRAGMA user_version",
    ]);
  });

  it("bootstraps a fresh database directly to the current version", async () => {
    const database = createTransactionalClient();
    const migrator = new LocalDBMigrator(database.client, [
      migration(0, "0000_initial", "CREATE TABLE initial;"),
      migration(1, "0001_next", "ALTER TABLE initial ADD COLUMN name;"),
    ]);

    await expect(
      migrator.bootstrapCurrentSchema(
        "CREATE TABLE initial; CREATE TABLE current;",
        2
      )
    ).resolves.toEqual({
      appliedTags: ["bootstrap-current"],
      finalVersion: 2,
    });

    expect(database.committedQueries).toEqual([
      "CREATE TABLE initial",
      "CREATE TABLE current",
      "PRAGMA user_version = 2",
      "PRAGMA user_version",
    ]);
  });

  it("rolls back when the version flag does not persist", async () => {
    const database = createTransactionalClient();
    database.reportVersion(0);
    const migrator = new LocalDBMigrator(database.client, [
      migration(0, "0000_initial", "CREATE TABLE initial;"),
    ]);

    await expect(
      migrator.bootstrapCurrentSchema("CREATE TABLE initial;", 1)
    ).rejects.toThrow("local database migration stopped at version 0");
    expect(database.committedQueries).toEqual([]);
  });

  it("splits bootstrap SQL without splitting semicolons inside quoted values", () => {
    expect(
      splitSqlStatements(
        "CREATE TABLE example (value TEXT DEFAULT 'a;b'); CREATE INDEX example_idx ON example(value);"
      )
    ).toEqual([
      "CREATE TABLE example (value TEXT DEFAULT 'a;b')",
      "CREATE INDEX example_idx ON example(value)",
    ]);
  });

  it("rejects a database version newer than the migration target", async () => {
    const database = createTransactionalClient();
    const migrator = new LocalDBMigrator(database.client, [
      migration(0, "0000_initial", "CREATE TABLE initial;"),
    ]);

    await expect(
      migrator.ensureMigrated({ currentVersion: 2, targetVersion: 1 })
    ).rejects.toThrow("newer than target version");
    expect(database.committedQueries).toEqual([]);
  });
});
