import { readdirSync } from "node:fs";
import { basename, join } from "node:path";

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
        fullPath === "apps/web/src/hooks/use-toast.ts" ||
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
