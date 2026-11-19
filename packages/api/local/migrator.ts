export type MigrationEntry = {
  idx: number;
  tag: string;
  versionNumber: number;
  sqlContent: string;
  statements: string[];
  downStatements?: string[];
};

export type MigrationJournal = {
  entries?: { idx: number; tag: string }[];
};

export type MigrationResult = {
  appliedTags: string[];
  finalVersion: number;
};

export type MigratorClient = {
  transaction: <T>(
    operation: (transaction: {
      run: (query: string) => Promise<unknown>;
    }) => Promise<T>
  ) => Promise<T>;
};

export class Migrator {
  static splitSqlStatements(sqlContent: string): string[] {
    if (sqlContent.includes("--> statement-breakpoint")) {
      return sqlContent
        .split("--> statement-breakpoint")
        .map(statement => statement.trim())
        .filter(Boolean);
    }

    const statements: string[] = [];
    let statementStart = 0;
    let quote: "'" | '"' | "`" | null = null;

    for (let index = 0; index < sqlContent.length; index += 1) {
      const character = sqlContent[index];
      if (quote !== null) {
        if (character === quote) {
          if (sqlContent[index + 1] === quote) {
            index += 1;
          } else {
            quote = null;
          }
        }
        continue;
      }

      if (character === "'" || character === '"' || character === "`") {
        quote = character;
        continue;
      }

      if (character === ";") {
        const statement = sqlContent.slice(statementStart, index).trim();
        if (statement) statements.push(statement);
        statementStart = index + 1;
      }
    }

    const trailingStatement = sqlContent.slice(statementStart).trim();
    if (trailingStatement) statements.push(trailingStatement);
    return statements;
  }

  static getOrderedMigrations(
    journal: MigrationJournal,
    sqlModules: Record<string, string>
  ): MigrationEntry[] {
    const sqlByTag = new Map<string, string>();
    const downSqlByTag = new Map<string, string>();
    for (const [modulePath, sqlContent] of Object.entries(sqlModules)) {
      const fileName = modulePath.split("/").pop();
      if (!fileName || !fileName.endsWith(".sql")) continue;
      const tag = fileName.replace(".sql", "");
      if (!tag) continue;
      if (tag.endsWith(".down")) {
        downSqlByTag.set(tag.slice(0, -".down".length), sqlContent);
        continue;
      }
      sqlByTag.set(tag, sqlContent);
    }

    const orderedJournalEntries = [...(journal.entries ?? [])].sort(
      (left, right) => left.idx - right.idx
    );

    return orderedJournalEntries
      .map(entry => {
        const sqlContent = sqlByTag.get(entry.tag);
        if (!sqlContent) {
          throw new Error(
            `missing local migration SQL file for tag "${entry.tag}" in packages/api/local/migrations`
          );
        }

        const [prefix] = entry.tag.split("_");
        const versionNumber =
          prefix && /^\d+$/.test(prefix) ? Number(prefix) : -1;
        const downSql = downSqlByTag.get(entry.tag);
        return {
          idx: entry.idx,
          tag: entry.tag,
          versionNumber,
          sqlContent,
          statements: Migrator.splitSqlStatements(sqlContent),
          downStatements: downSql
            ? Migrator.splitSqlStatements(downSql)
            : undefined,
        };
      })
      .map((migration, index) => {
        if (migration.idx !== index || migration.versionNumber !== index) {
          throw new Error(
            `local migration entries must be contiguous: expected index ${index} and version ${String(index).padStart(4, "0")}, got index ${migration.idx} and "${migration.tag}"`
          );
        }
        return migration;
      });
  }

  private runningMigrationPromise: Promise<MigrationResult> | null = null;

  constructor(
    private readonly client: MigratorClient,
    private readonly migrations: MigrationEntry[] | null = null
  ) {}

  private static parseVersion(version: number | null | undefined): number {
    if (version === null || version === undefined) return 0;
    if (!Number.isFinite(version)) return 0;
    return Math.max(0, Math.trunc(version));
  }

  private async runStatements(
    statements: string[],
    targetVersion: number,
    expectedVersion?: number
  ): Promise<void> {
    await this.client.transaction(async transaction => {
      if (expectedVersion !== undefined) {
        const result = await transaction.run("PRAGMA user_version");
        const row = Array.isArray(result) ? result[0] : undefined;
        const persistedVersion = Migrator.parseVersion(
          Number(
            row !== null && typeof row === "object"
              ? (row as { user_version?: unknown }).user_version
              : undefined
          )
        );
        if (persistedVersion !== expectedVersion) {
          throw new Error(
            `local database version ${persistedVersion} does not match expected version ${expectedVersion}`
          );
        }
      }
      for (const statement of statements) {
        // sqlocal cannot bind placeholders in generated migration files, so
        // static partial-index predicates are replaced here. The SQL files
        // themselves stay unchanged.
        await transaction.run(
          statement
            .replace(/("UserTable"\."is_logged_in")\s*=\s*\?/g, "$1 = 1")
            .replace(
              /("UsersToShelvesTable"\."permission")\s*=\s*\?/g,
              "$1 = 'Owner'"
            )
            .replace(
              /("UsersToStationsTable"\."permission")\s*=\s*\?/g,
              "$1 = 'Owner'"
            )
        );
      }

      await transaction.run(`PRAGMA user_version = ${targetVersion}`);
      const result = await transaction.run("PRAGMA user_version");
      const row = Array.isArray(result) ? result[0] : undefined;
      const persistedVersion = Migrator.parseVersion(
        Number(
          row !== null && typeof row === "object"
            ? (row as { user_version?: unknown }).user_version
            : undefined
        )
      );
      if (persistedVersion !== targetVersion) {
        throw new Error(
          `local database migration stopped at version ${persistedVersion}; expected ${targetVersion}.`
        );
      }
    });
  }

  async bootstrapCurrentSchema(
    sqlContent: string,
    targetVersion: number,
    tag = "bootstrap-current"
  ): Promise<MigrationResult> {
    const safeTargetVersion = Migrator.parseVersion(targetVersion);
    await this.runStatements(
      Migrator.splitSqlStatements(sqlContent),
      safeTargetVersion
    );

    return { appliedTags: [tag], finalVersion: safeTargetVersion };
  }

  // user_version is one past the last migration's versionNumber because SQLite
  // starts that pragma at 0.
  getLatestMigrationVersion(): number {
    const orderedMigrations = this.migrations ?? [];
    const latestMigration = orderedMigrations[orderedMigrations.length - 1];
    if (!latestMigration) return 0;
    return latestMigration.versionNumber + 1;
  }

  async ensure(options?: {
    currentVersion?: number | null;
    targetVersion?: number | null;
  }): Promise<MigrationResult> {
    if (this.runningMigrationPromise) return this.runningMigrationPromise;

    this.runningMigrationPromise = (async () => {
      const orderedMigrations = this.migrations ?? [];
      const currentVersionNumber = Migrator.parseVersion(
        options?.currentVersion
      );
      const targetVersionNumber =
        options?.targetVersion === undefined || options?.targetVersion === null
          ? Number.POSITIVE_INFINITY
          : Migrator.parseVersion(options.targetVersion);

      if (currentVersionNumber > targetVersionNumber) {
        throw new Error(
          `local database version ${currentVersionNumber} is newer than target version ${targetVersionNumber}`
        );
      }

      const pendingMigrations = orderedMigrations.filter(migration => {
        const migrationVersion = migration.versionNumber + 1;
        if (migrationVersion <= currentVersionNumber) return false;
        if (migrationVersion > targetVersionNumber) return false;
        return true;
      });

      const appliedTags: string[] = [];
      for (const migration of pendingMigrations) {
        await this.runStatements(
          migration.statements,
          migration.versionNumber + 1
        );
        appliedTags.push(migration.tag);
      }

      const finalVersionNumber =
        pendingMigrations.length > 0
          ? pendingMigrations[pendingMigrations.length - 1].versionNumber + 1
          : currentVersionNumber;

      return {
        appliedTags,
        finalVersion: finalVersionNumber,
      };
    })().finally(() => {
      this.runningMigrationPromise = null;
    });

    return this.runningMigrationPromise;
  }

  async down(currentVersion: number): Promise<MigrationResult> {
    const orderedMigrations = this.migrations ?? [];
    const migration = orderedMigrations[currentVersion - 1];
    if (!migration || !migration.downStatements) {
      throw new Error(`no local down migration for version ${currentVersion}`);
    }

    await this.runStatements(
      migration.downStatements,
      currentVersion - 1,
      currentVersion
    );
    return { appliedTags: [migration.tag], finalVersion: currentVersion - 1 };
  }
}
