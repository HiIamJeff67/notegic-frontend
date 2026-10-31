import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  type Browser,
  expect as browserExpect,
  chromium,
  type Page,
} from "@playwright/test";
import { compile } from "@tailwindcss/node";
import { build } from "esbuild";

const activeToast =
  '[data-slot="toast"]:not([data-limited]):not([data-ending-style])';

// Real Base UI manager, lifecycle and WidgetProvider; only user/storage/i18n are isolated.
const fixture = `
import React from 'react';
import { createRoot } from 'react-dom/client';
import toast from '@shared/lib/toast/toast';
import { Toaster } from '@/components/ui/toaster';
import { WidgetProvider } from '@/providers/WidgetProvider';
import { useWidget } from '@/hooks/useWidget';
import { toastManager, useToastManager } from '@/components/ui/toast';
window.notify = toast;
window.nativeNotify = toastManager.add;
function Probe() {
  const widgets = useWidget();
  const { toasts } = useToastManager();
  window.items = toasts;
  window.saveWidgets = () => {
    widgets.append({id:'fixture',name:'fixture',position:{leftFrameCount:0,topFrameCount:0}});
    widgets.sync();
  };
  return <button style={{position:'fixed',right:16,bottom:16,width:40,height:40}}>Edit</button>;
}
createRoot(document.getElementById('root')).render(
  <Toaster><WidgetProvider><Probe/></WidgetProvider></Toaster>
);
`;

describe("shared Toast placement and duration in Chromium", () => {
  let browser: Browser;
  let page: Page;
  let script: string;
  let css: string;
  let errors: string[];

  beforeAll(async () => {
    const mocks: Record<string, string> = {
      "@/hooks": `const userData={publicId:'fixture'};export const useUser=()=>({userData});`,
      "@shared/lib/storage/localStorage": `export { LocalStorageKey } from './shared/lib/storage/localStorage'; export const LocalStorage={getItemByKey:()=> '[]',setItem:()=>{}};`,
      "@/components/widgets/basic/basic": `export const DashboardPreviewWidgets={};`,
      "@shared/i18n/useTranslation": `export const useTranslation=()=>({t:key=>key});`,
    };
    const result = await build({
      stdin: { contents: fixture, resolveDir: process.cwd(), loader: "tsx" },
      bundle: true,
      write: false,
      metafile: true,
      platform: "browser",
      jsx: "automatic",
      define: { "process.env.NODE_ENV": '"development"' },
      tsconfig: path.resolve("apps/web/tsconfig.json"),
      plugins: [
        {
          name: "toast-layout-boundaries",
          setup(builder) {
            builder.onResolve({ filter: /.*/ }, args =>
              args.path in mocks
                ? { path: args.path, namespace: "toast-test" }
                : undefined
            );
            builder.onLoad({ filter: /.*/, namespace: "toast-test" }, args => ({
              contents: mocks[args.path],
              loader: "tsx",
              resolveDir: process.cwd(),
            }));
          },
        },
      ],
    });
    script = result.outputFiles[0].text;
    const sources = await Promise.all(
      Object.keys(result.metafile!.inputs)
        .filter(
          file => file.endsWith(".tsx") && !file.startsWith("toast-test:")
        )
        .map(file => readFile(file, "utf8"))
    );
    const compiler = await compile(
      await readFile("apps/web/src/global/styles/globals.css", "utf8"),
      {
        base: path.resolve("apps/web/src/global/styles"),
        onDependency: () => {},
      }
    );
    css = compiler.build([fixture, ...sources].join(" ").split(/[\s"'`]+/));
    browser = await chromium.launch({
      channel: process.env.PLAYWRIGHT_CHANNEL,
    });
  }, 30_000);

  beforeEach(async () => {
    errors = [];
    page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    page.on("pageerror", error => errors.push(error.message));
    await page.setContent(
      '<html class="dark"><body><div id="root"></div></body></html>'
    );
    await page.addStyleTag({ content: css });
    await page.addScriptTag({ content: script });
    await page.waitForFunction("window.saveWidgets && window.items");
    await page.mouse.move(5, 400);
  });
  afterEach(async () => {
    await page?.close();
    expect(errors).toEqual([]);
  });
  afterAll(async () => {
    await browser?.close();
  });

  it.each([
    "top-left",
    "top-center",
    "top-right",
    "bottom-left",
    "bottom-center",
    "bottom-right",
  ])("positions %s using the existing toast primitive", async position => {
    await page.evaluate(position => {
      (window as unknown as { notify: any }).notify.success(
        "Positioned message",
        { position, duration: Infinity }
      );
    }, position);
    const toast = page.locator(activeToast);
    await browserExpect(toast).toHaveCount(1);
    await toast.evaluate(element =>
      Promise.all(element.getAnimations().map(animation => animation.finished))
    );
    const rect = (await toast.boundingBox())!;
    if (position.startsWith("top-")) expect(rect.y).toBe(16);
    else expect(rect.y + rect.height).toBe(784);
    if (position.endsWith("-left")) expect(rect.x).toBe(16);
    else if (position.endsWith("-right"))
      expect(rect.x + rect.width).toBe(1264);
    else expect(Math.abs(rect.x + rect.width / 2 - 640)).toBeLessThan(1);
  });

  it.each([
    "default",
    "success",
    "info",
    "warning",
    "error",
  ])("defaults %s messages to the viewport's top center", async kind => {
    await page.evaluate(kind => {
      const notify = (window as unknown as { notify: any }).notify;
      if (kind === "default")
        notify("Default location", { duration: Infinity });
      else notify[kind]("Default location", { duration: Infinity });
    }, kind);
    const toast = page.locator(activeToast);
    await browserExpect(toast).toHaveAttribute("data-position", "top-center");
    await toast.evaluate(element =>
      Promise.all(element.getAnimations().map(animation => animation.finished))
    );
    const rect = (await toast.boundingBox())!;
    expect(rect.y).toBe(16);
    expect(Math.abs(rect.x + rect.width / 2 - 640)).toBeLessThan(1);
    await page.getByRole("button", { name: "Edit", exact: true }).click();
  });

  it("groups native manager messages without position data into the default stack", async () => {
    await page.evaluate(
      "nativeNotify({title:'Native message',timeout:0});notify.info('Facade message',{duration:Infinity})"
    );
    const toasts = page.locator(activeToast);
    await browserExpect(toasts).toHaveCount(2);
    for (const toast of await toasts.all()) {
      await browserExpect(toast).toHaveAttribute("data-position", "top-center");
    }
    await browserExpect(toasts.first()).toHaveCSS("--toast-stack-index", "0");
    await browserExpect(toasts.last()).toHaveCSS("--toast-stack-index", "1");
  });

  it("keeps all six placements in the same mobile location", async () => {
    await page.setViewportSize({ width: 375, height: 812 });
    for (const position of [
      "top-left",
      "top-center",
      "top-right",
      "bottom-left",
      "bottom-center",
      "bottom-right",
    ]) {
      await page.evaluate(position => {
        const notify = (window as unknown as { notify: any }).notify;
        notify.dismiss();
        notify.success("Mobile message", { position, duration: Infinity });
      }, position);
      const toast = page.locator(activeToast);
      await browserExpect(toast).toHaveAttribute("data-position", position);
      await toast.evaluate(element =>
        Promise.all(
          element.getAnimations().map(animation => animation.finished)
        )
      );
      const rect = (await toast.boundingBox())!;
      expect(Math.abs(rect.x + rect.width / 2 - 375 / 2)).toBeLessThan(1);
      expect(rect.y).toBeGreaterThanOrEqual(0);
      expect(rect.y + rect.height).toBeLessThan(160);
    }
  });

  it("uses the native four-toast limit and each returned dismissal handle", async () => {
    await page.evaluate(
      "for(let index=0;index<5;index++) window.lastToast=notify.info('Message '+index,{duration:Infinity})"
    );
    await browserExpect(page.locator(activeToast)).toHaveCount(4);
    await browserExpect(
      page.locator('[data-slot="toast"][data-limited]')
    ).toHaveText(/Message 0/);
    await page.evaluate("window.lastToast.dismiss()");
    await browserExpect(page.locator(activeToast)).toHaveCount(4);
    await browserExpect(
      page.getByText("Message 4", { exact: true })
    ).toHaveCount(0);
    await page.evaluate("notify.dismiss()");
    await browserExpect(page.locator(activeToast)).toHaveCount(0);
  });

  it("keeps widgets saved at the default top center alongside a bottom-right override without covering Edit", async () => {
    await page.evaluate(
      "saveWidgets();notify.success('Other saved message',{position:'bottom-right'})"
    );
    const saved = page.locator('[data-position="top-center"]');
    const other = page.locator('[data-position="bottom-right"]');
    await browserExpect(saved).toHaveText(
      /workspace.notifications.widgetsSaved/
    );
    await browserExpect(other).toHaveText(/Other saved message/);
    await page
      .locator("[data-position]")
      .evaluateAll(elements =>
        Promise.all(
          elements
            .flatMap(element => element.getAnimations())
            .map(animation => animation.finished)
        )
      );
    const top = (await saved.boundingBox())!;
    const bottom = (await other.boundingBox())!;
    expect(Math.abs(top.x + top.width / 2 - 640)).toBeLessThan(1);
    expect(top.y).toBe(16);
    expect(bottom.x + bottom.width).toBe(1264);
    expect(bottom.y + bottom.height).toBe(784);
    expect(
      await saved.evaluate(element => getComputedStyle(element).opacity)
    ).toBe("1");
    expect(
      await other.evaluate(element => getComputedStyle(element).opacity)
    ).toBe("1");
    await other.hover();
    await other.getByRole("button", { name: "common.close" }).click();
    await page.getByRole("button", { name: "Edit", exact: true }).click();
    // Ordinary messages join the same default stack as widgets saved.
    await page.evaluate(
      "notify.success('workspace.notifications.widgetsSaved')"
    );
    await browserExpect(
      page.locator(`${activeToast}[data-position="top-center"]`)
    ).toHaveCount(2);
  });

  it("keeps both message types in one upper stack on mobile and adapts when resized", async () => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.evaluate(
      "saveWidgets();notify.error('Other error',{position:'bottom-right'})"
    );
    const toasts = page.locator("[data-position]");
    await browserExpect(toasts).toHaveCount(2);
    await toasts.evaluateAll(elements =>
      Promise.all(
        elements
          .flatMap(element => element.getAnimations())
          .map(animation => animation.finished)
      )
    );
    for (const toast of await toasts.all()) {
      const rect = (await toast.boundingBox())!;
      expect(rect.y).toBeGreaterThanOrEqual(0);
      expect(rect.y + rect.height).toBeLessThan(160);
      expect(rect.x).toBeGreaterThanOrEqual(0);
      expect(rect.x + rect.width).toBeLessThanOrEqual(375);
    }
    await browserExpect(toasts.first()).toHaveCSS("--toast-stack-index", "0");
    await browserExpect(toasts.last()).toHaveCSS("--toast-stack-index", "1");
    await page.setViewportSize({ width: 1280, height: 800 });
    await browserExpect(toasts.last()).toHaveCSS("--toast-stack-index", "0");
    expect(
      (await page.locator('[data-position="bottom-right"]').boundingBox())!.y
    ).toBeGreaterThan(600);
  });

  it.each([
    ["success", 2000],
    ["info", 3000],
    ["warning", 5000],
    ["error", 5000],
    ["default", 5000],
  ])("uses the native %s timeout of %sms", async (variant, duration) => {
    await page.clock.install();
    await page.evaluate(kind => {
      const notify = (window as unknown as { notify: any }).notify;
      if (kind === "default") notify("Timed message");
      else notify[kind]("Timed message");
    }, variant);
    const toast = page.locator(activeToast);
    await browserExpect(toast).toHaveCount(1);
    await page.clock.runFor(Number(duration) - 100);
    await browserExpect(toast).toHaveCount(1);
    await page.clock.runFor(200);
    await browserExpect(toast).toHaveCount(0);
  });

  it("honors explicit duration and Base UI hover pause, then allows keyboard dismissal", async () => {
    await page.clock.install();
    await page.evaluate("notify.success('Longer message',{duration:7000})");
    const toast = page.locator(activeToast);
    await browserExpect(toast).toHaveCount(1);
    await page.clock.runFor(2500);
    await browserExpect(toast).toHaveCount(1);
    await toast.hover();
    await page.clock.runFor(10000);
    await browserExpect(toast).toHaveCount(1);
    await page.mouse.move(5, 400);
    await page.clock.runFor(5000);
    await browserExpect(toast).toHaveCount(0);
    await page.evaluate("saveWidgets()");
    await browserExpect(toast).toHaveCount(1);
    await page.keyboard.press("F6");
    await toast.getByRole("button", { name: "common.close" }).focus();
    await page.keyboard.press("Enter");
    await browserExpect(toast).toHaveCount(0);
  });

  it("suppresses empty success/error messages and retains descriptions and explicit dismissal", async () => {
    expect(
      await page.evaluate("[notify.success('  '),notify.error('')]")
    ).toEqual(["", ""]);
    await browserExpect(page.locator(activeToast)).toHaveCount(0);
    await page.evaluate(
      "window.handle=notify.warning('Warning',{description:'Details',duration:0})"
    );
    await browserExpect(page.locator(activeToast)).toHaveText(/WarningDetails/);
    await page.evaluate("notify.dismiss(window.handle.id)");
    await browserExpect(page.locator(activeToast)).toHaveCount(0);
  });

  it("uses native swipe dismissal without replacing the library transform", async () => {
    await page.evaluate("notify.error('Swipe message',{duration:Infinity})");
    const toast = page.locator(activeToast);
    await browserExpect(toast).toHaveCount(1);
    await toast.hover();
    const box = (await toast.boundingBox())!;
    await page.mouse.move(box.x + 60, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + 180, box.y + box.height / 2, { steps: 8 });
    await page.mouse.up();
    await browserExpect(toast).toHaveCount(0);
  });

  it.each([
    "top-center",
    "bottom-right",
  ])("animates %s messages from their screen edge with a small scale change", async position => {
    await page.evaluate(position => {
      (window as unknown as { notify: any }).notify.error("Animated message", {
        position,
        duration: Infinity,
      });
    }, position);
    const toast = page.locator(activeToast);
    await toast.waitFor({ state: "attached" });
    const entry = await toast.evaluate(element => {
      const animation = element
        .getAnimations()
        .find(
          animation =>
            animation instanceof CSSTransition &&
            animation.transitionProperty === "transform"
        );
      if (!animation) throw new Error("Missing native Toast entry transition");
      animation.pause();
      animation.currentTime = 0;
      const start = new DOMMatrix(getComputedStyle(element).transform);
      const startOpacity = getComputedStyle(element).opacity;
      animation.finish();
      const end = new DOMMatrix(getComputedStyle(element).transform);
      return {
        startY: start.m42,
        startScale: start.a,
        startOpacity,
        endOpacity: getComputedStyle(element).opacity,
        endY: end.m42,
        endScale: end.a,
      };
    });
    expect(entry.startScale).toBeCloseTo(0.94);
    expect(entry.endScale).toBe(1);
    expect(entry.startOpacity).toBe("1");
    expect(entry.endOpacity).toBe("1");
    expect(entry.endY).toBe(0);
    if (position.startsWith("top")) expect(entry.startY).toBeLessThan(0);
    else expect(entry.startY).toBeGreaterThan(0);
    await page.evaluate("notify.dismiss()");
    const exiting = page.locator('[data-slot="toast"][data-ending-style]');
    await exiting.waitFor({ state: "attached" });
    const exit = await exiting.evaluate(element => {
      const animation = element
        .getAnimations()
        .find(
          animation =>
            animation instanceof CSSTransition &&
            animation.transitionProperty === "transform"
        );
      if (!animation) throw new Error("Missing native Toast exit transition");
      animation.finish();
      const end = new DOMMatrix(getComputedStyle(element).transform);
      return {
        y: end.m42,
        scale: end.a,
        opacity: getComputedStyle(element).opacity,
      };
    });
    expect(exit.scale).toBeCloseTo(0.96);
    expect(exit.opacity).toBe("1");
    if (position.startsWith("top")) expect(exit.y).toBeLessThan(0);
    else expect(exit.y).toBeGreaterThan(0);
    await browserExpect(page.locator('[data-slot="toast"]')).toHaveCount(0);
  });

  it("honors reduced motion without delaying notification dismissal", async () => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.evaluate("notify.success('Reduced motion',{duration:Infinity})");
    const toast = page.locator(activeToast);
    await browserExpect(toast).toHaveCSS("transition-property", "none");
    await browserExpect(toast).toHaveCSS("opacity", "1");
    await page.evaluate("notify.dismiss()");
    await browserExpect(page.locator('[data-slot="toast"]')).toHaveCount(0);
  });

  it.each([
    "dark",
    "light",
  ])("keeps stacked %s notifications fully opaque", async theme => {
    await page.evaluate(theme => {
      document.documentElement.className = theme;
      const notify = (window as unknown as { notify: any }).notify;
      notify.info("Older notification", { duration: Infinity });
      notify.success("Newer notification", { duration: Infinity });
    }, theme);
    const toasts = page.locator(activeToast);
    await browserExpect(toasts).toHaveCount(2);
    for (const toast of await toasts.all()) {
      await browserExpect(toast).toHaveCSS("opacity", "1");
      expect(
        await toast.evaluate(element => {
          const context = document.createElement("canvas").getContext("2d")!;
          context.fillStyle = getComputedStyle(element).backgroundColor;
          context.fillRect(0, 0, 1, 1);
          return context.getImageData(0, 0, 1, 1).data[3];
        })
      ).toBe(255);
    }
  });

  it.each([
    "top-center",
    "bottom-right",
  ])("expands mixed-height messages at %s without overlap or collapsing in the gap", async position => {
    await page.evaluate(position => {
      const notify = (window as unknown as { notify: any }).notify;
      notify.info("Longer message", {
        description: "More details about this operation. ".repeat(8),
        position,
        duration: Infinity,
      });
      notify.success("Short message", { position, duration: Infinity });
    }, position);
    const newest = page
      .locator(activeToast)
      .filter({ hasText: "Short message" });
    const older = page
      .locator(activeToast)
      .filter({ hasText: "Longer message" });
    await newest.hover();
    await browserExpect(older).toHaveAttribute("data-expanded", "");
    await older.evaluate(element =>
      Promise.all(element.getAnimations().map(animation => animation.finished))
    );
    const front = (await newest.boundingBox())!;
    const back = (await older.boundingBox())!;
    const gapY = position.startsWith("top")
      ? (front.y + front.height + back.y) / 2
      : (back.y + back.height + front.y) / 2;
    if (position.startsWith("top"))
      expect(back.y - front.y - front.height).toBeCloseTo(8);
    else expect(front.y - back.y - back.height).toBeCloseTo(8);
    await page.mouse.move(front.x + front.width / 2, gapY);
    await browserExpect(older).toHaveAttribute("data-expanded", "");
    await older.hover();
    await browserExpect(older).toHaveAttribute("data-expanded", "");
  });
});
