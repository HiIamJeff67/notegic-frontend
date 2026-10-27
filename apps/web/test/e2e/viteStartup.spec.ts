import { mkdtemp, realpath, rm, writeFile } from "node:fs/promises";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "@playwright/test";
import { createServer, type ViteDevServer } from "vite";

test.skip(
  process.env.E2E_PRODUCTION === "true",
  "Exercises Vite development HMR."
);
test.describe.configure({ mode: "serial" });

let server: ViteDevServer | undefined;
let temporary: string | undefined;
let baseURL: string;
let modulePath: string;
const moduleSource = `export const revision = 1;
if (import.meta.hot) {
  import.meta.hot.accept(next => { window.notegicHmrRevision = next.revision; });
}
`;

test.beforeAll(async () => {
  temporary = await realpath(
    await mkdtemp(join(tmpdir(), "notegic-vite-startup-"))
  );
  modulePath = join(temporary, "hmrProbe.js");
  await writeFile(modulePath, moduleSource);
  const repository = process.cwd();
  const previousBase = process.env.VITE_APP_BASE_PATH;
  process.env.VITE_APP_BASE_PATH = "/";
  try {
    server = await createServer({
      configFile: join(repository, "apps/web/vite.config.ts"),
      cacheDir: join(temporary, "cache"),
      logLevel: "warn",
      server: {
        host: "127.0.0.1",
        port: 0,
        fs: { allow: [repository, temporary] },
      },
    });
    await server.listen();
    baseURL = `http://127.0.0.1:${(server.httpServer!.address() as AddressInfo).port}`;
  } finally {
    if (previousBase === undefined) delete process.env.VITE_APP_BASE_PATH;
    else process.env.VITE_APP_BASE_PATH = previousBase;
  }
});

test.afterAll(async () => {
  await server?.close();
  if (temporary) await rm(temporary, { recursive: true, force: true });
});

test("cold startup hydrates without outdated dependencies or an automatic full reload", async ({
  page,
}) => {
  const failures: Array<{ url: string; status: number }> = [];
  const reloads: string[] = [];
  const errors: string[] = [];
  page.on("response", response => {
    if (response.status() >= 400 && response.url().includes("/cache/deps/")) {
      failures.push({ url: response.url(), status: response.status() });
    }
  });
  page.on("pageerror", error => errors.push(error.message));
  page.on("websocket", socket => {
    socket.on("framereceived", ({ payload }) => {
      if (String(payload).includes('"type":"full-reload"')) {
        reloads.push(String(payload));
      }
    });
  });

  expect((await page.goto(baseURL))?.status()).toBe(200);
  await page.locator("html[data-density]").waitFor();
  expect(
    await page.evaluate(async () => {
      const path = "/src/api/local/db.ts";
      const { localDB } = await import(/* @vite-ignore */ path);
      await localDB.ensureReady();
      return localDB.isReady;
    })
  ).toBe(true);
  await page.getByRole("button", { name: "Get Started" }).click();
  await expect(
    page.getByRole("heading", { name: "Login", exact: true })
  ).toBeVisible();
  expect(failures).toEqual([]);
  expect(errors).toEqual([]);
  expect(reloads).toEqual([]);
});

test("HMR accepts updates and a full reload reconnects SQLite without losing rows", async ({
  page,
}) => {
  const reloads: string[] = [];
  const failures: Array<{ url: string; status: number }> = [];
  page.on("response", response => {
    if (response.status() >= 400 && response.url().includes("/cache/deps/")) {
      failures.push({ url: response.url(), status: response.status() });
    }
  });
  page.on("websocket", socket => {
    socket.on("framereceived", ({ payload }) => {
      if (String(payload).includes('"type":"full-reload"')) {
        reloads.push(String(payload));
      }
    });
  });
  await page.goto(`${baseURL}/login`);
  await page.locator("html[data-density]").waitFor();
  await page.getByLabel("Account").fill("hmr@example.invalid");
  await page.evaluate(async path => {
    const module = await import(/* @vite-ignore */ path);
    (
      window as typeof window & { notegicHmrRevision: number }
    ).notegicHmrRevision = module.revision;
    const load = (path: string) => import(/* @vite-ignore */ path);
    const { localDB } = await load("/src/api/local/db.ts");
    const { User } = await load("/src/api/local/schemas/index.ts");
    await localDB.ensureReady();
    await localDB.insert(User).values({
      publicId: "e2e-vite-hmr",
      name: "HMR marker",
      displayName: "HMR marker",
      email: "hmr@example.invalid",
      isLoggedIn: false,
    });
  }, `/@fs${modulePath}`);

  await writeFile(
    modulePath,
    moduleSource.replace("revision = 1", "revision = 2")
  );
  await page.waitForFunction(
    () =>
      (window as typeof window & { notegicHmrRevision: number })
        .notegicHmrRevision === 2
  );
  await expect(page.getByLabel("Account")).toHaveValue("hmr@example.invalid");
  expect(reloads).toEqual([]);

  // Exercise the real beforeFullReload SQLocal teardown, not a manual page retry.
  const navigation = page.waitForEvent(
    "framenavigated",
    frame => frame === page.mainFrame()
  );
  server!.environments.client.hot.send({ type: "full-reload", path: "*" });
  await navigation;
  await page.locator("html[data-density]").waitFor();
  await expect(
    page.getByRole("heading", { name: "Login", exact: true })
  ).toBeVisible();
  const rows = await page.evaluate(async () => {
    const load = (path: string) => import(/* @vite-ignore */ path);
    const { localDB } = await load("/src/api/local/db.ts");
    const { User } = await load("/src/api/local/schemas/index.ts");
    const { eq } = await load("/test/e2e/localDatabaseTestSupport.ts");
    await localDB.ensureReady();
    return await localDB
      .select({ name: User.name })
      .from(User)
      .where(eq(User.publicId, "e2e-vite-hmr"));
  });
  expect(rows).toEqual([{ name: "HMR marker" }]);
  expect(reloads).toHaveLength(1);
  expect(failures).toEqual([]);
});
