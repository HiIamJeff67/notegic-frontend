import path from "node:path";
import {
  type Browser,
  expect as browserExpect,
  chromium,
  type Page,
} from "@playwright/test";
import { build } from "esbuild";

// Real forms, resolvers, FormMessage and translations; isolate account/network state.
const fixture = `
import React from 'react';
import { createRoot } from 'react-dom/client';
import { FakeUser, FakeUserInfo } from '@shared/constants';
import i18n from '@/i18n';
import AccountTab from '@/pages/app/setting/account/tabs/AccountTab';
import ProfileTab from '@/pages/app/setting/account/tabs/ProfileTab';
window.requests = 0;
window.mutator = { mutateAsync: async () => { window.requests++; return {}; } };
window.userManager = {
  userData: { ...FakeUser, name: 'fixture123', displayName: 'Fixture123' },
  userInfo: { ...FakeUserInfo, header: '', introduction: '', birthDate: new Date('2000-01-01') },
  updateUserData: () => {}, fetchUserInfo: async () => {},
};
window.changeLanguage = language => i18n.changeLanguage(language);
createRoot(document.getElementById('root')).render(<>
  <section id="account"><AccountTab layout="page" /></section>
  <section id="profile"><ProfileTab layout="page" /></section>
</>);
`;

const mocks: Record<string, string> = {
  "@/components/commons/Article/Article":
    "export { default as ArticleSettingItem } from '@/components/commons/Article/ArticleSettingItem';",
  "@/hooks/useUser": "export const useUser = () => window.userManager;",
  "@/hooks":
    "const loading = { startAsyncTransactionLoading: async operation => operation() }; export const useLoading = () => loading;",
  "@/api/hooks/user.hook": "export const useUpdateMe = () => window.mutator;",
  "@/api/hooks/userInfo.hook":
    "export const useUpdateMyInfo = () => window.mutator;",
  "@/api/clientHeaders": "export const getClientRequestHeaders = () => ({});",
  "@/components/dialogs/ImageDialog/CropImageDialog":
    "export default () => null;",
  "@/components/dialogs/ImageDialog/UploadImageDialog":
    "export default () => null;",
};

describe("editable request fields in real settings forms", () => {
  let browser: Browser;
  let page: Page;
  let script: string;

  beforeAll(async () => {
    const result = await build({
      stdin: { contents: fixture, resolveDir: process.cwd(), loader: "tsx" },
      bundle: true,
      write: false,
      platform: "browser",
      jsx: "automatic",
      loader: { ".css": "empty" },
      define: { "process.env.NODE_ENV": '"development"' },
      tsconfig: path.resolve("apps/web/tsconfig.json"),
      plugins: [
        {
          name: "input-validation-boundaries",
          setup(builder) {
            builder.onResolve({ filter: /.*/ }, args =>
              args.path in mocks
                ? { path: args.path, namespace: "input-test" }
                : undefined
            );
            builder.onLoad({ filter: /.*/, namespace: "input-test" }, args => ({
              contents: mocks[args.path],
              loader: "tsx",
              resolveDir: process.cwd(),
            }));
          },
        },
      ],
    });
    script = result.outputFiles[0].text;
    browser = await chromium.launch({
      channel: process.env.PLAYWRIGHT_CHANNEL,
    });
  }, 30_000);

  beforeEach(async () => {
    page = await browser.newPage();
    await page.setContent('<div id="root"></div>');
    await page.addScriptTag({ content: script });
    await page.locator("#account input").waitFor();
  });
  afterEach(async () => {
    await page?.close();
  });
  afterAll(async () => {
    await browser?.close();
  });

  it("shares the display-name rule and translates an existing error after a language change", async () => {
    const account = page.locator("#account");
    await account.locator("input").fill("asd");
    await account.getByRole("button", { name: "Save", exact: true }).click();
    await browserExpect(
      account.locator('[data-slot="form-message"]')
    ).toHaveText("Display name must be 6–32 characters.");
    expect(await page.evaluate("requests")).toBe(0);
    await page.evaluate("changeLanguage('zh-TW')");
    await browserExpect(
      account.locator('[data-slot="form-message"]')
    ).toHaveText("顯示名稱需為 6–32 個字元。");
    await account.locator("input").fill("Another123");
    await account.getByRole("button", { name: "儲存", exact: true }).click();
    await browserExpect.poll(() => page.evaluate("requests")).toBe(1);
  });

  it("shows profile field hints without submitting or losing the typed value", async () => {
    const profile = page.locator("#profile");
    const headline = profile.locator("input").first();
    await headline.fill("x".repeat(65));
    await profile.getByRole("button", { name: "Save", exact: true }).click();
    await browserExpect(
      profile.locator('[data-slot="form-message"]')
    ).toHaveText("Headline must be no more than 64 characters.");
    await browserExpect(headline).toHaveValue("x".repeat(65));
    expect(await page.evaluate("requests")).toBe(0);
    await headline.fill("Valid headline");
    await profile.locator("textarea").fill("x".repeat(257));
    await profile.getByRole("button", { name: "Save", exact: true }).click();
    await browserExpect(
      profile.locator('[data-slot="form-message"]')
    ).toHaveText("Introduction must be no more than 256 characters.");
    expect(await page.evaluate("requests")).toBe(0);
  });
});
