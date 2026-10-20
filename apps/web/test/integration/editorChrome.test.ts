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
import MaterialPDFViewerContent from '@/components/core/MaterialViewer/MaterialPDFViewerContent';
import { getDefaultBlockPackMeta } from '@shared/reducers/blockPackMeta.reducer';
import { getDefaultMaterialMeta } from '@shared/reducers/materialMeta.reducer';
import '@/i18n';
const block = {...getDefaultBlockPackMeta('item','parent','root'), name:'Notes',
  pathItems:[{id:'root',name:'Workspace'},{id:'parent',name:'Folder'}]};
const material = {...getDefaultMaterialMeta('item','parent','root'), name:'Reference', downloadURL:'https://example.invalid/file.txt'};
function Fixture() {
  const [mode, setMode] = useState('material');
  window.showEditor = setMode;
  return <SidebarProvider>
    <AppSidebar />
    <AppSidebarInset>
      {mode === 'block' ? <BlockPackEditorContent blockPackMeta={block} dispatchMeta={()=>{}} /> :
        mode === 'pdf' ? <MaterialPDFViewerContent meta={{...material,downloadURL:null}} /> :
        <MaterialViewerFrame meta={material} materialContentType="text/plain"><p>Preview</p></MaterialViewerFrame>}
    </AppSidebarInset>
  </SidebarProvider>;
}
createRoot(document.getElementById('root')).render(<Fixture />);
`;

const mocks: Record<string, string> = {
  "@/hooks": `
    const summary = {root:{id:'root',name:'Workspace',children:{parent:{id:'parent',name:'Folder',children:{},
      blockPackNodes:{item:{name:'Notes'}},materialNodes:{item:{name:'Reference'}}}}}};
    export const useShelfItem = () => ({expandedShelves:new Map([['root',summary]])});
    export const useResizeSidebar = () => ({width:256,sidebarStyle:{'--sidebar-width':'256px'},insetStyle:{paddingLeft:256}});
    export const useSettingsDisplay = () => ({});
    export const useStationRoutine = () => ({});
    export const useAppRouterActions = () => ({push:()=>{}});
    export const useAppRouter = () => ({refresh:()=>{}});
  `,
  "@/hooks/useModal": "export const useModal = () => ({});",
  "@/hooks/useUser": "export const useUser = () => ({});",
  "@/hooks/useBlockEditor": `export const useBlockEditor = () => ({editor:{}, state:'syncError'});`,
  "@/hooks/localPreferences": `export const useLocalPreferences = () => ({preferences:{editorWidth:'standard',editorFontSize:16}});`,
  "@/api/hooks/material.hook":
    "export const useSaveMyMaterialById = () => ({});",
  "@/components/popovers/NotificationPopover":
    "export const NotificationPopover = () => null;",
  "pdfjs-dist": `
    export const GlobalWorkerOptions = {};
    export const getDocument = () => { throw new Error('PDF loading is outside this toolbar fixture'); };
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
      expect(controls).toHaveLength(mode === "pdf" ? 10 : 2);
      for (const control of controls)
        expect(control).toEqual({ width: 28, height: 28 });
    }
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
    await page.keyboard.press("Enter");
    await page
      .getByRole("menuitem", { name: "Refresh", exact: true })
      .waitFor();
    await page.keyboard.press("Escape");
    expect(
      await page
        .getByRole("button", { name: "View", exact: true })
        .evaluate(node => node === document.activeElement)
    ).toBe(true);
  });
});
