import path from "node:path";
import { type Browser, chromium, type Page } from "@playwright/test";
import { build } from "esbuild";

// Exercise the real React providers together. Only their network/storage edges
// are replaced; no app server, account, or production writes are needed.
const fixture = `
import React from 'react';
import { createRoot } from 'react-dom/client';
import { LocalPreferencesProvider } from '@/providers/LocalPreferencesProvider';
import { UserSettingsProvider } from '@/providers/UserSettingsProvider';
import { useLocalPreferences } from '@/hooks/localPreferences';
import { Language, UserSettingDensity, UserSettingStartSurface } from '@shared/api/interfaces/enums';
window.state = { reads: 0, writes: [], cachedReads: 0, signals: [], online: true, userId: 'user-1' };
window.setting = {
  language: Language.English, density: UserSettingDensity.Compact,
  startSurface: UserSettingStartSurface.Dashboard, reduceMotion: false,
  lineWrap: true, quickInsert: true, privatePreviews: false,
  routineNudges: true, syncNotifications: true, quietMode: true,
  quietModeStartMinute: 1320, quietModeEndMinute: 480,
};
function Probe() {
  const context = useLocalPreferences();
  window.preferences = context.preferences;
  window.updatePreference = context.updatePreference;
  return null;
}
const root = createRoot(document.getElementById('root'));
window.render = () => root.render(<React.StrictMode><LocalPreferencesProvider><UserSettingsProvider><Probe /></UserSettingsProvider></LocalPreferencesProvider></React.StrictMode>);
window.unmount = () => root.unmount();
`;

const mocks: Record<string, string> = {
  "@/hooks/useUser": `export const useUser = () => ({ userData: { publicId: window.state.userId } });`,
  "@/hooks/useNetwork": `export const useNetwork = () => ({ isOnline: window.state.online });`,
  "@/api/clientHeaders": `export const getClientRequestHeaders = () => ({}); export const getClientMutationHeaders = () => ({});`,
  "@/api/hooks/userSetting.hook": `const mutate = request => window.state.writes.push(request); export const useUpdateMySetting = () => ({ mutate });`,
  "@/api/invokers/userSetting.invoker": `export const queryFnGetMySetting = async (_, signal) => {
    window.state.reads++; window.state.signals.push(signal);
    if (window.state.deferred) return new Promise(resolve => { window.resolveRemote = () => resolve({ data: {...window.setting} }); });
    if (window.state.fail) throw new Error('404');
    return { data: {...window.setting} };
  };`,
  "@/api/local/synchronizers/userSetting.synchronizer": `export const UserSettingLocalSynchronizer = {
    getMySetting: async () => { window.state.cachedReads++; return {...window.setting}; },
    syncGetMySetting: async () => {}, syncUpdateMySetting: async () => {},
  };`,
  "@/i18n": `const listeners = new Set(); const i18n = {
    language: 'en', on: (_, fn) => listeners.add(fn), off: (_, fn) => listeners.delete(fn),
    changeLanguage: async language => { i18n.language = language; listeners.forEach(fn => fn(language)); },
  }; window.i18n = i18n; export default i18n;`,
  "@shared/lib/localStorageManipulator": `export const LocalStorageManipulator = { getItemByKey: () => null, setItem: () => {} };`,
  "@/api/local/cleanup": `export const cleanupLocalData = async () => {};`,
  "@/providers/MaterialAttachmentCacheProvider": `export const clearMaterialAttachmentCache = async () => {};`,
};

describe("user settings lifecycle in Chromium", () => {
  let browser: Browser;
  let page: Page;
  let script: string;

  beforeAll(async () => {
    const result = await build({
      stdin: { contents: fixture, resolveDir: process.cwd(), loader: "tsx" },
      bundle: true,
      write: false,
      platform: "browser",
      define: { "process.env.NODE_ENV": '"development"' },
      tsconfig: path.resolve("apps/web/tsconfig.json"),
      plugins: [
        {
          name: "settings-test-boundaries",
          setup(builder) {
            builder.onResolve({ filter: /.*/ }, args =>
              args.path in mocks
                ? { path: args.path, namespace: "settings-test" }
                : undefined
            );
            builder.onLoad(
              { filter: /.*/, namespace: "settings-test" },
              args => ({ contents: mocks[args.path], loader: "js" })
            );
          },
        },
      ],
    });
    script = result.outputFiles[0].text;
    browser = await chromium.launch();
  }, 30_000);
  beforeEach(async () => {
    page = await browser.newPage();
    await page.setContent('<div id="root"></div>');
    await page.addScriptTag({ content: script });
  });
  afterEach(async () => {
    await page?.close();
  });
  afterAll(async () => {
    await browser?.close();
  });

  it.each([
    false,
    true,
  ])("does not loop after hydration, including failed HTTP (failure=%s)", async fail => {
    await page.evaluate(`state.fail = ${fail}; render();`);
    await page.waitForFunction(
      "state.reads === 1 && preferences.density === 'compact'"
    );
    for (let index = 0; index < 20; index++) {
      await page.evaluate("render(); updatePreference('density', 'compact');");
    }
    await page.waitForTimeout(100);
    expect(
      await page.evaluate(
        "({ reads: state.reads, writes: state.writes.length })"
      )
    ).toEqual({ reads: 1, writes: 0 });
    await page.evaluate("updatePreference('density', 'comfortable');");
    await page.waitForFunction("state.writes.length === 1");
    await page.evaluate("updatePreference('density', 'comfortable');");
    expect(
      await page.evaluate(
        "({ reads: state.reads, writes: state.writes.length })"
      )
    ).toEqual({ reads: 1, writes: 1 });
  });

  it("does not overwrite edits with a late response and aborts on unmount", async () => {
    await page.evaluate("state.deferred = true; render();");
    await page.waitForFunction("state.reads === 1");
    await page.evaluate(
      "updatePreference('density', 'comfortable'); resolveRemote();"
    );
    await page.waitForTimeout(100);
    expect(await page.evaluate("preferences.density")).toBe("comfortable");
    await page.evaluate("unmount();");
    expect(
      await page.evaluate("state.signals.every(signal => signal.aborted)")
    ).toBe(true);
  });

  it("fetches once on reconnect, not on each preference update", async () => {
    await page.evaluate("state.online = false; render();");
    await page.waitForFunction("preferences.density === 'compact'");
    expect(await page.evaluate("state.reads")).toBe(0);
    await page.evaluate("state.online = true; render();");
    await page.waitForFunction("state.reads === 1");
    await page.evaluate("render();");
    await page.waitForTimeout(100);
    expect(await page.evaluate("state.reads")).toBe(1);
  });

  it("does not save hydrated language or duplicate language events", async () => {
    await page.evaluate("setting.language = 'TraditionalChinese'; render();");
    await page.waitForFunction(
      "state.reads === 1 && i18n.language === 'zh-TW'"
    );
    await page.evaluate("i18n.changeLanguage('zh-TW');");
    expect(await page.evaluate("state.writes.length")).toBe(0);
    await page.evaluate(
      "i18n.changeLanguage('en'); i18n.changeLanguage('en');"
    );
    expect(await page.evaluate("state.writes.length")).toBe(1);
    expect(await page.evaluate("state.reads")).toBe(1);
  });
});
