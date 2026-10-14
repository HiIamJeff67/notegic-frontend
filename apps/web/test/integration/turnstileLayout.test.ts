import { readFile } from "node:fs/promises";
import path from "node:path";
import { type Browser, chromium, type Page } from "@playwright/test";
import { compile } from "@tailwindcss/node";
import { build } from "esbuild";

// Real components, Tailwind and ResizeObserver; only theme/i18n and Cloudflare
// are isolated. The widget stub uses Cloudflare's documented native dimensions.
const fixture = `
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import AuthPanel from '@/components/panels/AuthPanel/AuthPanel';
import CloudflareTurnstile from '@/components/commons/CloudflareTurnstile/CloudflareTurnstile';
window.widgets = [];
window.removals = [];
window.installTurnstile = () => {
  window.turnstile = {
    render(container, options) {
      const id = 'widget-' + window.widgets.length;
      const widget = document.createElement('div');
      widget.id = id;
      const frame = document.createElement('iframe');
      frame.style.border = '0';
      frame.style.width = options.size === 'flexible' ? '100%' : '150px';
      frame.style.minWidth = options.size === 'flexible' ? '300px' : '150px';
      frame.style.height = options.size === 'flexible' ? '65px' : '140px';
      const frameHost = document.createElement('div');
      // Like Cloudflare, isolate the iframe from the app's Tailwind preflight.
      frameHost.attachShadow({ mode: 'open' }).append(frame);
      widget.append(frameHost);
      container.append(widget);
      window.widgets.push({ id, options });
      return id;
    },
    remove(id) {
      window.removals.push(id);
      document.getElementById(id)?.remove();
    },
  };
};
if (!window.deferTurnstile) window.installTurnstile();
function Fixture() {
  const [token, setToken] = useState(null);
  window.token = token;
  return <AuthPanel
    title="Login"
    inputs={[{ title: 'Account', placeholder: 'Account', value: '', onChange: () => {} }]}
    submitButtonText="Login"
    submitButtonDisabled={!token}
    onSubmit={async () => {}}
    verification={<CloudflareTurnstile onTokenChange={setToken} />}
  />;
}
window.root = createRoot(document.getElementById('root'));
window.root.render(<Fixture />);
`;

const mocks: Record<string, string> = {
  "@/hooks/useTheme": `export const useTheme = () => ({ currentTheme: { isDark: true } });`,
  "@shared/i18n/useTranslation": `export const useTranslation = () => ({ t: key => key });`,
};

describe("Turnstile container sizing in Chromium", () => {
  let browser: Browser;
  let page: Page;
  let script: string;
  let disabledScript: string;
  let css: string;

  beforeAll(async () => {
    const components = await Promise.all(
      [
        "apps/web/src/components/panels/AuthPanel/AuthPanel.tsx",
        "apps/web/src/components/commons/CloudflareTurnstile/CloudflareTurnstile.tsx",
      ].map(file => readFile(file, "utf8"))
    );
    const compiler = await compile(
      await readFile("apps/web/src/global/styles/globals.css", "utf8"),
      {
        base: path.resolve("apps/web/src/global/styles"),
        onDependency: () => {},
      }
    );
    css = compiler.build(components.join(" ").split(/[\s"'`]+/));
    for (const siteKey of ["layout-test-site-key", ""]) {
      const result = await build({
        stdin: { contents: fixture, resolveDir: process.cwd(), loader: "tsx" },
        bundle: true,
        write: false,
        platform: "browser",
        jsx: "automatic",
        loader: { ".css": "empty" },
        define: {
          "process.env.NODE_ENV": '"development"',
          "import.meta.env.VITE_TURNSTILE_SITE_KEY": JSON.stringify(siteKey),
        },
        tsconfig: path.resolve("apps/web/tsconfig.json"),
        plugins: [
          {
            name: "turnstile-layout-boundaries",
            setup(builder) {
              builder.onResolve({ filter: /.*/ }, args =>
                args.path in mocks
                  ? { path: args.path, namespace: "turnstile-test" }
                  : undefined
              );
              builder.onLoad(
                { filter: /.*/, namespace: "turnstile-test" },
                args => ({ contents: mocks[args.path], loader: "tsx" })
              );
            },
          },
        ],
      });
      if (siteKey) script = result.outputFiles[0].text;
      else disabledScript = result.outputFiles[0].text;
    }
    browser = await chromium.launch();
  }, 30_000);

  beforeEach(async () => {
    page = await browser.newPage();
    await page.setContent('<div id="root"></div>');
    await page.addStyleTag({ content: css });
  });
  afterEach(async () => {
    await page?.close();
  });
  afterAll(async () => {
    await browser?.close();
  });

  it.each([
    280, 320, 375, 390, 425, 480, 600, 640, 767, 768, 1024, 1440,
  ])("fits the authentication form at %ipx without using a viewport breakpoint", async width => {
    await page.setViewportSize({ width, height: 800 });
    await page.addScriptTag({ content: script });
    await page.waitForFunction("widgets.length === 1");
    const layout = await page.evaluate(() => {
      const host = document.querySelector('[aria-label="Human verification"]');
      const widget =
        host?.firstElementChild?.firstElementChild?.shadowRoot?.querySelector(
          "iframe"
        );
      const input = document.querySelector("input");
      if (!host || !widget || !input) throw new Error("Missing form/widget");
      const hostRect = host.getBoundingClientRect();
      const widgetRect = widget.getBoundingClientRect();
      return {
        available: hostRect.width,
        width: widgetRect.width,
        height: widgetRect.height,
        left: widgetRect.left - hostRect.left,
        right: hostRect.right - widgetRect.right,
        inputWidth: input.getBoundingClientRect().width,
        overflow: document.documentElement.scrollWidth - window.innerWidth,
      };
    });
    const flexible = layout.available >= 300;
    expect(await page.evaluate("widgets[0].options.size")).toBe(
      flexible ? "flexible" : "compact"
    );
    expect(layout.available).toBeCloseTo(layout.inputWidth);
    expect(layout.width).toBeCloseTo(flexible ? layout.available : 150);
    expect(layout.height).toBe(flexible ? 65 : 140);
    expect(layout.left).toBeGreaterThanOrEqual(0);
    expect(layout.right).toBeCloseTo(layout.left);
    expect(layout.overflow).toBe(0);
    if (width >= 375) expect(flexible).toBe(true);
  });

  it("keeps verification when crossing 768px without changing widget mode", async () => {
    await page.setViewportSize({ width: 768, height: 800 });
    await page.addScriptTag({ content: script });
    await page.waitForFunction("widgets.length === 1");
    await page.evaluate("widgets[0].options.callback('verified');");
    await page.waitForFunction("token === 'verified'");
    await page.setViewportSize({ width: 767, height: 800 });
    await page.evaluate(
      () =>
        new Promise(resolve =>
          requestAnimationFrame(() => requestAnimationFrame(resolve))
        )
    );
    expect(await page.evaluate("widgets.length")).toBe(1);
    expect(await page.evaluate("removals.length")).toBe(0);
    expect(await page.evaluate("token")).toBe("verified");
  });

  it("observes the container's 300px threshold and ignores removed widget callbacks", async () => {
    await page.addScriptTag({ content: script });
    await page.waitForFunction("widgets.length === 1");
    await page.evaluate("widgets[0].options.callback('old-token');");
    await page.waitForFunction("token === 'old-token'");
    await page.locator("form").evaluate(form => {
      form.style.width = "299px";
    });
    await page.waitForFunction("widgets.length === 2 && token === null");
    expect(await page.evaluate("widgets[1].options.size")).toBe("compact");
    await page.evaluate(`
      widgets[1].options.callback('new-token');
      widgets[0].options.callback('stale-token');
      widgets[0].options['expired-callback']();
      widgets[0].options['error-callback']();
    `);
    await page.waitForFunction("token === 'new-token'");
    await page.locator("form").evaluate(form => {
      form.style.width = "300px";
    });
    await page.waitForFunction("widgets.length === 3 && token === null");
    expect(await page.evaluate("widgets[2].options.size")).toBe("flexible");
    expect(await page.evaluate("removals")).toEqual(["widget-0", "widget-1"]);
    await page.evaluate("root.unmount();");
    expect(await page.evaluate("removals.length")).toBe(3);
  });

  it("uses the latest width when the Cloudflare script loads after a resize", async () => {
    await page.route("https://challenges.cloudflare.com/**", route =>
      route.abort()
    );
    await page.evaluate("window.deferTurnstile = true;");
    await page.addScriptTag({ content: script });
    await page.waitForFunction(
      "document.getElementById('cloudflare-turnstile-script')"
    );
    await page.setViewportSize({ width: 320, height: 800 });
    await page.waitForFunction(
      "document.querySelector('[aria-label=\"Human verification\"]').clientWidth < 300"
    );
    await page.evaluate(
      () =>
        new Promise(resolve =>
          requestAnimationFrame(() => requestAnimationFrame(resolve))
        )
    );
    await page.evaluate(`
      installTurnstile();
      document.getElementById('cloudflare-turnstile-script').dispatchEvent(new Event('load'));
    `);
    await page.waitForFunction("widgets.length === 1");
    expect(await page.evaluate("widgets[0].options.size")).toBe("compact");
    expect(await page.locator("#cloudflare-turnstile-script").count()).toBe(1);
  });

  it("does not load a widget when local development has no site key", async () => {
    await page.addScriptTag({ content: disabledScript });
    await page.waitForFunction("document.querySelector('form')");
    expect(
      await page.locator('[aria-label="Human verification"]').count()
    ).toBe(0);
    expect(await page.locator("#cloudflare-turnstile-script").count()).toBe(0);
    expect(await page.evaluate("widgets.length")).toBe(0);
  });
});
