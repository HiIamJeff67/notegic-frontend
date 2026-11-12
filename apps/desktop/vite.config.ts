import { readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

const desktopRoot = path.dirname(fileURLToPath(import.meta.url));
const localDatabaseModule = path.resolve(desktopRoot, "src/localDatabase.ts");
const databaseWorkerModule = path.resolve(desktopRoot, "src/databaseWorker.ts");
const databasePackageModule = path.resolve(
  desktopRoot,
  "src/databasePackage.ts"
);
const serverRequestModule = path.resolve(desktopRoot, "src/serverRequest.ts");
const asyncLocalStorageModule = path.resolve(
  desktopRoot,
  "src/asyncLocalStorage.ts"
);

const serverFunctionPrefix = "\0desktop-server-fn:";

// The web UI stays the source of the desktop window. These imports boot a
// different runtime, so the desktop build resolves them to inert modules.
const desktopRuntimeBoundary = (): Plugin => ({
  name: "desktop-runtime-boundary",
  enforce: "pre",
  async resolveId(source, importer, options) {
    if (source.startsWith(serverFunctionPrefix)) return source;
    if (source === "node:async_hooks") return asyncLocalStorageModule;
    if (
      source === "sqlocal" ||
      source === "sqlocal/drizzle" ||
      source.startsWith("sqlocal/")
    ) {
      return databasePackageModule;
    }
    if (
      source === "@tanstack/start-server-core" ||
      source.startsWith("@tanstack/start-server-core/")
    ) {
      return serverRequestModule;
    }

    const resolved = await this.resolve(source, importer, {
      ...options,
      skipSelf: true,
    });
    if (!resolved) return null;
    const file = resolved.id.split("?")[0];
    if (file.endsWith(`${path.sep}api${path.sep}local${path.sep}db.ts`)) {
      return localDatabaseModule;
    }
    if (file.endsWith(`${path.sep}sqlocal.worker.ts`)) {
      return databaseWorkerModule;
    }
    if (file.endsWith(".serverFn.ts")) {
      return serverFunctionPrefix + file;
    }
    return null;
  },
  load(id) {
    if (!id.startsWith(serverFunctionPrefix)) return null;
    const file = id.slice(serverFunctionPrefix.length);
    const source = readFileSync(file, "utf8");
    const names = new Set<string>();
    for (const match of source.matchAll(
      /export (?:async )?function ([A-Za-z0-9_]+)/g
    )) {
      names.add(match[1]);
    }
    for (const match of source.matchAll(/export const ([A-Za-z0-9_]+)/g)) {
      names.add(match[1]);
    }
    const exports = [...names]
      .map(name => `export const ${name} = unavailable;`)
      .join("\n");
    return `const unavailable = async () => {\n  throw new Error("Desktop does not run server functions.");\n};\n${exports}\n`;
  },
});

const host = process.env.TAURI_DEV_HOST;

export default defineConfig(({ mode }) => ({
  clearScreen: false,
  plugins: [desktopRuntimeBoundary(), react(), tailwindcss()],
  optimizeDeps: {
    exclude: [
      "@tanstack/react-start",
      "@tanstack/start-client-core",
      "@tanstack/start-storage-context",
    ],
  },
  define: {
    "process.env.NOTEGIC_VITE_MODE": JSON.stringify(
      mode === "production" ? "production" : "development"
    ),
  },
  resolve: {
    alias: {
      "@": path.resolve(desktopRoot, "../web/src"),
      "@assets": path.resolve(desktopRoot, "../web/assets"),
      "@widgets": path.resolve(desktopRoot, "../web/src/components/widgets"),
      "@shared": path.resolve(desktopRoot, "../../shared"),
      "node:async_hooks": asyncLocalStorageModule,
    },
  },
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
}));
