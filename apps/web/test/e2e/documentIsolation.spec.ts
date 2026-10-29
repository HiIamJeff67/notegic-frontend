import { mkdtemp, realpath, rm, writeFile } from "node:fs/promises";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "@playwright/test";
import { createServer, type ViteDevServer } from "vite";

test.skip(
  process.env.E2E_PRODUCTION === "true",
  "Exercises Vite document updates under the development base path."
);
test.describe.configure({ mode: "serial" });

let server: ViteDevServer | undefined;
let temporary: string | undefined;
let baseURL: string;
let modulePath: string;
const basePath = "/development/v1/";

test.beforeAll(async () => {
  temporary = await realpath(
    await mkdtemp(join(tmpdir(), "notegic-document-isolation-"))
  );
  modulePath = join(temporary, "guideRevision.ts");
  await writeFile(modulePath, 'export const revision = "Guide revision 1";');
  const repository = process.cwd();
  const previousBase = process.env.VITE_APP_BASE_PATH;
  process.env.VITE_APP_BASE_PATH = basePath;
  try {
    server = await createServer({
      configFile: join(repository, "apps/web/vite.config.ts"),
      cacheDir: join(temporary, "cache"),
      nitro: { buildDir: join(temporary, "nitro") },
      logLevel: "warn",
      plugins: [
        {
          name: "document-hmr-fixture",
          enforce: "pre",
          transform(code, id) {
            if (!id.endsWith("/pages/document/website/WebsiteEnglish.tsx"))
              return;
            return code
              .replace(
                "const WebsiteEnglish = () => (",
                `import { revision } from ${JSON.stringify(`/@fs${modulePath}`)};\nconst WebsiteEnglish = () => (`
              )
              .replace("  <>", "  <>\n    <p data-document-hmr>{revision}</p>");
          },
        },
      ],
      server: {
        host: "127.0.0.1",
        port: 0,
        fs: { allow: [repository, temporary] },
      },
    });
    await server.listen();
    baseURL = `http://127.0.0.1:${(server.httpServer!.address() as AddressInfo).port}${basePath}`;
  } finally {
    if (previousBase === undefined) delete process.env.VITE_APP_BASE_PATH;
    else process.env.VITE_APP_BASE_PATH = previousBase;
  }
});

test.afterAll(async () => {
  await server?.close();
  if (temporary) await rm(temporary, { recursive: true, force: true });
});

test.beforeEach(async ({ page }) => {
  await page.route("https://www.youtube-nocookie.com/embed/**", route =>
    route.fulfill({
      contentType: "text/html",
      body: "<!doctype html><p>Public player</p>",
    })
  );
});

test("prefixed navigation changes isolation only at document boundaries", async ({
  page,
}) => {
  // A fresh Vite server compiles both route trees before the document round trip.
  test.setTimeout(60_000);
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  expect((await page.goto(baseURL))?.status()).toBe(200);
  await page.locator("html[data-density]").waitFor();
  expect(await page.evaluate(() => window.crossOriginIsolated)).toBe(true);
  const homeOrigin = await page.evaluate(() => performance.timeOrigin);

  await page.getByRole("button", { name: "View Docs", exact: true }).click();
  await expect(page).toHaveURL(`${baseURL}document`);
  await page.locator("#website iframe").first().waitFor();
  expect(await page.evaluate(() => window.crossOriginIsolated)).toBe(false);
  const documentOrigin = await page.evaluate(() => performance.timeOrigin);
  expect(documentOrigin).not.toBe(homeOrigin);
  expect(
    page.workers().filter(worker => /sqlocal/i.test(worker.url()))
  ).toEqual([]);
  await expect(page.locator("#website iframe")).toHaveCount(6);
  for (const video of await page.locator("[data-article-video]").all()) {
    await expect(
      video.frameLocator("iframe").getByText("Public player")
    ).toHaveText("Public player");
  }

  await page.locator('#website a[href$="#website-widgets"]').first().click();
  await expect(page).toHaveURL(`${baseURL}document#website-widgets`);
  expect(await page.evaluate(() => performance.timeOrigin)).toBe(
    documentOrigin
  );
  await page.getByRole("link", { name: "Home", exact: true }).click();
  await expect(page).toHaveURL(baseURL);
  await page.locator("html[data-density]").waitFor();
  expect(await page.evaluate(() => window.crossOriginIsolated)).toBe(true);
  expect(await page.evaluate(() => performance.timeOrigin)).not.toBe(
    documentOrigin
  );
  expect(errors).toEqual([]);
});

test("guide HMR and automatic full reload keep prefixed players non-isolated", async ({
  page,
  request,
}) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto(`${baseURL}document#website`);
  await page.waitForLoadState("networkidle");
  await expect(page.locator("[data-document-hmr]")).toHaveText(
    "Guide revision 1"
  );
  const documentOrigin = await page.evaluate(() => performance.timeOrigin);
  await writeFile(modulePath, 'export const revision = "Guide revision 2";');
  await expect(page.locator("[data-document-hmr]")).toHaveText(
    "Guide revision 2"
  );
  expect(await page.evaluate(() => performance.timeOrigin)).toBe(
    documentOrigin
  );
  expect(await page.evaluate(() => window.crossOriginIsolated)).toBe(false);
  for (const video of await page.locator("[data-article-video]").all()) {
    await expect(
      video.frameLocator("iframe").getByText("Public player")
    ).toHaveText("Public player");
  }

  await expect
    .poll(async () => (await request.get(`${baseURL}document`)).text())
    .toContain("Guide revision 2");

  const navigation = page.waitForEvent(
    "framenavigated",
    frame => frame === page.mainFrame()
  );
  server!.environments.client.hot.send({ type: "full-reload", path: "*" });
  await navigation;
  await expect(page.locator("[data-document-hmr]")).toHaveText(
    "Guide revision 2"
  );
  expect(await page.evaluate(() => performance.timeOrigin)).not.toBe(
    documentOrigin
  );
  expect(await page.evaluate(() => window.crossOriginIsolated)).toBe(false);
  expect(
    page.workers().filter(worker => /sqlocal/i.test(worker.url()))
  ).toEqual([]);
  for (const video of await page.locator("[data-article-video]").all()) {
    await expect(
      video.frameLocator("iframe").getByText("Public player")
    ).toHaveText("Public player");
  }
  expect(errors).toEqual([]);
});
