import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";

const versions =
  "# Versions\n\n## 1.2.3 — Current\n\nAn existing release.\n\n- [x] **First feature**\n  Its description.\n\n- [ ] **Next feature**\n  More work.\n";
const privacy =
  "# Privacy and policy\n\nLast updated: March 9, 2026\n\n## 1. Contact {#privacy-contact}\n\nContact [{{contactEmail}}](mailto:{{contactEmail}}).\n\n> Keep your account information private.\n\n[View EULA](/eula)\n";
const outputs = [
  "versions/generated.ts",
  "versions/VersionsContent.tsx",
  "privacy-policy/PrivacyPolicyContent.tsx",
  "privacy-policy/generated.ts",
];

function fixture(t) {
  const root = fs.mkdtempSync(
    path.join(os.tmpdir(), "notegic-document-sections-")
  );
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.symlinkSync(
    fileURLToPath(new URL("../node_modules", import.meta.url)),
    path.join(root, "node_modules"),
    "dir"
  );
  const script = path.join(root, "scripts/generateDocumentSections.mjs");
  fs.mkdirSync(path.dirname(script), { recursive: true });
  fs.copyFileSync(
    fileURLToPath(new URL("./generateDocumentSections.mjs", import.meta.url)),
    script
  );
  const directory = path.join(root, "apps/web/src/pages/document");
  fs.mkdirSync(directory, { recursive: true });
  fs.mkdirSync(path.join(directory, "versions/sources"), { recursive: true });
  fs.mkdirSync(path.join(directory, "privacy-policy/sources"), {
    recursive: true,
  });
  fs.writeFileSync(
    path.join(directory, "versions/sources/versions.md"),
    versions
  );
  fs.writeFileSync(
    path.join(directory, "privacy-policy/sources/privacy-policy.md"),
    privacy
  );
  for (const name of outputs) {
    const target = path.join(directory, name);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, "previous output");
  }
  return { script, directory };
}

function run(input) {
  return spawnSync(process.execPath, [input.script], {
    cwd: os.tmpdir(),
    encoding: "utf8",
  });
}

test("generates checked tasks, stable anchors and runtime contact links from page-local Markdown", t => {
  const input = fixture(t);
  const result = run(input);
  assert.equal(result.status, 0, result.stderr);
  const data = fs.readFileSync(path.join(input.directory, outputs[0]), "utf8");
  const context = { exports: {} };
  vm.runInNewContext(
    ts.transpileModule(data, {
      compilerOptions: { module: ts.ModuleKind.CommonJS },
    }).outputText,
    context
  );
  assert.equal(context.exports.versionRoadmap[0].version, "1.2.3");
  assert.equal(context.exports.versionRoadmap[0].status, "current");
  assert.equal(context.exports.versionRoadmap[0].tasks[0].completed, true);
  assert.equal(context.exports.versionRoadmap[0].tasks[1].completed, false);
  assert.equal(
    context.exports.versionRoadmap[0].tasks[0].description,
    "Its description."
  );
  const component = fs.readFileSync(
    path.join(input.directory, outputs[1]),
    "utf8"
  );
  assert.ok(component.includes("<VersionCard version={version}"));
  const policy = fs.readFileSync(
    path.join(input.directory, outputs[2]),
    "utf8"
  );
  assert.ok(policy.includes('"privacy-contact"'));
  assert.ok(policy.includes("import.meta.env.VITE_CONTACT_EMAIL"));
  assert.ok(policy.includes('href={"mailto:" + contactEmail}'));
  assert.ok(policy.includes("<ArticleLink"));
  assert.ok(policy.includes('href="/eula"'));
  assert.ok(!policy.includes("dangerouslySetInnerHTML"));
  const first = outputs.map(name =>
    fs.readFileSync(path.join(input.directory, name), "utf8")
  );
  assert.equal(run(input).status, 0);
  assert.deepEqual(
    outputs.map(name =>
      fs.readFileSync(path.join(input.directory, name), "utf8")
    ),
    first
  );
});

for (const [label, file, text] of [
  [
    "unknown release state",
    "versions/sources/versions.md",
    versions.replace("Current", "Other"),
  ],
  [
    "missing feature checkboxes",
    "versions/sources/versions.md",
    versions.replace("[x] ", ""),
  ],
  [
    "duplicate releases",
    "versions/sources/versions.md",
    versions + versions.slice(versions.indexOf("## ")),
  ],
  [
    "privacy HTML",
    "privacy-policy/sources/privacy-policy.md",
    privacy + '\n<script>alert("unsafe")</script>\n',
  ],
  [
    "unsafe privacy links",
    "privacy-policy/sources/privacy-policy.md",
    privacy.replace("/eula", "javascript:alert(1)"),
  ],
  [
    "duplicate privacy anchors",
    "privacy-policy/sources/privacy-policy.md",
    privacy + privacy.slice(privacy.indexOf("## ")),
  ],
  [
    "missing privacy anchors",
    "privacy-policy/sources/privacy-policy.md",
    privacy.replace(" {#privacy-contact}", ""),
  ],
]) {
  test(`rejects ${label} without overwriting any output`, t => {
    const input = fixture(t);
    fs.writeFileSync(path.join(input.directory, file), text);
    assert.notEqual(run(input).status, 0);
    for (const output of outputs)
      assert.equal(
        fs.readFileSync(path.join(input.directory, output), "utf8"),
        "previous output"
      );
  });
}
