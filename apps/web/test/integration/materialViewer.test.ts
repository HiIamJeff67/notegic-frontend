import path from "node:path";
import { type Browser, chromium, type Page } from "@playwright/test";
import { build } from "esbuild";

// Real route, query hooks, viewers and PDF editing state; controlled API/PDF engine.
const fixture = `
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { getQueryClient } from '@shared/api/queryClient';
import { queryKeys } from '@shared/api/queryKeys';
import { PDFDocument } from 'pdf-lib';
import { Route } from '@/routes/app.material-viewer.$materialId';
import '@/i18n';

window.ids = {
  materialId: '11111111-1111-4111-8111-111111111111',
  parentSubShelfId: '22222222-2222-4222-8222-222222222222',
  rootShelfId: '33333333-3333-4333-8333-333333333333',
};
window.state = { metadata: 0, tickets: [], resolves: [], saves: 0, pdfLoads: [], files: [] };
window.pending = [];
window.release = () => window.pending.splice(0).forEach(release => release());
window.failStage = null;
window.deferStage = null;
const pause = stage => window.deferStage === stage
  ? new Promise(resolve => window.pending.push(resolve)) : Promise.resolve();
const queryClient = getQueryClient();
window.refresh = () => queryClient.invalidateQueries({ queryKey: queryKeys.material.oneById(window.ids.materialId, true) });
window.cacheState = () => queryClient.getQueryState(queryKeys.material.oneById(window.ids.materialId));
window.api = {
  metadata: async () => {
    window.state.metadata++;
    await pause('metadata');
    return { data: { ...window.material } };
  },
  ticket: async request => {
    const ticket = request.body.objectKey + '-' + (window.state.tickets.length + 1);
    window.state.tickets.push(ticket);
    await pause('ticket');
    if (window.failStage === 'ticket') throw new Error('Ticket denied');
    return { data: { objectTicket: ticket } };
  },
  resolve: async request => {
    const ticket = request.body.objectTicket;
    window.state.resolves.push(ticket);
    await pause('resolve');
    if (window.failStage === 'resolve') throw new Error('Resolution denied');
    return { data: { objectURL: 'https://material.test/file/' + (window.sameURL ? 'stable-url' : ticket) } };
  },
  save: async request => {
    window.state.saves++;
    if (window.failStage === 'save') throw new Error('Upload failed');
    window.material = { ...window.material, objectKey: window.material.objectKey || 'uploaded',
      contentType: request.body.contentFile.type, size: request.body.contentFile.size,
      updatedAt: new Date(window.material.updatedAt.getTime() + 1) };
    return { success: true, exception: null, data: { updatedAt: window.material.updatedAt }, embedded: { publicId: 'test-user' } };
  },
  pdf: async url => {
    window.state.pdfLoads.push(url);
    await pause('pdf');
    return {
      numPages: 1,
      getData: async () => window.pdfBytes,
      getPage: async () => ({
        getViewport: ({ scale }) => ({ width: 200 * scale, height: 200 * scale }),
        render: () => ({ promise: Promise.resolve(), cancel() {} }),
        cleanup() {},
      }),
    };
  },
};
window.mount = async overrides => {
  window.material = {
    id: window.ids.materialId, parentSubShelfId: window.ids.parentSubShelfId,
    rootShelfId: window.ids.rootShelfId, name: 'Test material', size: 20,
    contentType: 'text/plain', parseMediaType: 'text', objectKey: 'original',
    parentSubShelfPath: [], deletedAt: null, createdAt: new Date(0), updatedAt: new Date(1),
    ...overrides,
  };
  const pdf = await PDFDocument.create();
  pdf.addPage([200, 200]);
  window.pdfBytes = await pdf.save();
  queryClient.setQueryData(queryKeys.material.oneById(window.ids.materialId), { data: window.material });
  const Component = Route.component;
  function Harness() {
    const [, setRevision] = useState(0);
    window.navigate = () => {
      window.ids = { ...window.ids, materialId: '44444444-4444-4444-8444-444444444444' };
      window.material = { ...window.material, id: window.ids.materialId, objectKey: 'next-material' };
      setRevision(value => value + 1);
    };
    return <QueryClientProvider client={queryClient}><Component /></QueryClientProvider>;
  }
  createRoot(document.getElementById('root')).render(<Harness />);
};
`;

const mocks: Record<string, string> = {
  "@tanstack/react-router": `
    export const createFileRoute = () => options => options;
    export const useLoaderData = () => window.ids;
    export const notFound = () => new Error('Not found');`,
  "@/hooks": `
    const shelves = { expandedShelves: new Map(), isItemNodeEditing: () => false };
    export const useShelfItem = () => shelves;`,
  "@/components/covers/LoadingCover/LoadingCover": `export default () => <p>Loading metadata</p>;`,
  "@/pages/app/material-viewer/MaterialViewerNotFoundPage": `export default () => <p>Material not found</p>;`,
  "@/api/clientHeaders": `export const getClientRequestHeaders = () => ({});`,
  "@/api/functions/material.clientFn": `export const SaveMyMaterialById = request => window.api.save(request);`,
  "@/api/invokers/material.invoker": `
    export const queryFnGetMyMaterialAndItsParentById = request => window.api.metadata(request);
    export const mutationFnCreateMaterialObjectTicket = request => window.api.ticket(request);
    export const queryFnResolveMaterialObjectTicket = request => window.api.resolve(request);
    ${[
      "mutationFnCreateMyMaterial",
      "mutationFnDeleteMyMaterialById",
      "mutationFnDeleteMyMaterialsByIds",
      "mutationFnMoveMyMaterialById",
      "mutationFnRestoreMyMaterialById",
      "mutationFnRestoreMyMaterialsByIds",
      "mutationFnUpdateMyMaterialById",
      "queryFnGetMyMaterialsByRootShelfId",
      "queryFnGetMyMaterialById",
      "queryFnGetMyMaterialsByParentSubShelfId",
    ]
      .map(
        name =>
          `export const ${name} = () => { throw new Error('Unexpected API call'); };`
      )
      .join("\n")}`,
  "@/components/commons/DropFileZone/DropFileZone": `export default function DropFileZone({ onDrop }) {
    window.startImport = () => onDrop([new File(['replacement'], 'note.txt', { type: 'text/plain' })]);
    return null;
  }`,
  "@/components/paths/ItemPath/ItemPath": `export default () => null;`,
  "@/components/ui/sidebar": `export const SidebarTrigger = () => null; export const useSidebar = () => ({ isMobile: false });`,
  "pdfjs-dist": `
    export const GlobalWorkerOptions = {};
    export const getDocument = ({ url }) => ({ promise: window.api.pdf(url), destroy: async () => {} });`,
};

describe("material file lifecycle in Chromium", () => {
  let browser: Browser;
  let page: Page;
  let script: string;
  let errors: string[] = [];

  beforeAll(async () => {
    const result = await build({
      stdin: { contents: fixture, resolveDir: process.cwd(), loader: "tsx" },
      bundle: true,
      write: false,
      platform: "browser",
      jsx: "automatic",
      define: {
        "process.env.NODE_ENV": '"development"',
        "import.meta.url": '"https://material.test/editor.js"',
      },
      tsconfig: path.resolve("apps/web/tsconfig.json"),
      plugins: [
        {
          name: "material-api-boundaries",
          setup(builder) {
            builder.onResolve({ filter: /.*/ }, args =>
              args.path in mocks
                ? { path: args.path, namespace: "material-test" }
                : undefined
            );
            builder.onLoad(
              { filter: /.*/, namespace: "material-test" },
              args => ({
                contents: mocks[args.path],
                loader: "tsx",
                resolveDir: process.cwd(),
              })
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
    errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.route("https://material.test/**", async route => {
      const url = route.request().url();
      if (url.includes("/file/")) {
        await page.evaluate(value => {
          (
            window as unknown as { state: { files: string[] } }
          ).state.files.push(value);
        }, url);
        await route.fulfill({
          contentType: "text/plain",
          body: `Preview ${url.split("/").pop()}`,
        });
      } else {
        await route.fulfill({
          contentType: "text/html",
          body: '<div id="root"></div>',
        });
      }
    });
    await page.goto("https://material.test/");
    await page.addScriptTag({ content: script });
  });

  afterEach(async () => {
    await page?.close();
    expect(errors).toEqual([]);
  });
  afterAll(async () => {
    await browser?.close();
  });

  it.each([
    "ticket",
    "resolve",
  ])("waits for delayed %s without showing an empty-file message", async stage => {
    await page.evaluate(`deferStage = '${stage}'; void mount({});`);
    await page.getByText("Loading file...", { exact: true }).waitFor();
    await page.waitForFunction("pending.length === 1");
    expect(
      await page.getByText("No file uploaded.", { exact: false }).count()
    ).toBe(0);
    await page.evaluate("deferStage = null; release();");
    await page.getByText("Preview original-1", { exact: true }).waitFor();
    expect(await page.evaluate("state.files.length")).toBe(1);
  });

  it.each([
    "",
    "original",
  ])("refreshes both metadata variants after uploading over object key '%s'", async objectKey => {
    await page.evaluate(`void mount({ objectKey: '${objectKey}' });`);
    if (!objectKey) {
      await page
        .getByText("No file uploaded. Upload a file to view it.", {
          exact: true,
        })
        .waitFor();
      expect(await page.evaluate("state.tickets.length")).toBe(0);
    } else {
      await page.getByText("Preview original-1", { exact: true }).waitFor();
    }
    await page.getByRole("button", { name: "File", exact: true }).click();
    await page.getByRole("menuitem", { name: "Import", exact: true }).click();
    await page.waitForFunction("typeof startImport === 'function'");
    await page.evaluate("void startImport();");
    const preview = objectKey ? "Preview original-2" : "Preview uploaded-1";
    await page.getByText(preview, { exact: true }).waitFor();
    expect(await page.evaluate("state.saves")).toBe(1);
    expect(await page.evaluate("state.metadata")).toBe(2);
    expect(await page.evaluate("cacheState().isInvalidated")).toBe(true);
  });

  it.each([
    "ticket",
    "resolve",
  ])("shows %s failure once and recovers with an explicit refresh", async stage => {
    await page.evaluate(`failStage = '${stage}'; void mount({});`);
    await page.getByRole("alert").waitFor();
    expect(
      await page.getByText("No file uploaded.", { exact: false }).count()
    ).toBe(0);
    expect(await page.evaluate("state.tickets.length")).toBe(1);
    await page.evaluate("failStage = null;");
    await page.getByRole("button", { name: "Refresh", exact: true }).click();
    await page.getByText("Preview original-2", { exact: true }).waitFor();
    expect(await page.evaluate("state.metadata")).toBe(2);
  });

  it("reloads content after replacing a file even when its resolved URL stays the same", async () => {
    await page.evaluate("sameURL = true; void mount({});");
    await page.getByText("Preview stable-url", { exact: true }).waitFor();
    await page.getByRole("button", { name: "File", exact: true }).click();
    await page.getByRole("menuitem", { name: "Import", exact: true }).click();
    await page.waitForFunction("typeof startImport === 'function'");
    await page.evaluate("void startImport();");
    await page.waitForFunction("state.files.length === 2");
    expect(await page.evaluate("state.saves")).toBe(1);
  });

  it("ignores an old material's URL resolution after navigating away", async () => {
    await page.evaluate("deferStage = 'resolve'; void mount({});");
    await page.waitForFunction("pending.length === 1");
    await page.evaluate("deferStage = null; navigate();");
    await page.getByText("Preview next-material-2", { exact: true }).waitFor();
    await page.evaluate("release();");
    await page.waitForFunction(
      "state.resolves.length === 2 && pending.length === 0"
    );
    expect(
      await page.getByText("Preview original-1", { exact: true }).count()
    ).toBe(0);
    expect(
      await page.evaluate(
        "state.files.every(url => url.includes('next-material'))"
      )
    ).toBe(true);
  });

  it("keeps PDF zoom, tool and unsaved annotations through URL refresh and failure", async () => {
    await page.evaluate("void mount({ contentType: 'application/pdf' });");
    await page.getByRole("button", { name: "Zoom in", exact: true }).waitFor();
    await page.waitForFunction(
      "document.querySelector('canvas')?.width === 300"
    );
    await page.getByRole("button", { name: "Zoom in", exact: true }).click();
    await page.waitForFunction(
      "document.querySelector('canvas')?.width === 350"
    );
    await page.getByRole("radio", { name: "Drawing", exact: true }).click();
    await page
      .locator("canvas")
      .dispatchEvent("mousedown", { clientX: 20, clientY: 20 });
    await page
      .locator("canvas")
      .dispatchEvent("mousemove", { clientX: 80, clientY: 80 });
    await page
      .locator("canvas")
      .dispatchEvent("mouseup", { clientX: 80, clientY: 80 });
    await page.waitForFunction(
      "!document.querySelector('[aria-label=\"Clear annotations\"]')?.disabled"
    );
    await page.evaluate("failStage = 'ticket'; void refresh();");
    await page.getByRole("alert").waitFor();
    await page.evaluate("failStage = null;");
    await page.getByRole("button", { name: "Refresh", exact: true }).click();
    await page.waitForFunction(
      "document.querySelector('canvas')?.width === 350"
    );
    expect(
      await page
        .getByRole("button", { name: "Clear annotations", exact: true })
        .isEnabled()
    ).toBe(true);
    expect(
      await page
        .getByRole("radio", { name: "Drawing", exact: true })
        .getAttribute("data-state")
    ).toBe("on");
    expect(await page.evaluate("state.pdfLoads.length")).toBe(2);

    // A failed save must not discard the annotations; a confirmed save may clear them.
    await page.evaluate("failStage = 'save';");
    await page.getByRole("button", { name: "File", exact: true }).click();
    await page
      .getByRole("menuitem", { name: "Save annotations", exact: false })
      .click();
    await page.waitForFunction("state.saves === 2");
    await page.getByRole("button", { name: "File", exact: true }).click();
    await page.waitForFunction(
      "Array.from(document.querySelectorAll('[role=\"menuitem\"]')).some(item => item.textContent.includes('Save annotations') && !item.hasAttribute('data-disabled'))"
    );
    expect(
      await page
        .getByRole("menuitem", { name: "Save annotations", exact: false })
        .isEnabled()
    ).toBe(true);
    await page.evaluate("failStage = null;");
    await page
      .getByRole("menuitem", { name: "Save annotations", exact: false })
      .click();
    await page.waitForFunction(
      "state.pdfLoads.length === 3 && document.querySelector('canvas')?.width === 350"
    );
    expect(
      await page
        .getByRole("button", { name: "Clear annotations", exact: true })
        .isDisabled()
    ).toBe(true);
    expect(
      await page
        .getByRole("radio", { name: "Drawing", exact: true })
        .getAttribute("data-state")
    ).toBe("on");
  });
});
