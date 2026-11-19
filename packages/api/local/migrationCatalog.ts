import migrationJournal from "./migrations/meta/_journal.json";

export { migrationJournal };

export const migrationSqlModules = import.meta.glob("./migrations/*.sql", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;
