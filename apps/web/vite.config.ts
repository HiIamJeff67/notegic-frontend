import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import sqlocal from "sqlocal/vite";
import { defineConfig, loadEnv } from "vite";
import { getCrossOriginIsolationHeaders } from "../../shared/lib/crossOriginIsolation";

export default defineConfig(({ mode }) => {
  const webRoot = dirname(fileURLToPath(import.meta.url));
  const repositoryRoot = resolve(webRoot, "../..");
  const env = loadEnv(mode, webRoot, "");
  const nitroPreset = env.NITRO_PRESET || "node_server";
  const cloudflareWorkerName = env.CLOUDFLARE_WORKER_NAME?.trim();
  const rawBasePath =
    env.VITE_APP_BASE_PATH || (mode === "production" ? "/" : "/development/v1");
  const basePath =
    rawBasePath === "/" ? "/" : `/${rawBasePath.replace(/^\/+|\/+$/g, "")}/`;
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
      `${basePath}node_modules/@sqlite.org/sqlite-wasm/dist/`,
      `/@fs${sqliteWasmDistDir}/`,
      `${basePath}@fs${sqliteWasmDistDir}/`,
    ])
  );

  return {
    root: webRoot,
    envDir: webRoot,
    cacheDir: env.NOTEGIC_VITE_CACHE_DIR,
    base: basePath,
    server: {
      port: Number(env.VITE_PORT || 6776),
    },
    optimizeDeps: {
      // Runtime imports missed by the initial scan otherwise replace live chunks.
      include: [
        "@apollo/client-react-streaming",
        "@apollo/client/utilities/invariant",
        "@handlewithcare/prosemirror-inputrules",
        "@tanstack/history",
        "@tanstack/router-core",
        "@tanstack/router-core/isServer",
        "@tanstack/router-core/ssr/client",
        "@tanstack/router-core/ssr/server",
        "katex",
        "prosemirror-model",
        "prosemirror-state",
        "seroval",
      ],
      holdUntilCrawlEnd: false,
    },
    resolve: {
      tsconfigPaths: true,
      // Nested Radix popups must share the Dialog's focus and dismissal stacks.
      dedupe: [
        "@radix-ui/react-dismissable-layer",
        "@radix-ui/react-focus-scope",
      ],
    },
    ssr: {
      noExternal: ["@blocknote/math-block"],
    },
    plugins: [
      {
        name: "document-isolation-headers",
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            const pathname = new URL(req.url ?? "/", "http://vite.local")
              .pathname;
            for (const [name, value] of Object.entries(
              getCrossOriginIsolationHeaders(pathname, basePath)
            )) {
              res.setHeader(name, value);
            }
            next();
          });
        },
      },
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
        serverDir: join(webRoot, "server"),
        routeRules: {
          "/assets/**": {
            headers: {
              "Cross-Origin-Embedder-Policy": "require-corp",
              "Cross-Origin-Resource-Policy": "same-origin",
            },
          },
        },
        // The SSR output imports Node's AsyncLocalStorage. Keep the generated
        // Wrangler config on a date where nodejs_compat is active.
        compatibilityDate: "2026-09-07",
        cloudflare: nitroPreset.includes("cloudflare")
          ? {
              deployConfig: true,
              nodeCompat: true,
              wrangler: cloudflareWorkerName
                ? {
                    name: cloudflareWorkerName,
                    observability: {
                      enabled: true,
                      head_sampling_rate: 1,
                      logs: {
                        enabled: true,
                        head_sampling_rate: 1,
                        invocation_logs: true,
                      },
                    },
                  }
                : undefined,
            }
          : undefined,
      }),
    ],
  };
});
