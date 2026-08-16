import fssync from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const INPUT_JSON = path.resolve("LICENSES/third_party_licenses.json");
const OUT_DIR = path.resolve("LICENSES/third_party");
const NOTICES_PATH = path.resolve("LICENSES/THIRD_PARTY_NOTICES.txt");

const INTERNAL_PREFIXES = ["@notegic/"];

const CANDIDATE_NAMES = [
  "LICENSE",
  "LICENSE.md",
  "LICENSE.txt",
  "LICENCE",
  "LICENCE.md",
  "LICENCE.txt",
  "COPYING",
  "COPYING.md",
  "COPYING.txt",
  "NOTICE",
  "NOTICE.md",
  "NOTICE.txt",
  "README",
  "README.md",
  "README.txt",
];

async function readJson(file) {
  const raw = await fs.readFile(file, "utf8");
  return JSON.parse(raw);
}

function isInternal(entryKey, meta) {
  const name = entryKey.split("@")[0] || entryKey;
  const isUnlicensed = String(meta.licenses || "")
    .toUpperCase()
    .includes("UNLICENSED");
  const isPrivate = Boolean(meta.private);
  const matchesPrefix = INTERNAL_PREFIXES.some(
    p => entryKey.startsWith(p) || name.startsWith(p)
  );
  const isRootProject = path.resolve(meta.path) === path.resolve(".");
  return isUnlicensed || isPrivate || matchesPrefix || isRootProject;
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function findLicenseFile(pkgDir) {
  if (!pkgDir) return null;

  let entries = [];
  try {
    entries = await fs.readdir(pkgDir);
  } catch {
    return null;
  }
  const lowerSet = new Map(entries.map(n => [n.toLowerCase(), n]));
  for (const cand of CANDIDATE_NAMES) {
    const actual = lowerSet.get(cand.toLowerCase());
    if (actual) {
      const full = path.join(pkgDir, actual);
      if (fssync.existsSync(full) && fssync.statSync(full).isFile()) {
        return full;
      }
    }
  }
  return null;
}

function sanitizeFolderName(key) {
  return key.replace(/\//g, "__");
}

async function copyLicense(src, dstDir) {
  await ensureDir(dstDir);
  const base = path.basename(src);
  const dst = path.join(dstDir, base);
  await fs.copyFile(src, dst);
  return dst;
}

function summarizeLine(key, meta, copiedPathRel, note = "") {
  const lic = meta.licenses || "UNKNOWN";
  const repo = meta.repository || "n/a";
  const pub = meta.publisher ? ` — publisher: ${meta.publisher}` : "";
  const copied = copiedPathRel
    ? ` — copied: ${copiedPathRel}`
    : " — copied: n/a";
  const extra = note ? ` — ${note}` : "";
  return `- ${key} — ${lic} — repo: ${repo}${pub}${copied}${extra}`;
}

async function main() {
  const data = await readJson(INPUT_JSON);
  await ensureDir(OUT_DIR);

  const lines = [];
  const header = [
    "Third-Party Notices for Notegic Frontend",
    "This product includes software developed by third parties.",
    "The full license texts are copied under the LICENSES/third_party directory where available.",
    "For licenses requiring NOTICE, any available NOTICE/README has also been copied if present.",
    "",
  ];
  lines.push(...header);

  const entries = Object.entries(data);
  let copiedCount = 0;
  let missingCount = 0;

  for (const [key, meta] of entries) {
    if (!meta || !meta.path) continue;
    if (isInternal(key, meta)) continue;

    const pkgDir = path.resolve(meta.path);
    let licensePath =
      meta.licenseFile && fssync.existsSync(meta.licenseFile)
        ? meta.licenseFile
        : await findLicenseFile(pkgDir);

    let copiedRel = "";
    let note = "";

    try {
      if (licensePath) {
        const dstDir = path.join(OUT_DIR, sanitizeFolderName(key));
        const dst = await copyLicense(licensePath, dstDir);
        copiedRel = path.relative(process.cwd(), dst);
        copiedCount++;
      } else {
        missingCount++;
        note = "NO LICENSE FILE FOUND";
      }
      lines.push(summarizeLine(key, meta, copiedRel, note));
    } catch (err) {
      missingCount++;
      lines.push(summarizeLine(key, meta, "", `ERROR: ${err.message}`));
    }
  }

  lines.push(
    "",
    `Total copied: ${copiedCount}`,
    `Missing/Errors: ${missingCount}`,
    ""
  );

  await fs.writeFile(NOTICES_PATH, lines.join("\n"), "utf8");

  console.log(
    `Done. Copied ${copiedCount} license files to ${path.relative(
      process.cwd(),
      OUT_DIR
    )}.`
  );
  console.log(
    `Wrote summary to ${path.relative(process.cwd(), NOTICES_PATH)}.`
  );
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
