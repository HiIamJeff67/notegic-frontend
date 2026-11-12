import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const sourceRoot = path.join(__dirname);

const sourceFiles = (directory: string): string[] =>
  readdirSync(directory).flatMap(entry => {
    const file = path.join(directory, entry);
    if (statSync(file).isDirectory()) return sourceFiles(file);
    if (file.endsWith(".test.ts") || file.endsWith(".test.tsx")) return [];
    return file.endsWith(".ts") || file.endsWith(".tsx") ? [file] : [];
  });

describe("desktop shell boundary", () => {
  it("does not boot the web server runtime", () => {
    const violations = sourceFiles(sourceRoot).flatMap(file => {
      const source = readFileSync(file, "utf8");
      const markers = [
        "@tanstack/react-start",
        "nitro",
        "sqlocal",
        "apps/web/src/api/functions",
      ];
      return markers
        .filter(marker => source.includes(marker))
        .map(marker => `${path.relative(sourceRoot, file)}: ${marker}`);
    });

    expect(violations).toEqual([]);
  });
});
