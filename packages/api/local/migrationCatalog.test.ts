import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { Migrator } from "./migrator";

test("0007_outbox_status rolls back its columns and keeps queued rows", () => {
  const migrationsDir = path.join(__dirname, "migrations");
  const journal = JSON.parse(
    readFileSync(path.join(migrationsDir, "meta/_journal.json"), "utf8")
  ) as { entries: { idx: number; tag: string }[] };
  const sqlModules = Object.fromEntries(
    readdirSync(migrationsDir)
      .filter(fileName => fileName.endsWith(".sql"))
      .map(fileName => [
        `./migrations/${fileName}`,
        readFileSync(path.join(migrationsDir, fileName), "utf8"),
      ])
  );
  const outbox = Migrator.getOrderedMigrations(journal, sqlModules).find(
    migration => migration.tag === "0007_outbox_status"
  );

  expect(outbox?.downStatements).toEqual([
    "ALTER TABLE `TransactionTable` DROP COLUMN `depends_on_sequence`",
    "ALTER TABLE `TransactionTable` DROP COLUMN `status`",
  ]);
});
