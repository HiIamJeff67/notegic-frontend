import path from "node:path";
import { type Browser, chromium, expect, type Page } from "@playwright/test";
import { build } from "esbuild";

declare global {
  interface Window {
    sidebarMenuChanges: boolean[];
    sidebarMenuSelections: number;
  }
}

const fixture = `
import React from 'react';
import { createRoot } from 'react-dom/client';
import SidebarHoverCard from '@/components/core/AppUtilitiesWrapper/SidebarHoverCard/SidebarHoverCard';
import { ContextMenu, ContextMenuProvider, ContextMenuTrigger, ContextMenuContent, ContextMenuItem } from '@/components/ui/context-menu';
import { HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';
window.sidebarMenuChanges = [];
window.sidebarMenuSelections = 0;
window.preferences = { sidebarHoverDelay: 250 };
function Fixture() {
  const [, render] = React.useState(0);
  const [forced, setForced] = React.useState(false);
  return <ContextMenuProvider>
    <button onClick={() => { window.preferences.sidebarHoverDelay = 3000; render(n => n + 1); }}>Disable previews</button>
    <button onClick={() => setForced(true)}>Keep preview open</button>
    <ContextMenu onOpenChange={open => window.sidebarMenuChanges.push(open)}>
      <SidebarHoverCard open={forced ? true : undefined}>
        <HoverCardTrigger asChild>
          <ContextMenuTrigger asChild><button id="item" style={{margin: 100}}>Sidebar item</button></ContextMenuTrigger>
        </HoverCardTrigger>
        <HoverCardContent>Item preview</HoverCardContent>
      </SidebarHoverCard>
      <ContextMenuContent><ContextMenuItem onSelect={() => window.sidebarMenuSelections++}>Inspect item</ContextMenuItem></ContextMenuContent>
    </ContextMenu>
    <ContextMenu><ContextMenuTrigger asChild><button>Other item</button></ContextMenuTrigger><ContextMenuContent><ContextMenuItem>Other action</ContextMenuItem></ContextMenuContent></ContextMenu>
  </ContextMenuProvider>;
}
createRoot(document.getElementById('root')).render(<Fixture />);
`;

describe("sidebar previews and native context menus", () => {
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
      define: { "process.env.NODE_ENV": '"development"' },
      tsconfig: path.resolve("apps/web/tsconfig.json"),
      plugins: [
        {
          name: "preview-preferences-fixture",
          setup(builder) {
            builder.onResolve(
              {
                filter:
                  /^@\/(hooks\/useLocalPreferences|providers\/LocalPreferencesProvider)$/,
              },
              args => ({ path: args.path, namespace: "fixture" })
            );
            builder.onLoad({ filter: /.*/, namespace: "fixture" }, args => ({
              contents: args.path.endsWith("LocalPreferencesProvider")
                ? "export const MaxSidebarHoverDelay = 3000;"
                : "export const useLocalPreferences = () => ({ preferences: window.preferences });",
              loader: "js",
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
  });
  afterEach(async () => page?.close());
  afterAll(async () => browser?.close());

  test("an open preview closes for the menu, cannot reopen over it, and returns after dismissal", async () => {
    const item = page.getByRole("button", { name: "Sidebar item" });
    await item.evaluate(node => node.setAttribute("data-retained", "true"));
    await item.hover();
    await expect(page.getByText("Item preview", { exact: true })).toBeVisible();
    await item.click({ button: "right" });
    await expect(page.getByText("Item preview", { exact: true })).toBeHidden();
    await page.waitForTimeout(400); // Outlast the native hover delay while the menu is open.
    await expect(page.getByText("Item preview", { exact: true })).toBeHidden();
    await page.getByRole("menuitem", { name: "Inspect item" }).click();
    expect(await page.evaluate(() => window.sidebarMenuSelections)).toBe(1);
    expect(await page.evaluate(() => window.sidebarMenuChanges)).toEqual([
      true,
      false,
    ]);
    await expect(item).toHaveAttribute("data-retained", "true");
    await page.mouse.move(0, 0);
    await item.hover();
    await expect(page.getByText("Item preview", { exact: true })).toBeVisible();
  });

  test("pending previews stay closed during the menu and the disabled preference remains effective", async () => {
    const item = page.getByRole("button", { name: "Sidebar item" });
    await item.click({ button: "right" });
    await page.waitForTimeout(400);
    await expect(page.getByText("Item preview", { exact: true })).toBeHidden();
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "Disable previews" }).click();
    await item.hover();
    await page.waitForTimeout(400);
    await expect(page.getByText("Item preview", { exact: true })).toBeHidden();
    await item.click({ button: "right" });
    await expect(
      page.getByRole("menuitem", { name: "Inspect item" })
    ).toBeVisible();
  });

  test("a sibling item's context menu suppresses an explicitly open preview", async () => {
    await page.getByRole("button", { name: "Keep preview open" }).click();
    await expect(page.getByText("Item preview", { exact: true })).toBeVisible();
    await page
      .getByRole("button", { name: "Other item", exact: true })
      .click({ button: "right" });
    await expect(
      page.getByRole("menuitem", { name: "Other action" })
    ).toBeVisible();
    await expect(page.getByText("Item preview", { exact: true })).toBeHidden();
    await page.waitForTimeout(400);
    await expect(page.getByText("Item preview", { exact: true })).toBeHidden();
    await page.keyboard.press("Escape");
    await expect(page.getByText("Item preview", { exact: true })).toBeVisible();
  });
});
