import { readdirSync } from "node:fs";
import { basename, dirname, join } from "node:path";

test("test filenames use their location and source owner without redundant categories", () => {
  const violations: string[] = [];
  for (const directory of [
    "apps/web/src",
    "shared",
    "apps/web/test",
    "test",
    "scripts",
  ]) {
    const files = readdirSync(join(process.cwd(), directory), {
      recursive: true,
      encoding: "utf8",
    });
    for (const file of files) {
      if (!/\.test\.(?:tsx?|mjs)$/.test(file)) continue;
      if (/\.(?:unit|integration)\.test\./.test(file))
        violations.push(`${directory}/${file}`);
      if (directory !== "apps/web/src" && directory !== "shared") continue;
      const name = basename(file).replace(/\.test\.(?:tsx?|mjs)$/, "");
      const neighbors = readdirSync(
        join(process.cwd(), directory, dirname(file))
      );
      const owner = neighbors.find(
        candidate =>
          /\.(?:tsx?|mjs)$/.test(candidate) &&
          candidate.replace(/\.(?:tsx?|mjs)$/, "").toLowerCase() ===
            name.toLowerCase()
      );
      if (owner && owner.replace(/\.(?:tsx?|mjs)$/, "") !== name) {
        violations.push(`${directory}/${file}: match ${owner}`);
      }
    }
  }
  expect(violations).toEqual([]);
});

test.each([
  "shared",
  "apps/web/src",
  "apps/web/server",
  "apps/web/test",
  "test",
  "scripts",
])("%s has no ungoverned kebab-case code filenames", directory => {
  const files = readdirSync(join(process.cwd(), directory), {
    recursive: true,
    encoding: "utf8",
  }).filter(file => /\.(?:tsx?|mjs|js)$/.test(file));
  expect(files.length).toBeGreaterThan(0);
  expect(
    files.filter(file => {
      const fullPath = `${directory}/${file}`;
      if (
        /\/(?:generated|migrations)\//.test(fullPath) ||
        fullPath.startsWith("apps/web/src/routes/") ||
        fullPath.startsWith("apps/web/src/components/ui/") ||
        /\/i18n\/locales\/[^/]+\.zh-(?:CN|TW)\.ts$/.test(fullPath)
      )
        return false;
      return basename(file).includes("-");
    })
  ).toEqual([]);
});

test("GraphQL query modules retain useSearch names", () => {
  const files = readdirSync(
    join(process.cwd(), "apps/web/src/api/graphql/hooks")
  );
  expect(files.length).toBeGreaterThan(0);
  expect(
    files.filter(
      file =>
        file !== "error.ts" && !/^useSearch[A-Z][a-zA-Z0-9]*\.ts$/.test(file)
    )
  ).toEqual([]);
});

test("API infrastructure respects roles and framework-reserved suffixes", () => {
  const files = readdirSync(join(process.cwd(), "apps/web/src/api")).filter(
    file => file.endsWith(".ts")
  );
  expect(files).toEqual(
    expect.arrayContaining([
      "apolloClient.ts",
      "websocketClient.ts",
      "clientHeaders.ts",
    ])
  );
  expect(
    files.filter(
      file => /\.(?:client|server)\.ts$/.test(file) || file.includes("-")
    )
  ).toEqual([]);
});
