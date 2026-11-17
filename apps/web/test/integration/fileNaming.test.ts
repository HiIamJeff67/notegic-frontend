import { existsSync, readdirSync } from "node:fs";
import { basename, dirname, join } from "node:path";

const testCategories = new Set([
  "architecture",
  "boundary",
  "compatibility",
  "integration",
  "load",
  "release",
  "smoke",
  "e2e",
  "performance",
]);

test("test filenames use their location and source owner without redundant categories", () => {
  const violations: string[] = [];
  for (const directory of [
    "apps/web/test",
    "apps/desktop/test",
    "shared/test",
    "test",
    "scripts",
  ]) {
    if (!existsSync(join(process.cwd(), directory))) continue;
    const files = readdirSync(join(process.cwd(), directory), {
      recursive: true,
      encoding: "utf8",
    });
    for (const file of files) {
      if (file.startsWith("results/")) continue;
      if (!/\.(?:test|spec)\.(?:tsx?|mjs)$/.test(file)) continue;
      if (/\.(?:unit|integration)\.test\./.test(file))
        violations.push(`${directory}/${file}`);
      if (directory === "scripts") continue;
      const category = file.split(/[\\/]/)[0];
      if (!testCategories.has(category))
        violations.push(`${directory}/${file}`);
      if (category === "release" && directory !== "apps/desktop/test")
        violations.push(`${directory}/${file}: release`);
      if (/\.spec\.(?:tsx?|mjs)$/.test(file) && category !== "e2e")
        violations.push(`${directory}/${file}: spec`);
      if (/\.performance\.test\./.test(file) !== (category === "performance"))
        violations.push(`${directory}/${file}: performance`);
    }
  }
  for (const directory of ["apps/web/src", "shared", "apps/desktop/src"]) {
    const files = readdirSync(join(process.cwd(), directory), {
      recursive: true,
      encoding: "utf8",
    });
    for (const file of files) {
      if (directory === "shared" && file.startsWith("test/")) continue;
      if (!/\.test\.(?:tsx?|mjs)$/.test(file)) continue;
      const name = basename(file).replace(/\.test\.(?:tsx?|mjs)$/, "");
      const neighbors = readdirSync(
        join(process.cwd(), directory, dirname(file))
      );
      const owner = neighbors.find(
        candidate =>
          /\.(?:tsx?|mjs)$/.test(candidate) &&
          !/\.test\.(?:tsx?|mjs)$/.test(candidate) &&
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
  "apps/desktop/src",
  "apps/desktop/test",
  "apps/desktop/sidecars",
  "scripts",
])("%s has no ungoverned kebab-case code filenames", directory => {
  const files = readdirSync(join(process.cwd(), directory), {
    recursive: true,
    encoding: "utf8",
  }).filter(
    file => !file.startsWith("results/") && /\.(?:tsx?|mjs|js)$/.test(file)
  );
  expect(files.length).toBeGreaterThan(0);
  expect(
    files.filter(file => {
      const fullPath = `${directory}/${file}`;
      if (
        /\/(?:generated|migrations)\//.test(fullPath) ||
        fullPath.endsWith("/vite-env.d.ts") ||
        fullPath.startsWith("apps/web/src/routes/") ||
        fullPath.startsWith("shared/components/ui/") ||
        /\/i18n\/locales\/[^/]+\.zh-(?:CN|TW)\.ts$/.test(fullPath)
      )
        return false;
      return basename(file).includes("-");
    })
  ).toEqual([]);
});

test("GraphQL query modules retain useSearch names", () => {
  const files = readdirSync(
    join(process.cwd(), "apps/web/src/api/hooks/graphql")
  ).filter(file => file.endsWith(".ts") && !file.endsWith(".test.ts"));
  expect(files.length).toBeGreaterThan(0);
  expect(
    files.filter(
      file =>
        file !== "localSearch.hook.ts" &&
        !/^useSearch[A-Z][a-zA-Z0-9]*\.ts$/.test(file)
    )
  ).toEqual([]);
});

test("API infrastructure respects roles and framework-reserved suffixes", () => {
  const files = readdirSync(join(process.cwd(), "apps/web/src/api")).filter(
    file => file.endsWith(".ts")
  );
  expect(files).toEqual(
    expect.arrayContaining(["apolloClient.ts", "websocketClient.ts"])
  );
  expect(
    files.filter(
      file => /\.(?:client|server)\.ts$/.test(file) || file.includes("-")
    )
  ).toEqual([]);
});
