import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import sqlocal from "sqlocal/vite";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const webRoot = dirname(fileURLToPath(import.meta.url));
  const repositoryRoot = resolve(webRoot, "../..");
  const env = loadEnv(mode, webRoot, "");
  const nitroPreset = env.NITRO_PRESET || "node_server";
  const cloudflareWorkerName = env.CLOUDFLARE_WORKER_NAME?.trim();
  const rawBasePath = env.VITE_APP_BASE_PATH || "/development/v1";
  const normalizedBasePath = `/${rawBasePath.replace(/^\/+|\/+$/g, "")}/`;
  const sqliteWasmDistDir = join(
    repositoryRoot,
    "node_modules",
    "@sqlite.org",
    "sqlite-wasm",
    "dist"
  );
  const sqliteWasmFiles = new Map<string, string>([
    ["sqlite3.wasm", "application/wasm"],
    ["index.mjs", "text/javascript; charset=utf-8"],
    ["sqlite3-worker1.mjs", "text/javascript; charset=utf-8"],
    ["sqlite3-opfs-async-proxy.js", "text/javascript; charset=utf-8"],
  ]);
  const sqliteWasmPathPrefixes = Array.from(
    new Set([
      "/node_modules/@sqlite.org/sqlite-wasm/dist/",
      `${normalizedBasePath}node_modules/@sqlite.org/sqlite-wasm/dist/`,
    ])
  );

  return {
    root: webRoot,
    base: normalizedBasePath,
    server: {
      port: Number(env.VITE_PORT || 6776),
      headers: {
        "Cross-Origin-Embedder-Policy": "require-corp",
        "Cross-Origin-Opener-Policy": "same-origin",
      },
    },
    resolve: {
      tsconfigPaths: true,
    },
    ssr: {
      noExternal: ["@blocknote/math-block"],
    },
    plugins: [
      {
        name: "sqlite-wasm-dev-asset-fix",
        apply: "serve",
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            const urlPath = req.url?.split("?")[0];
            if (!urlPath) {
              next();
              return;
            }

            const matchedPrefix = sqliteWasmPathPrefixes.find(prefix =>
              urlPath.startsWith(prefix)
            );
            if (!matchedPrefix) {
              next();
              return;
            }

            const fileName = urlPath.slice(matchedPrefix.length);
            const contentType = sqliteWasmFiles.get(fileName);
            if (!contentType) {
              next();
              return;
            }

            try {
              const content = await readFile(join(sqliteWasmDistDir, fileName));
              res.statusCode = 200;
              res.setHeader("Content-Type", contentType);
              res.setHeader("Cache-Control", "no-cache");
              res.end(content);
            } catch (error) {
              next(error as Error);
            }
          });
        },
      },
      tailwindcss(),
      sqlocal(),
      tanstackStart({
        srcDirectory: "src",
        router: {
          routesDirectory: "routes",
        },
      }),
      viteReact(),
      nitro({
        preset: nitroPreset,
        compatibilityDate: "2024-09-19",
        cloudflare: nitroPreset.includes("cloudflare")
          ? {
              deployConfig: true,
              nodeCompat: true,
              wrangler: cloudflareWorkerName
                ? { name: cloudflareWorkerName }
                : undefined,
            }
          : undefined,
      }),
    ],
  };
});
