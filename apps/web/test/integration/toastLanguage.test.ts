import path from "node:path";
import { type Browser, chromium, type Page } from "@playwright/test";
import { build } from "esbuild";

// Real providers, editor handlers, i18n and toast store; isolated storage/API edges.
const fixture = `
import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useTranslation } from '@shared/i18n/useTranslation';
import { WidgetProvider } from '@/providers/WidgetProvider';
import { useWidget } from '@/hooks/useWidget';
import { useToast } from '@/hooks/use-toast';
import MaterialViewerFrame from '@/components/core/MaterialViewer/MaterialViewerFrame';
import { MaterialContentType } from '@shared/api/interfaces/enums';
import i18n from '@/i18n';
window.state = { reads: 0, requests: 0, refreshes: 0, toasts: [] };
window.changeLanguage = language => i18n.changeLanguage(language);
function Probe() {
  const widgets = useWidget();
  const { toasts } = useToast();
  const { t } = useTranslation();
  const [revision, setRevision] = useState(0);
  const saveLabel = useMemo(() => {
    window.state.labelBuilds = (window.state.labelBuilds ?? 0) + 1;
    return t('common.save');
  }, [t]);
  window.rerender = () => setRevision(value => value + 1);
  window.retainedT ??= t;
  window.currentT = t;
  window.widgets = widgets;
  window.retainedSync ??= widgets.sync;
  window.state.toasts = toasts.map(item => item.title);
  return <span id="language" data-revision={revision}>{saveLabel}</span>;
}
createRoot(document.getElementById('root')).render(
  <WidgetProvider>
    <Probe />
    <MaterialViewerFrame file={{ isLoading: false, isError: false, onRefresh: () => {} }} materialContentType={MaterialContentType.PlainText} meta={{
      id: 'material-1', parentId: 'shelf-1', rootId: 'root-1', name: 'Note',
      contentType: 'text/plain', size: 0, downloadURL: '/note.txt',
      createdAt: new Date(), updatedAt: new Date(), path: [],
    }}>Note</MaterialViewerFrame>
  </WidgetProvider>
);
`;

const mocks: Record<string, string> = {
  "@/hooks": `
    const userData = { publicId: 'user-1' };
    const router = { refresh: () => window.state.refreshes++ };
    const shelves = { expandedShelves: new Map() };
    export const useUser = () => ({ userData });
    export const useAppRouter = () => router;
    export const useShelfItem = () => shelves;`,
  "@shared/lib/localStorageManipulator": `export const LocalStorageManipulator = {
    getItemByKey: () => { window.state.reads++; return '[]'; }, setItem: () => {},
  };`,
  "@/components/widgets/basic/basic": `export const DashboardPreviewWidgets = {};`,
  "@/api/clientHeaders": `export const getClientRequestHeaders = () => ({});`,
  "@/api/hooks/material.hook": `
    import { NotegicAPIError, NotegicException } from '@shared/api/exceptions';
    const mutator = { mutateAsync: () => {
      window.state.requests++;
      return new Promise((resolve, reject) => {
        window.finishImport = () => resolve({});
        window.failImport = () => reject(new NotegicAPIError(new NotegicException({
          reason: 'InvalidDto', domain: 'core', operation: 'update', message: 'invalid input', retryable: false,
        })));
      });
    }};
    export const useSaveMyMaterialById = () => mutator;`,
  "@/components/commons/DropFileZone/DropFileZone": `export default function DropFileZone({ onDrop }) {
    window.startImport = () => onDrop([new File(['note'], 'note.txt')]);
    return null;
  }`,
  "@/components/paths/ItemPath/ItemPath": `export default () => null;`,
  "@/components/ui/sidebar": `export const SidebarTrigger = () => null; export const useSidebar = () => ({ isMobile: false });`,
};

describe("toast language in Chromium", () => {
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
          name: "toast-language-boundaries",
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
    browser = await chromium.launch();
  }, 30_000);

  beforeEach(async () => {
    page = await browser.newPage();
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.setContent('<div id="root"></div>');
    await page.addScriptTag({ content: script });
    try {
      await page.waitForFunction(
        "state.reads === 1 && window.widgets",
        undefined,
        { timeout: 2000 }
      );
    } catch (error) {
      throw new Error(`${errors.join("\n")}\n${String(error)}`);
    }
  });
  afterEach(async () => {
    await page?.close();
  });
  afterAll(async () => {
    await browser?.close();
  });

  it("updates memoized labels while retained translators follow the current language", async () => {
    await page.waitForFunction(
      "document.getElementById('language').textContent === 'Save'"
    );
    const initialBuilds = Number(await page.evaluate("state.labelBuilds"));
    await page.evaluate("rerender();");
    await page.waitForFunction(
      "document.getElementById('language').dataset.revision === '1'"
    );
    expect(await page.evaluate("state.labelBuilds")).toBe(initialBuilds);
    expect(await page.evaluate("currentT === retainedT")).toBe(true);

    await page.evaluate("changeLanguage('zh-TW');");
    await page.waitForFunction(
      "document.getElementById('language').textContent === '儲存'"
    );
    expect(await page.evaluate("state.labelBuilds")).toBeGreaterThan(
      initialBuilds
    );
    expect(await page.evaluate("currentT === retainedT")).toBe(false);
    expect(await page.evaluate("retainedT('common.save')")).toBe("儲存");
    expect(
      await page.evaluate(
        "retainedT('workspace.notifications.fileImported', { name: 'note.txt' })"
      )
    ).toBe("已匯入 note.txt。");

    await page.evaluate("changeLanguage('en');");
    await page.waitForFunction(
      "document.getElementById('language').textContent === 'Save'"
    );
    expect(await page.evaluate("retainedT('common.save')")).toBe("Save");
  });

  it("uses the current language in a retained callback without reloading unsaved widgets", async () => {
    await page.evaluate(`
      widgets.append({ id: 'widget-1', name: 'unsaved', position: { leftFrameCount: 0, topFrameCount: 0 } });
      retainedSync();
    `);
    await page.waitForFunction("state.toasts[0] === 'Widgets saved.'");
    await page.evaluate(
      "widgets.append({ id: 'widget-2', name: 'unsaved', position: { leftFrameCount: 0, topFrameCount: 1 } }); changeLanguage('zh-TW');"
    );
    await page.waitForFunction("document.documentElement.lang === 'zh-TW'");
    expect(await page.evaluate("state.reads")).toBe(1);
    expect(await page.evaluate("widgets.getWidgetsLength()")).toBe(2);
    await page.evaluate("retainedSync();");
    await page.waitForFunction("state.toasts[0] === '已儲存小工具。'");
    expect(await page.evaluate("state.toasts[1]")).toBe("Widgets saved.");
  });

  it.each([
    ["finishImport", "已匯入 note.txt。"],
    ["failImport", "提交的資料有部分格式不正確。"],
  ])("translates %s after switching language during a pending import", async (finish, message) => {
    await page.getByRole("button", { name: "File", exact: true }).click();
    await page.getByRole("menuitem", { name: "Import", exact: true }).click();
    await page.waitForFunction("typeof window.startImport === 'function'");
    await page.evaluate("void startImport();");
    await page.waitForFunction("state.requests === 1");
    await page.evaluate("changeLanguage('zh-TW');");
    await page.waitForFunction("document.documentElement.lang === 'zh-TW'");
    await page.evaluate(`${finish}();`);
    await page.waitForFunction("state.toasts.length === 1");
    expect(await page.evaluate("state.toasts[0]")).toBe(message);
    expect(await page.evaluate("state.requests")).toBe(1);
  });
});
