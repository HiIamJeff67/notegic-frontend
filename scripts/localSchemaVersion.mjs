import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const journalPath = path.join(
  root,
  "packages/api/local/migrations/meta/_journal.json"
);
const headPath = path.join(root, "packages/api/local/schemaHead.ts");
const appVersions = {
  web: path.join(root, "apps/web/src/api/local/schemaVersion.ts"),
  desktop: path.join(root, "apps/desktop/sidecars/driver/schemaVersion.ts"),
};

const readVersion = file => {
  const match = readFileSync(file, "utf8").match(
    /export const localSchema(?:Head|Version) = (\d+);/
  );
  if (!match) throw new Error(`missing schema version in ${file}`);
  return Number(match[1]);
};

const writeVersion = (file, version) => {
  const source = readFileSync(file, "utf8");
  const next = source.replace(
    /export const localSchema(?:Head|Version) = \d+;/,
    match => match.replace(/\d+/, String(version))
  );
  writeFileSync(file, next);
};

const journal = JSON.parse(readFileSync(journalPath, "utf8"));
const last = journal.entries[journal.entries.length - 1];
const head = Number(last.tag.split("_")[0]) + 1;
const selected = new Set();
let writeHead = false;

for (const arg of process.argv.slice(2)) {
  if (arg === "--write-head") {
    writeHead = true;
    continue;
  }
  if (arg.startsWith("--set=")) {
    for (const name of arg.slice("--set=".length).split(",")) {
      if (!appVersions[name]) throw new Error(`unknown app ${name}`);
      selected.add(name);
    }
    continue;
  }
  throw new Error(`unknown argument ${arg}`);
}

if (writeHead) writeVersion(headPath, head);
for (const name of selected) writeVersion(appVersions[name], head);

const recordedHead = readVersion(headPath);
console.log(`shared head ${head} (${last.tag})`);
console.log(`schemaHead.ts ${recordedHead}`);
for (const [name, file] of Object.entries(appVersions)) {
  console.log(`${name} ${readVersion(file)}`);
}
if (recordedHead !== head) {
  console.log("schemaHead.ts is behind the journal. Re-run with --write-head.");
  process.exitCode = 1;
}
