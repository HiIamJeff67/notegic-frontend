import { readFileSync } from "node:fs";
import path from "node:path";
import { localSchemaHead } from "./schemaHead";

test("the catalog head matches the last migration version", () => {
  const journal = JSON.parse(
    readFileSync(path.join(__dirname, "migrations/meta/_journal.json"), "utf8")
  ) as { entries: { tag: string }[] };
  const last = journal.entries[journal.entries.length - 1];
  const version = Number(last.tag.split("_")[0]) + 1;
  expect(version).toBe(localSchemaHead);
});
