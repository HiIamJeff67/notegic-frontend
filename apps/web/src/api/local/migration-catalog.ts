import localMigrationJournal from "./migrations/meta/_journal.json";
import { splitSqlStatements, type MigrationEntry } from "./migrator";

const migrationSqlModules = import.meta.glob("./migrations/*.sql", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

export const getOrderedMigrations = (): MigrationEntry[] => {
  const sqlByTag = new Map<string, string>();
  for (const [path, sqlContent] of Object.entries(migrationSqlModules)) {
    const fileName = path.split("/").pop();
    if (!fileName || !fileName.endsWith(".sql")) continue;
    const tag = fileName.replace(".sql", "");
    if (!tag) continue;
    sqlByTag.set(tag, sqlContent);
  }

  const journalEntries = (localMigrationJournal.entries ?? []) as {
    idx: number;
    tag: string;
  }[];

  const orderedJournalEntries = [...journalEntries].sort(
    (a, b) => a.idx - b.idx
  );

  return orderedJournalEntries
    .map(entry => {
      const sqlContent = sqlByTag.get(entry.tag);
      if (!sqlContent) {
        throw new Error(
          `missing local migration SQL file for tag "${entry.tag}" in apps/web/src/api/local/migrations`
        );
      }

      const [prefix] = entry.tag.split("_");
      const versionNumber =
        prefix && /^\d+$/.test(prefix) ? Number(prefix) : -1;
      return {
        idx: entry.idx,
        tag: entry.tag,
        versionNumber,
        sqlContent,
        statements: splitSqlStatements(sqlContent),
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
};
