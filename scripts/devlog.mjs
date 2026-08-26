import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, sep } from "node:path";

const startMarker = "<!-- DEVLOG:START -->";
const endMarker = "<!-- DEVLOG:END -->";
const root = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();

function git(args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" });
}

function printHelp() {
  console.log(`Generate deterministic devlog snapshots from local Git history.

Usage:
  npm run devlog
  npm run devlog:fetch
  npm run devlog:backfill
  node scripts/devlog.mjs
  node scripts/devlog.mjs --backfill --ref origin/main

Options:
  --backfill            Generate one snapshot for every commit date in the ref
  --ref <ref>           Git ref to read (default: HEAD)
  --help                Show this help

Environment:
  DEVLOG_COMMITS        Number of recent commits for a daily snapshot (default: 20)
  DEVLOG_ARCHIVE_DIR    Override the archive directory (default: docs/devlogs)

The fetch command only updates local remote refs. It does not merge or modify
the working tree. The backfill command reads the fetched ref and creates
YYYY-MM-DD snapshots for its historical commit dates.
`);
}

function parseArgs(args) {
  const options = { backfill: false, ref: "HEAD" };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }
    if (arg === "--backfill") {
      options.backfill = true;
      continue;
    }
    if (arg === "--ref") {
      options.ref = args[index + 1];
      index += 1;
      if (!options.ref) {
        throw new Error("--ref requires a Git ref");
      }
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }
  return options;
}

function getCommitRecords(ref) {
  const output = git([
    "log",
    "--date=short",
    "--pretty=format:COMMIT%x1f%H%x1f%ad%x1f%h%x1f%s",
    "--name-only",
    ref,
  ]);
  const records = [];
  let current;

  for (const line of output.split(/\r?\n/)) {
    if (line.startsWith("COMMIT\x1f")) {
      const [, hash, date, shortHash, subject] = line.split("\x1f");
      current = { hash, date, shortHash, subject, files: [] };
      records.push(current);
      continue;
    }
    if (current && line.trim()) {
      current.files.push(line.trim());
    }
  }

  return records;
}

function localDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatCommits(records) {
  return records.length > 0
    ? records.map(({ shortHash, date, subject }) => `- \`${shortHash}\` ${date} — ${subject}`).join("\n")
    : "- No commits found.";
}

function formatChangedAreas(records) {
  const counts = new Map();
  for (const record of records) {
    for (const file of record.files) {
      const area = file.split("/")[0] ?? file;
      counts.set(area, (counts.get(area) ?? 0) + 1);
    }
  }

  const areas = [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .map(([area, count]) => `- \`${area}\` — ${count} changed-file references`);

  return areas.length > 0 ? areas.join("\n") : "- No changed-file information found.";
}

function getRecentSnapshots(archiveDir) {
  if (!existsSync(archiveDir)) {
    return [];
  }

  const snapshots = [];
  for (const month of readdirSync(archiveDir, { withFileTypes: true })) {
    if (!month.isDirectory() || !/^\d{4}-\d{2}$/.test(month.name)) {
      continue;
    }
    for (const file of readdirSync(join(archiveDir, month.name))) {
      if (/^\d{4}-\d{2}-\d{2}\.md$/.test(file)) {
        snapshots.push(join(archiveDir, month.name, file));
      }
    }
  }

  return snapshots.sort((left, right) => right.localeCompare(left)).slice(0, 5);
}

function refreshReadme(archiveDir) {
  const readmePath = join(root, "README.md");
  const readme = readFileSync(readmePath, "utf8");
  const start = readme.indexOf(startMarker);
  const end = readme.indexOf(endMarker);
  if (start < 0 || end < start) {
    throw new Error(
      "README.md is missing DEVLOG markers. Add DEVLOG:START and DEVLOG:END around the generated section.",
    );
  }

  const links = getRecentSnapshots(archiveDir)
    .map((file) => {
      const archiveRelative = relative(root, file).split(sep).join("/");
      const name = archiveRelative.replace(/^docs\/devlogs\//, "").replace(/\.md$/, "");
      return `- [${name}](${archiveRelative})`;
    })
    .join("\n");
  const section = [
    "## Development log",
    "",
    "This section is automatically maintained from recent local Git history. Detailed intent belongs in commit messages and design documents.",
    "",
    "### Recent snapshots",
    "",
    links || "- No generated snapshots found.",
  ].join("\n");

  writeFileSync(readmePath, `${readme.slice(0, start)}${startMarker}\n${section}\n${readme.slice(end)}`);
}

function writeSnapshot(archiveDir, date, records, description) {
  const archiveFile = join(archiveDir, date.slice(0, 7), `${date}.md`);
  mkdirSync(dirname(archiveFile), { recursive: true });
  writeFileSync(
    archiveFile,
    [
      `# Development log — ${date}`,
      "",
      description,
      "",
      "## Recent commits",
      "",
      formatCommits(records),
      "",
      "## Changed areas",
      "",
      formatChangedAreas(records),
      "",
      "## Regeneration",
      "",
      "Run `npm run devlog` or `node scripts/devlog.mjs` from the repository root. The snapshot reads local Git history and does not call GitHub or an AI service.",
      "",
    ].join("\n"),
  );
  return archiveFile;
}

const options = parseArgs(process.argv.slice(2));
const archiveDir = process.env.DEVLOG_ARCHIVE_DIR ?? join(root, "docs", "devlogs");
const records = getCommitRecords(options.ref);

if (options.backfill) {
  const recordsByDate = new Map();
  for (const record of records) {
    const dateRecords = recordsByDate.get(record.date) ?? [];
    dateRecords.push(record);
    recordsByDate.set(record.date, dateRecords);
  }

  for (const [date, dateRecords] of recordsByDate) {
    writeSnapshot(
      archiveDir,
      date,
      dateRecords,
      `This snapshot is generated from ${dateRecords.length} commit${dateRecords.length === 1 ? "" : "s"} dated ${date} in Git ref \`${options.ref}\`. It is a deterministic repository summary; detailed intent belongs in commit messages and design documents.`,
    );
  }

  refreshReadme(archiveDir);
  console.log(`Backfilled ${recordsByDate.size} daily snapshots from ${options.ref} and refreshed README.md`);
} else {
  const commitLimitValue = process.env.DEVLOG_COMMITS ?? "20";
  const commitLimit = Number(commitLimitValue);
  if (!Number.isInteger(commitLimit) || commitLimit < 1) {
    throw new Error("DEVLOG_COMMITS must be a positive integer");
  }

  const today = localDate();
  const latestRecords = records.slice(0, commitLimit);
  const archiveFile = writeSnapshot(
    archiveDir,
    today,
    latestRecords,
    `This snapshot is generated from the latest ${commitLimit} Git commits in ref \`${options.ref}\`. It is a deterministic repository summary; detailed intent belongs in commit messages and design documents.`,
  );
  refreshReadme(archiveDir);
  console.log(`Generated ${relative(root, archiveFile)} from ${options.ref} and refreshed README.md`);
}
