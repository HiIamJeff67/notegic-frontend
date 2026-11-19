import migrationJournal from "./migrations/meta/_journal.json";

export type MigrationJournal = {
  entries?: { idx: number; tag: string }[];
};

export { migrationJournal as MigrationJournal };

export const migrationSqlModules = import.meta.glob("./migrations/*.sql", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;
