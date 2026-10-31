import path from "node:path";
import {
  type Browser,
  expect as browserExpect,
  chromium,
  type Page,
} from "@playwright/test";
import { build } from "esbuild";

// Real preferences, setting controls, sidebar items and Radix timing; isolated data edges.
const fixture = `
import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {LocalPreferencesProvider} from '@/providers/LocalPreferencesProvider';
import {useLocalPreferences} from '@/hooks/useLocalPreferences';
import {AppearanceSettings} from '@/pages/app/setting/preferences/PreferencesPageContent';
import BlockPackMenuItem from '@/components/menus/BlockPackMenu/BlockPackMenuItem';
import MaterialMenuItem from '@/components/menus/MaterialMenu/MaterialMenuItem';
import {SidebarProvider} from '@/components/ui/sidebar';
import {HoverCard,HoverCardContent,HoverCardTrigger} from '@/components/ui/hover-card';
import {LocalStorage} from '@shared/lib/storage/localStorage';
import {LocalStorageKey} from '@shared/lib/storage/localStorage';
import i18n from '@/i18n';
window.readSaved = () => LocalStorage.getItemByKey(LocalStorageKey.localPreferences);
window.changeLanguage = language => i18n.changeLanguage(language);
const parent={id:'parent',rootShelfId:'root'};
const block={id:'block',name:'Notes',blockCount:7,createdAt:new Date(0),updatedAt:new Date(0)};
const material={id:'material',name:'Reference',contentType:'text/plain',size:42,createdAt:new Date(0),updatedAt:new Date(0)};
function Fixture(){
  const [otherOpen,setOtherOpen]=useState(false);
  const {preferences,updatePreference,resetPreferences,isReady}=useLocalPreferences();
  window.currentPreferences=preferences;
  window.updateDelay=value=>updatePreference('sidebarHoverDelay',value);
  window.resetPreferences=resetPreferences;
  return <>
    <span id="ready">{String(isReady)}</span>
    <AppearanceSettings/>
    <SidebarProvider>
      <BlockPackMenuItem parent={parent} current={block}/>
      <MaterialMenuItem parent={parent} current={material}/>
    </SidebarProvider>
    <HoverCard openDelay={10} open={otherOpen} onOpenChange={setOtherOpen}><HoverCardTrigger>Other card</HoverCardTrigger><HoverCardContent>Other preview</HoverCardContent></HoverCard>
  </>;
}
window.mount = saved => {
  if(saved!==undefined) LocalStorage.setItem(LocalStorageKey.localPreferences,saved);
  createRoot(document.getElementById('root')).render(<LocalPreferencesProvider><Fixture/></LocalPreferencesProvider>);
};
`;

const mocks: Record<string, string> = {
  "@/api/local/cleanup": "export const cleanupLocalData = async () => {};",
  "@/providers/MaterialAttachmentCacheProvider":
    "export const clearMaterialAttachmentCache = async () => {};",
  "@shared/lib/blockpack": "export const LocalYjsDocumentStore = {};",
  "@/hooks": `
    export {useMobile} from '@/hooks/useMobile';
    const router={push:()=>window.opened=true,params:{}};
    const shelves={isFocused:()=>false,toggleBlockPack(){},toggleMaterial(){}};
    export const useAppRouter=()=>router;
    export const useShelfItem=()=>shelves;
    export const useMaterialAttachmentCache=()=>({});
    export const useTheme=()=>({currentTheme:{id:'dark'},availableThemes:[],switchCurrentTheme(){}});`,
  "@/hooks/useBackgroundImages":
    "export const useBackgroundImages = () => ({});",
  "@/hooks/useRealtime": "export const useRealtime = () => ({});",
  "@/hooks/useTransactionSynchronizer":
    "export const useTransactionSynchronizer = () => ({});",
  "@/hooks/useUser": "export const useUser = () => ({});",
};

describe("sidebar hover preferences in Chromium", () => {
  let browser: Browser;
  let page: Page;
  let script: string;
  let errors: string[] = [];

  beforeAll(async () => {
    const bundle = await build({
      stdin: { contents: fixture, resolveDir: process.cwd(), loader: "tsx" },
      bundle: true,
      write: false,
      platform: "browser",
      loader: { ".svg": "dataurl", ".css": "empty" },
      jsx: "automatic",
      define: {
        "process.env.NODE_ENV": '"development"',
        "import.meta.env.BASE_URL": '"/"',
      },
      tsconfig: path.resolve("apps/web/tsconfig.json"),
      plugins: [
        {
          name: "hover-preference-boundaries",
          setup(builder) {
            builder.onResolve({ filter: /.*/ }, args =>
              args.path in mocks
                ? { path: args.path, namespace: "mock" }
                : undefined
            );
            builder.onLoad({ filter: /.*/, namespace: "mock" }, args => ({
              contents: mocks[args.path],
              loader: "tsx",
              resolveDir: process.cwd(),
            }));
          },
        },
      ],
    });
    script = bundle.outputFiles[0].text;
    browser = await chromium.launch({
      channel: process.env.PLAYWRIGHT_CHANNEL,
    });
  }, 30_000);
  beforeEach(async () => {
    errors = [];
    page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => {
      if (
        message.type() === "warning" &&
        message.text().includes("controlled")
      ) {
        errors.push(message.text());
      }
    });
    await page.route("http://hover-preferences.test/", route =>
      route.fulfill({ contentType: "text/html", body: '<div id="root"></div>' })
    );
    await page.goto("http://hover-preferences.test/");
    await page.addScriptTag({ content: script });
  });
  afterEach(async () => {
    await page?.close();
    expect(errors).toEqual([]);
  });
  afterAll(async () => {
    await browser?.close();
  });

  it("uses Radix delays for both note and material previews", async () => {
    await page.evaluate("mount({sidebarHoverDelay:1000})");
    await page.waitForFunction(
      "document.querySelector('#ready')?.textContent === 'true'"
    );
    await page.clock.install({ time: new Date("2026-01-01T00:00:00Z") });
    await page.clock.pauseAt(new Date("2026-01-01T00:00:01Z"));
    for (const [name, detail] of [
      ["Notes", "Blocks"],
      ["Reference", "Content type"],
    ]) {
      await page.getByRole("button", { name, exact: true }).hover();
      await page.clock.runFor(900);
      expect(await page.getByText(detail, { exact: true }).count()).toBe(0);
      await page.clock.runFor(150);
      await browserExpect(
        page.getByText(detail, { exact: true })
      ).toBeVisible();
      await page.mouse.move(1200, 700);
      await page.clock.runFor(150);
    }
  });

  it.each([
    0, 250, 2750,
  ])("supports a %s ms delay without a custom timer", async delay => {
    await page.evaluate(
      value =>
        (window as unknown as { mount: (value: unknown) => void }).mount({
          sidebarHoverDelay: value,
        }),
      delay
    );
    await page.waitForFunction(
      "document.querySelector('#ready')?.textContent === 'true'"
    );
    await page.clock.install({ time: new Date("2026-01-01T00:00:00Z") });
    await page.clock.pauseAt(new Date("2026-01-01T00:00:01Z"));
    await page.getByRole("button", { name: "Notes", exact: true }).hover();
    if (delay > 0) {
      await page.clock.runFor(delay - 1);
      expect(await page.getByText("Blocks", { exact: true }).count()).toBe(0);
    }
    await page.clock.runFor(1);
    await browserExpect(
      page.getByText("Blocks", { exact: true })
    ).toBeVisible();
  });

  it("disables cards at the maximum without breaking unrelated cards or clicking", async () => {
    await page.evaluate("mount({sidebarHoverDelay:3000})");
    await page.waitForFunction(
      "document.querySelector('#ready')?.textContent === 'true'"
    );
    await page.clock.install({ time: new Date("2026-01-01T00:00:00Z") });
    await page.clock.pauseAt(new Date("2026-01-01T00:00:01Z"));
    const note = page.getByRole("button", { name: "Notes", exact: true });
    await note.hover();
    await page.clock.runFor(3500);
    expect(await page.getByText("Blocks", { exact: true }).count()).toBe(0);
    await note.click();
    expect(await page.evaluate("window.opened")).toBe(true);
    await note.click({ button: "right" });
    await browserExpect(
      page.getByRole("menuitem", { name: "Open", exact: true })
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await page.getByText("Other card", { exact: true }).hover();
    await page.clock.runFor(30);
    await browserExpect(
      page.getByText("Other preview", { exact: true })
    ).toBeVisible();
  });

  it("closes an open preview immediately when disabled", async () => {
    await page.evaluate("mount({sidebarHoverDelay:250})");
    await page.waitForFunction(
      "document.querySelector('#ready')?.textContent === 'true'"
    );
    await page.clock.install({ time: new Date("2026-01-01T00:00:00Z") });
    await page.clock.pauseAt(new Date("2026-01-01T00:00:01Z"));
    await page.getByRole("button", { name: "Notes", exact: true }).hover();
    await page.clock.runFor(300);
    await browserExpect(
      page.getByText("Blocks", { exact: true })
    ).toBeVisible();
    await page.evaluate("updateDelay(3000)");
    await browserExpect(page.getByText("Blocks", { exact: true })).toHaveCount(
      0
    );
    await page.mouse.move(1200, 700);
    await page.clock.runFor(150);
    await page.evaluate("updateDelay(1000)");
    expect(await page.getByText("Blocks", { exact: true }).count()).toBe(0);
    await page.getByRole("button", { name: "Notes", exact: true }).hover();
    await page.clock.runFor(900);
    expect(await page.getByText("Blocks", { exact: true }).count()).toBe(0);
    await page.clock.runFor(150);
    await browserExpect(
      page.getByText("Blocks", { exact: true })
    ).toBeVisible();
  });

  it("saves the accessible slider value, restores it after reload and resets it", async () => {
    await page.evaluate("mount({})");
    await page.waitForFunction(
      "document.querySelector('#ready')?.textContent === 'true'"
    );
    const slider = page.getByRole("slider", {
      name: "Sidebar preview delay",
      exact: true,
    });
    await browserExpect(slider).toHaveAttribute("aria-valuenow", "250");
    await slider.focus();
    await page.keyboard.press("End");
    await browserExpect(slider).toHaveAttribute("aria-valuetext", "Disabled");
    await page.waitForFunction("readSaved().sidebarHoverDelay === 3000");
    await page.reload();
    await page.addScriptTag({ content: script });
    await page.evaluate("mount()");
    await browserExpect(slider).toHaveAttribute("aria-valuenow", "3000");
    await page.evaluate("resetPreferences()");
    await browserExpect(slider).toHaveAttribute("aria-valuenow", "250");
    await page.waitForFunction("readSaved().sidebarHoverDelay === 250");
    await slider.focus();
    await page.keyboard.press("Home");
    await browserExpect(slider).toHaveAttribute("aria-valuenow", "0");
    await page.keyboard.press("ArrowRight");
    await browserExpect(slider).toHaveAttribute("aria-valuenow", "250");
  });

  it.each([
    -1,
    4000,
    "1000",
    null,
    1250.5,
  ])("falls back safely for stored delay %s", async value => {
    await page.evaluate(saved => {
      (window as unknown as { mount: (saved: unknown) => void }).mount({
        sidebarHoverDelay: saved,
      });
    }, value);
    await page.waitForFunction(
      "document.querySelector('#ready')?.textContent === 'true'"
    );
    expect(await page.evaluate("currentPreferences.sidebarHoverDelay")).toBe(
      250
    );
    await page.waitForFunction("readSaved().sidebarHoverDelay === 250");
  });

  it("keeps mobile hover cards disabled", async () => {
    await page.setViewportSize({ width: 390, height: 720 });
    await page.evaluate("mount({sidebarHoverDelay:0})");
    await page.waitForFunction(
      "document.querySelector('#ready')?.textContent === 'true'"
    );
    await page.clock.install({ time: new Date("2026-01-01T00:00:00Z") });
    await page.clock.pauseAt(new Date("2026-01-01T00:00:01Z"));
    await page.getByRole("button", { name: "Notes", exact: true }).hover();
    await page.clock.runFor(3500);
    expect(await page.getByText("Blocks", { exact: true }).count()).toBe(0);
  });

  it.each([
    "en",
    "zh-TW",
    "zh-CN",
    "ja",
    "ko",
  ])("translates the control and disabled value in %s", async language => {
    await page.evaluate("mount({sidebarHoverDelay:3000})");
    await page.evaluate(
      value =>
        (
          window as unknown as {
            changeLanguage: (value: string) => Promise<void>;
          }
        ).changeLanguage(value),
      language
    );
    const slider = page.getByRole("slider").last();
    const label = await slider.getAttribute("aria-label");
    const value = await slider.getAttribute("aria-valuetext");
    expect(label).toBeTruthy();
    expect(value).toBeTruthy();
    expect(label).not.toContain("settingsPage.");
    expect(value).not.toContain("settingsPage.");
  });
});
