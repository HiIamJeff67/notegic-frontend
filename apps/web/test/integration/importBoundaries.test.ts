import { existsSync, realpathSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import ts from "typescript";

test("project module imports and aliases stay inside the frontend repository", () => {
  const root = realpathSync(process.cwd());
  const config = ts.readConfigFile(
    resolve(root, "tsconfig.json"),
    ts.sys.readFile
  );
  const aliases = config.config.compilerOptions.paths as Record<
    string,
    string[]
  >;
  const sources = ts.sys.readDirectory(
    root,
    [".ts", ".tsx", ".js", ".mjs", ".cjs"],
    ["**/node_modules/**", "**/.output/**", "**/.nitro/**", "**/.git/**"],
    [
      "apps/web/src/**/*",
      "apps/web/server/**/*",
      "apps/web/test/**/*",
      "shared/**/*",
      "scripts/**/*",
      "test/**/*",
      "*.ts",
      "*.mjs",
      "*.cjs",
    ]
  );
  const violations: string[] = [];
  for (const name of ["tsconfig.json", "apps/web/tsconfig.json"]) {
    const file = resolve(root, name);
    const options = ts.readConfigFile(file, ts.sys.readFile).config
      .compilerOptions;
    for (const [alias, targets] of Object.entries(options.paths) as [
      string,
      string[],
    ][]) {
      for (const target of targets) {
        const path = relative(
          root,
          resolve(dirname(file), options.baseUrl, target)
        );
        if (isAbsolute(path) || path === ".." || path.startsWith("../"))
          violations.push(`${name} alias ${alias}: ${target}`);
      }
    }
  }
  for (const file of sources) {
    const text = ts.sys.readFile(file)!;
    for (const imported of ts.preProcessFile(text, true, true).importedFiles) {
      const specifier = imported.fileName.split(/[?#]/)[0];
      let target: string | undefined;
      if (specifier.startsWith("file:")) {
        violations.push(`${relative(root, file)}: ${specifier}`);
        continue;
      }
      if (specifier.startsWith(".") || isAbsolute(specifier)) {
        target = resolve(dirname(file), specifier);
      } else {
        for (const [alias, paths] of Object.entries(aliases)) {
          const prefix = alias.replace(/\*$/, "");
          if (specifier.startsWith(prefix)) {
            target = resolve(
              root,
              paths[0].replace("*", specifier.slice(prefix.length))
            );
            break;
          }
        }
      }
      if (!target) continue; // Bare imports are declared package dependencies or Node built-ins.
      const resolved = ts.resolveModuleName(
        target,
        file,
        { moduleResolution: ts.ModuleResolutionKind.Bundler },
        ts.sys
      ).resolvedModule?.resolvedFileName;
      const path = relative(
        root,
        resolved
          ? realpathSync(resolved)
          : existsSync(target)
            ? realpathSync(target)
            : target
      );
      if (isAbsolute(path) || path === ".." || path.startsWith("../"))
        violations.push(`${relative(root, file)}: ${imported.fileName}`);
    }
  }
  expect(sources.length).toBeGreaterThan(0);
  expect(violations).toEqual([]);
});
