import { readdirSync } from "node:fs";
import { basename, join } from "node:path";

test("test filenames use their location and source owner without redundant categories", () => {
  const violations: string[] = [];
  for (const directory of [
    "apps/web/test",
    "apps/desktop/test",
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
    }
  }
  for (const directory of [
    "apps/web/src",
    "apps/web/server",
    "apps/desktop/src",
    "apps/desktop/sidecar",
    "shared",
  ]) {
    const files = readdirSync(join(process.cwd(), directory), {
      recursive: true,
      encoding: "utf8",
    });
    for (const file of files) {
      if (/\.test\.(?:tsx?|mjs)$/.test(file))
        violations.push(`${directory}/${file}`);
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
  "apps/desktop/sidecar",
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
  ).filter(file => file.endsWith(".ts"));
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
