import assert from "node:assert/strict";
import {
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  realpath,
  rm,
  symlink,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join, relative, resolve, sep } from "node:path";
import { createServer, loadConfigFromFile } from "vite";

const repository = process.cwd();
const temporary = await realpath(
  await mkdtemp(join(tmpdir(), "notegic-vite-cache-"))
);
const root = join(temporary, "apps/web");
const servers = [];
const configEnv = { command: "serve", mode: "development" };
let chunkPath;
let originalBytes;
let originalMetadata;

try {
  await mkdir(root, { recursive: true });
  await symlink(
    join(repository, "node_modules"),
    join(temporary, "node_modules"),
    "dir"
  );
  await copyFile(
    join(repository, "package.json"),
    join(temporary, "package.json")
  );
  await copyFile(
    join(repository, "apps/web/package.json"),
    join(root, "package.json")
  );
  await copyFile(
    join(repository, "apps/web/vite.config.ts"),
    join(root, "vite.config.ts")
  );
  await mkdir(join(temporary, "shared/lib/browser"), { recursive: true });
  await copyFile(
    join(repository, "shared/lib/browser/crossOriginIsolation.ts"),
    join(temporary, "shared/lib/browser/crossOriginIsolation.ts")
  );

  delete process.env.NOTEGIC_VITE_CACHE_DIR;
  const development = (
    await loadConfigFromFile(configEnv, join(root, "vite.config.ts"))
  ).config;
  const playwright = (
    await loadConfigFromFile(
      configEnv,
      join(repository, "playwright.config.ts")
    )
  ).config;
  const override = playwright.webServer.env.NOTEGIC_VITE_CACHE_DIR;
  if (override) process.env.NOTEGIC_VITE_CACHE_DIR = override;
  const e2e = (
    await loadConfigFromFile(configEnv, join(root, "vite.config.ts"))
  ).config;
  delete process.env.NOTEGIC_VITE_CACHE_DIR;

  // Use the owning configs' cache paths with real Vite optimizers, not app state.
  for (const [config, include] of [
    [development, ["react", "react-dom/client", "@tanstack/react-router"]],
    [e2e, ["react"]],
  ]) {
    const server = await createServer({
      configFile: false,
      root,
      cacheDir: process.argv.includes("shared")
        ? development.cacheDir
        : config.cacheDir,
      base: config.base,
      logLevel: "silent",
      server: { port: 0, host: "127.0.0.1", watch: null },
      optimizeDeps: { noDiscovery: true, include, holdUntilCrawlEnd: false },
    });
    servers.push(server);
    await server.listen();

    if (servers.length === 1) {
      const deps = join(server.config.cacheDir, "deps");
      const metadata = JSON.parse(
        await readFile(join(deps, "_metadata.json"), "utf8")
      );
      const chunk = Object.values(metadata.chunks)[0];
      const entry = await readFile(
        resolve(deps, metadata.optimized["@tanstack/react-router"].file),
        "utf8"
      );
      assert.ok(entry.includes(basename(chunk.file)));
      chunkPath = resolve(deps, chunk.file);
      originalBytes = await readFile(chunkPath);
      originalMetadata = await readFile(join(deps, "_metadata.json"), "utf8");
    }
  }

  const [developmentServer, testServer] = servers;
  const url = `http://127.0.0.1:${developmentServer.httpServer.address().port}${developmentServer.config.base}${relative(root, chunkPath).split(sep).join("/")}`;
  const results = [];
  for (const restart of [false, true]) {
    if (restart) await testServer.restart(true);
    const response = await fetch(url, {
      headers: { Accept: "application/javascript" },
      signal: AbortSignal.timeout(5_000),
    });
    await response.arrayBuffer();
    const bytes = await readFile(chunkPath).catch(() => null);
    results.push({
      status: response.status,
      javascript:
        response.headers.get("content-type")?.includes("javascript") ?? false,
      fileMatches: bytes?.equals(originalBytes) ?? false,
      metadataMatches:
        (await readFile(
          join(developmentServer.config.cacheDir, "deps/_metadata.json"),
          "utf8"
        )) === originalMetadata,
    });
  }
  console.log(
    JSON.stringify({
      separateCaches:
        developmentServer.config.cacheDir !== testServer.config.cacheDir,
      results,
    })
  );
} finally {
  await Promise.all(servers.map(server => server.close()));
  await rm(temporary, { recursive: true, force: true });
}
