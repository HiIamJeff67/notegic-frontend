import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  type Browser,
  chromium,
  expect as browserExpect,
  type Page,
} from "@playwright/test";
import { compile } from "@tailwindcss/node";
import { build } from "esbuild";

// Render the actual sidebar, editor headers and breadcrumbs; isolate document/API state.
const fixture = `
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/sidebar/AppSidebar/AppSidebar';
import AppSidebarInset from '@/components/sidebar/AppSidebar/AppSidebarInset';
import BlockPackEditorContent from '@/components/core/BlockPackEditor/BlockPackEditorContent';
import MaterialViewerFrame from '@/components/core/MaterialViewer/MaterialViewerFrame';
import MaterialViewer from '@/components/core/MaterialViewer/MaterialViewer';
import { LoadingProvider } from '@/providers/LoadingProvider';
import { getDefaultBlockPackMeta } from '@shared/reducers/blockPackMeta.reducer';
import { getDefaultMaterialMeta } from '@shared/reducers/materialMeta.reducer';
import '@/i18n';
const block = {...getDefaultBlockPackMeta('item','parent','root'), name:'Notes',
  pathItems:[{id:'root',name:'Workspace'},{id:'parent',name:'Folder'}]};
const material = {...getDefaultMaterialMeta('item','parent','root'), name:'Reference', downloadURL:'https://example.invalid/file.txt'};
window.refreshCount = 0;
const file = { isLoading: false, isError: false, onRefresh: () => window.refreshCount++ };
function Fixture() {
  const [mode, setMode] = useState('material');
  const [isLoading, setIsLoading] = useState(false);
  window.showEditor = setMode;
  window.setFileLoading = setIsLoading;
  const fileState = {...file,isLoading};
  return <SidebarProvider>
    <AppSidebar />
    <AppSidebarInset>
      {mode === 'block' ? <BlockPackEditorContent blockPackMeta={block} dispatchMeta={()=>{}} /> :
        mode === 'pdf' ? <MaterialViewer materialMeta={{...material,contentType:'application/pdf'}} file={fileState} /> :
        <MaterialViewerFrame meta={material} file={fileState} materialContentType="text/plain"><p>Preview</p></MaterialViewerFrame>}
    </AppSidebarInset>
  </SidebarProvider>;
}
createRoot(document.getElementById('root')).render(<LoadingProvider><Fixture /></LoadingProvider>);
`;

const mocks: Record<string, string> = {
  "@tanstack/react-router": `export const useRouterState = ({select}) => select({status:'idle'});`,
  "@/hooks": `
    const summary = {root:{id:'root',name:'Workspace',children:{parent:{id:'parent',name:'Folder',children:{},
      blockPackNodes:{item:{name:'Notes'}},materialNodes:{item:{name:'Reference'}}}}}};
    export const useShelfItem = () => ({expandedShelves:new Map([['root',summary]]),isItemNodeEditing:()=>false});
    export const useResizeSidebar = () => ({width:256,sidebarStyle:{'--sidebar-width':'256px'},insetStyle:{paddingLeft:256}});
    export const useSettingsDisplay = () => ({});
    export const useStationRoutine = () => ({});
    export const useAppRouterActions = () => ({push:()=>{}});
    export const useAppRouter = () => ({refresh:()=>{}});
  `,
  "@/hooks/useModal": "export const useModal = () => ({});",
  "@/hooks/useUser": "export const useUser = () => ({});",
  "@/hooks/useBlockEditor": `export const useBlockEditor = () => ({editor:{}, state:'syncError'});`,
  "@/hooks/useLocalPreferences": `export const useLocalPreferences = () => ({preferences:{editorWidth:'standard',editorFontSize:16}});`,
  "@/api/hooks/material.hook":
    "export const useSaveMyMaterialById = () => ({});",
  "@/components/popovers/NotificationPopover":
    "export const NotificationPopover = () => null;",
  "pdfjs-dist": `
    export const GlobalWorkerOptions = {};
    export const getDocument = () => ({
      promise: Promise.resolve({ numPages: 1, getData: async () => new Uint8Array(),
        getPage: async () => ({ getViewport: () => ({ width: 1400, height: 1800 }),
          render: () => ({ promise: Promise.resolve(), cancel() {} }), cleanup() {} }),
      }),
      destroy: async () => {},
    });
  `,
  "@blocknote/react": "export const SideMenuController = () => null;",
  "@blocknote/shadcn": "export const BlockNoteView = () => null;",
  "@/components/core/BlockPackEditor/BlockPackEditorSchema":
    "export const NotegicSlashMenuController = () => null;",
  "@shared/util/convertBlocksToFiles": [
    "DOCX",
    "HTML",
    "JSON",
    "Markdown",
    "PDF",
    "PlainText",
  ]
    .map(format => `export const convertBlocksTo${format} = () => {};`)
    .join("\n"),
};
for (const module of [
  "@/components/menus/RootShelfMenu/RootShelfMenu",
  "@/components/menus/RoutineTagMenu/RoutineTagMenu",
  "@/components/menus/StationMenu/StationMenu",
  "@/components/paths/ItemPath/ItemPathItem",
  "@/components/core/BlockPackEditor/BlockSideMenu",
  "@/components/core/BlockPackEditor/BlockPackParticipantsDropdown",
])
  mocks[module] = "export default () => null;";

describe("editor chrome in Chromium", () => {
  let browser: Browser;
  let page: Page;
  let script: string;
  let css: string;

  beforeAll(async () => {
    const bundle = await build({
      stdin: { contents: fixture, resolveDir: process.cwd(), loader: "tsx" },
      bundle: true,
      write: false,
      metafile: true,
      platform: "browser",
      jsx: "automatic",
      define: {
        "process.env.NODE_ENV": '"development"',
        "import.meta.url": '"http://editor-layout.test/"',
      },
      tsconfig: path.resolve("apps/web/tsconfig.json"),
      plugins: [
        {
          name: "editor-boundaries",
          setup(builder) {
            builder.onResolve({ filter: /\.css$/ }, () => ({
              path: "css",
              namespace: "empty-css",
            }));
            builder.onLoad({ filter: /.*/, namespace: "empty-css" }, () => ({
              contents: "",
              loader: "js",
            }));
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
    const sources = await Promise.all(
      Object.keys(bundle.metafile.inputs)
        .filter(
          file => file.startsWith("apps/web/src/") && file.endsWith("tsx")
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
    browser = await chromium.launch();
  }, 30_000);

  beforeEach(async () => {
    page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    await page.route("http://editor-layout.test/", route =>
      route.fulfill({ contentType: "text/html", body: '<div id="root"></div>' })
    );
    await page.goto("http://editor-layout.test/");
    await page.addStyleTag({ content: css });
    await page.addScriptTag({ content: script });
  });
  afterEach(async () => {
    await page?.close();
  });
  afterAll(async () => {
    await browser?.close();
  });

  test.each([
    "compact",
    "standard",
    "comfortable",
  ])("breadcrumbs align with expanded navigation at %s density", async density => {
    await page.evaluate(value => {
      document.documentElement.dataset.density = value;
    }, density);
    for (const mode of ["material", "block", "pdf"]) {
      await page.evaluate(
        value =>
          (
            window as unknown as { showEditor: (mode: string) => void }
          ).showEditor(value),
        mode
      );
      await page
        .getByRole("button", {
          name: mode === "block" ? "Notes" : "Reference",
          exact: true,
        })
        .waitFor();
      await browserExpect
        .poll(() =>
          page.locator('[aria-label="Breadcrumb"]').evaluate(element => {
            const line = document.querySelector(
              '[data-sidebar="header"] + [data-sidebar="separator"]'
            )!;
            return (
              element.getBoundingClientRect().bottom -
              line.getBoundingClientRect().bottom
            );
          })
        )
        .toBe(0);
      const geometry = await page
        .locator('[aria-label="Breadcrumb"]')
        .evaluate(element => {
          const line = document.querySelector(
            '[data-sidebar="header"] + [data-sidebar="separator"]'
          )!;
          return {
            bottom: element.getBoundingClientRect().bottom,
            lineBottom: line.getBoundingClientRect().bottom,
            background: getComputedStyle(element).backgroundColor,
          };
        });
      expect(geometry.bottom).toBe(geometry.lineBottom);
      expect(geometry.background).not.toBe("rgba(0, 0, 0, 0)");
      const controls = await page
        .locator('header [data-slot="button-group"] button')
        .evaluateAll(elements =>
          elements.map(element => ({
            width: element.getBoundingClientRect().width,
            height: element.getBoundingClientRect().height,
          }))
        );
      expect(controls).toHaveLength(mode === "pdf" ? 12 : 2);
      for (const control of controls)
        expect(control).toEqual({ width: 28, height: 28 });
    }
  });

  test.each([
    "dark",
    "light",
  ])("material and block navigation use the same %s surfaces", async theme => {
    await page.evaluate(value => {
      document.documentElement.className = value;
    }, theme);
    const surfaces = [];
    for (const mode of ["block", "material", "pdf"]) {
      await page.evaluate(value => {
        (
          window as unknown as { showEditor: (mode: string) => void }
        ).showEditor(value);
      }, mode);
      await page
        .getByRole("button", {
          name: mode === "block" ? "Notes" : "Reference",
          exact: true,
        })
        .waitFor();
      surfaces.push(
        await page.locator("header").evaluate(header => {
          const path = header.parentElement!.querySelector(
            'nav[aria-label="Breadcrumb"]'
          )!;
          const barStyle = getComputedStyle(header);
          const pathStyle = getComputedStyle(path);
          return {
            base: getComputedStyle(header.parentElement!).backgroundColor,
            bar: barStyle.backgroundColor,
            barBorder: barStyle.borderBottomColor,
            path: pathStyle.backgroundColor,
            pathBorder: pathStyle.borderBottomColor,
            text: getComputedStyle(path.querySelector("ol")!).color,
          };
        })
      );
    }
    expect(surfaces[1]).toEqual(surfaces[0]);
    expect(surfaces[2]).toEqual(surfaces[0]);
    expect(surfaces[0].base).not.toBe("rgba(0, 0, 0, 0)");
  });

  test("material loading uses the shared full-screen blocking cover", async () => {
    await page.evaluate("setFileLoading(true)");
    const status = page.getByRole("status");
    await browserExpect(status).toBeVisible();
    expect(
      await status.locator("..").evaluate(element => {
        const box = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return {
          x: box.x,
          y: box.y,
          width: box.width,
          height: box.height,
          position: style.position,
          zIndex: style.zIndex,
          blocksControls: element.contains(document.elementFromPoint(1200, 20)),
        };
      })
    ).toEqual({
      x: 0,
      y: 0,
      width: 1280,
      height: 720,
      position: "fixed",
      zIndex: "9999",
      blocksControls: true,
    });
    await page.evaluate("setFileLoading(false)");
    await browserExpect(status).toHaveCount(0);
    await page.getByRole("button", { name: "Refresh", exact: true }).click();
    await page.waitForFunction("window.refreshCount === 1");
  });

  test("PDF tool groups and menus remain reachable on narrow screens", async () => {
    await page.evaluate(() =>
      (window as unknown as { showEditor: (mode: string) => void }).showEditor(
        "pdf"
      )
    );
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 720 });
      const file = page.getByRole("button", { name: "File", exact: true });
      await file.scrollIntoViewIfNeeded();
      await file.click();
      await page
        .getByRole("menuitem", { name: "Download PDF", exact: true })
        .waitFor();
      const box = await page.getByRole("menu").boundingBox();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(width);
      await page.keyboard.press("Escape");
    }
  });

  test("material menus retain file actions, keyboard navigation and focus", async () => {
    await page.getByRole("button", { name: "File", exact: true }).click();
    await page
      .getByRole("menuitem", { name: "Copy URL", exact: true })
      .waitFor();
    expect(
      await page
        .getByRole("menuitem", { name: "Open in new tab", exact: true })
        .count()
    ).toBe(1);
    await page.keyboard.press("Escape");
    expect(
      await page
        .getByRole("button", { name: "File", exact: true })
        .evaluate(node => node === document.activeElement)
    ).toBe(true);
    await page.keyboard.press("Tab");
    expect(
      await page
        .getByRole("button", { name: "Refresh", exact: true })
        .evaluate(node => node === document.activeElement)
    ).toBe(true);
    await page.keyboard.press("Enter");
    await page.waitForFunction("window.refreshCount === 1");
    expect(
      await page.getByRole("button", { name: "View", exact: true }).count()
    ).toBe(0);
  });

  test.each([
    "compact",
    "standard",
    "comfortable",
  ])("PDF scrolling stays inside the viewer at %s density", async density => {
    await page.evaluate(value => {
      document.documentElement.dataset.density = value;
      (window as unknown as { showEditor: (mode: string) => void }).showEditor(
        "pdf"
      );
    }, density);
    await page.waitForFunction(
      "document.querySelector('canvas')?.width === 1400"
    );
    for (const width of [1600, 1024, 800, 390, 320]) {
      await page.setViewportSize({ width, height: 640 });
      await browserExpect
        .poll(() =>
          page.evaluate(() => {
            const root = document.scrollingElement!;
            const canvas = document.querySelector("canvas")!;
            const scroll = canvas.parentElement!.parentElement!.parentElement!;
            const toolbar = document.querySelector("header > div:last-child")!;
            return {
              rootX: root.scrollWidth - root.clientWidth,
              rootY: root.scrollHeight - root.clientHeight,
              toolbarY: toolbar.scrollHeight - toolbar.clientHeight,
              toolbarOverflowY: getComputedStyle(toolbar).overflowY,
              pdfX: scroll.scrollWidth > scroll.clientWidth,
              pdfY: scroll.scrollHeight > scroll.clientHeight,
              pdfOverflow: getComputedStyle(scroll).overflow,
            };
          })
        )
        .toEqual({
          rootX: 0,
          rootY: 0,
          toolbarY: 0,
          toolbarOverflowY: "hidden",
          pdfX: true,
          pdfY: true,
          pdfOverflow: "auto",
        });
      const refresh = page.getByRole("button", {
        name: "Refresh",
        exact: true,
      });
      await refresh.scrollIntoViewIfNeeded();
      await browserExpect(refresh).toBeInViewport();
      expect(
        await page.getByRole("button", { name: "Edit", exact: true }).count()
      ).toBe(0);
    }
  }, 15_000);

  test("material viewer fits the available parent height", async () => {
    await page.evaluate(() => {
      const inset = document.querySelector<HTMLElement>(
        '[data-slot="sidebar-inset"]'
      )!;
      inset.style.paddingTop = "12px";
      inset.style.paddingBottom = "12px";
      (window as unknown as { showEditor: (mode: string) => void }).showEditor(
        "pdf"
      );
    });
    await page.waitForFunction(
      "document.querySelector('canvas')?.width === 1400"
    );
    const sizes = await page
      .locator('[data-slot="sidebar-inset"]')
      .evaluate(element => {
        const style = getComputedStyle(element);
        return {
          available:
            element.clientHeight -
            parseFloat(style.paddingTop) -
            parseFloat(style.paddingBottom),
          viewer: element.firstElementChild!.getBoundingClientRect().height,
        };
      });
    expect(sizes.viewer).toBe(sizes.available);
  });
});
