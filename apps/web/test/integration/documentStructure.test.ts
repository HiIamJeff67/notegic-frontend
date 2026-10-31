import { readdirSync } from "node:fs";
import { join } from "node:path";

test("Document tabs keep sources, data and components in the approved flat layout", () => {
  const root = join(process.cwd(), "apps/web/src/pages/document");
  const tabs = ["api", "overview", "privacy-policy", "versions", "website"];
  expect(readdirSync(root).sort()).toEqual(
    ["DocumentPage.tsx", ...tabs].sort()
  );
  for (const tab of tabs) {
    for (const entry of readdirSync(join(root, tab), { withFileTypes: true })) {
      if (entry.isDirectory()) {
        expect(entry.name).toBe("sources");
        for (const source of readdirSync(join(root, tab, entry.name), {
          withFileTypes: true,
        })) {
          expect(source.isFile()).toBe(true);
          expect(
            source.name === "README.md" || /\.(md|json)$/.test(source.name)
          ).toBe(true);
        }
      } else {
        expect(
          entry.name === "generated.ts" ||
            /^[A-Z][A-Za-z0-9]*\.tsx$/.test(entry.name)
        ).toBe(true);
      }
    }
  }
  expect(readdirSync(join(root, "api/sources")).sort()).toEqual(
    [
      "@authentication.md",
      "@http-contract.md",
      "@openapi.json",
      "@origins-and-security.md",
      "@rate-limits-and-retries.md",
      "@versioning.md",
      "README.md",
    ].sort()
  );
});
