import { readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import { createServer, type ViteDevServer } from "vite";

const desktopRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
);
const placeholderId = "00000000-0000-4000-8000-000000000001";

const requestValue = new Proxy(
  {},
  {
    get: (_target, key) => {
      if (typeof key !== "string") return undefined;
      if (key === "isDeleted" || key === "areDeleted") return false;
      if (key === "from" || key === "to" || key.endsWith("At")) {
        return "2026-01-01T00:00:00.000Z";
      }
      if (key.endsWith("Ids") || key.endsWith("ids")) return [placeholderId];
      return placeholderId;
    },
  }
);

const probeRequest = {
  header: {
    userAgent: "notegic-desktop-probe",
    idempotencyKey: placeholderId,
    turnstileToken: "probe",
    csrfToken: "",
  },
  param: requestValue,
  body: requestValue,
};

type ProbeCall = {
  name: string;
  url: string;
  method: string;
  status: number;
  json: boolean;
  credentials: string | undefined;
  cookie: string | null;
  csrf: string | null;
};

test("desktop functions reach the production API without a browser session", async () => {
  const vite: ViteDevServer = await createServer({
    root: desktopRoot,
    configFile: path.join(desktopRoot, "vite.config.ts"),
    mode: "production",
    envDir: desktopRoot,
    server: { middlewareMode: true },
    appType: "custom",
    logLevel: "error",
  });
  const calls: ProbeCall[] = [];
  const errors: string[] = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    const response = await originalFetch(input, init);
    const headers = new Headers(init?.headers);
    calls.push({
      name: "",
      url: String(input),
      method: init?.method ?? "GET",
      status: response.status,
      json: (response.headers.get("content-type") ?? "").includes("json"),
      credentials: init?.credentials,
      cookie: headers.get("Cookie"),
      csrf: headers.get("X-CSRF-Token"),
    });
    return response;
  };

  try {
    const files = readdirSync(
      path.join(desktopRoot, "src/api/functions")
    ).filter(file => file.endsWith(".function.ts"));
    for (const file of files) {
      const loaded = await vite.ssrLoadModule(
        path.join(desktopRoot, "src/api/functions", file)
      );
      for (const [name, value] of Object.entries(loaded)) {
        if (typeof value !== "function") continue;
        if (name === "HasAuthCookies") {
          expect(value()).toBe(false);
          continue;
        }
        const before = calls.length;
        try {
          await value(probeRequest);
        } catch (error) {
          if (!calls[before]) {
            errors.push(
              `${file} ${name}: ${error instanceof Error ? error.message : String(error)}`
            );
          }
        }
        const call = calls[before];
        if (call) call.name = `${file} ${name}`;
      }
    }
  } finally {
    globalThis.fetch = originalFetch;
    await vite.close();
  }

  const failures = calls.flatMap(call => {
    let host = "";
    try {
      host = new URL(call.url).host;
    } catch {
      host = call.url;
    }
    const apiHost =
      host === "client.notegic.com" || host === "realtime.notegic.com";
    const safe =
      call.credentials === "omit" && call.cookie === null && call.csrf === null;
    const answered = call.status > 0 && call.status < 500;
    const wrote = call.method !== "GET" && call.status < 400;
    const reached = apiHost && safe && answered && !wrote;
    return reached
      ? []
      : [`${call.name} ${call.method} ${call.status} ${host}`];
  });

  expect(errors).toEqual([]);
  expect(failures).toEqual([]);
  expect(calls.length).toBeGreaterThan(100);
});
