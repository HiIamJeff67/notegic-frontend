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
import { NotegicAPIError, NotegicException } from '@shared/api/exceptions';
import { clearClientCSRFToken, setClientCSRFToken } from '@/api/clientHeaders';
import { useResolveMaterialObjectTicket } from '@/api/hooks/material.hook';
import { PDFDocument } from 'pdf-lib';
import { Route } from '@/routes/app.material-viewer.$materialId';
import { LoadingProvider } from '@/providers/LoadingProvider';
import { useLoading } from '@/hooks/useLoading';
import '@/i18n';

window.ids = {
  materialId: '11111111-1111-4111-8111-111111111111',
  parentSubShelfId: '22222222-2222-4222-8222-222222222222',
  rootShelfId: '33333333-3333-4333-8333-333333333333',
};
window.state = { metadata: 0, tickets: [], resolves: [], saves: 0, pdfLoads: [], files: [], renderedPages: [] };
window.state.sessionHeaders = [];
window.state.authRequired = 0;
window.addEventListener('notegic:auth-required', () => window.state.authRequired++);
window.expectedCSRFToken = 'initial-csrf';
setClientCSRFToken(window.expectedCSRFToken);
window.setCSRFToken = setClientCSRFToken;
window.clearCSRFToken = clearClientCSRFToken;
window.pending = [];
window.release = () => window.pending.splice(0).forEach(release => release());
window.deferFetch = false;
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
    window.state.sessionHeaders.push({ stage: 'ticket', ...request.header });
    if (request.header?.csrfToken !== window.expectedCSRFToken || request.header?.userAgent !== navigator.userAgent)
      throw new Error('Ticket request omitted current session headers');
    const ticket = request.body.objectKey + '-' + (window.state.tickets.length + 1);
    window.state.tickets.push(ticket);
    await pause('ticket');
    if (window.failStage === 'ticket') throw new Error('Ticket denied');
    window.expectedCSRFToken = 'renewed-csrf-' + ticket;
    // The mocked invoker replaces the network boundary that publishes renewal.
    setClientCSRFToken(window.expectedCSRFToken);
    return { data: { objectTicket: ticket }, refreshableTokens: { newCSRFToken: window.expectedCSRFToken } };
  },
  resolve: async request => {
    const ticket = request.body.objectTicket;
    window.state.resolves.push(ticket);
    window.state.sessionHeaders.push({ stage: 'resolve', ...request.header });
    if (!request.header?.csrfToken || request.header.csrfToken !== window.expectedCSRFToken) {
      throw new NotegicAPIError(new NotegicException({
        reason: 'InvalidCSRFToken', domain: 'Token', operation: 'ValidateCSRFToken',
        message: 'The CSRF token is missing or invalid', retryable: false,
      }, 401));
    }
    if (request.header.userAgent !== navigator.userAgent)
      throw new Error('Resolution request omitted the browser User-Agent');
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
    if (window.failStage === 'pdf') throw new Error('PDF download failed');
    return {
      numPages: window.pdfPageCount ?? 1,
      getData: async () => window.pdfBytes,
      getPage: async pageNumber => ({
        getViewport: ({ scale }) => ({ width: 200 * scale, height: 200 * scale }),
        render: () => { window.state.renderedPages.push(pageNumber); return { promise: pause('render').then(() => { if(window.failStage === 'render') throw new Error('PDF render failed'); }), cancel() {} }; },
        cleanup() {},
      }),
    };
  },
};
window.mountResolver = () => {
  function Harness() {
    const query = useResolveMaterialObjectTicket('standalone-ticket');
    window.refetchResolver = () => query.refetch();
    if (query.isError) return <p role="alert">Resolution failed</p>;
    return <p>{query.data?.data.objectURL ?? 'Resolving ticket'}</p>;
  }
  createRoot(document.getElementById('root')).render(
    <QueryClientProvider client={queryClient}><Harness /></QueryClientProvider>
  );
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
  for (let index=0;index<(window.pdfPageCount??1);index++) pdf.addPage([200, 200]);
  window.pdfBytes = await pdf.save();
  queryClient.setQueryData(queryKeys.material.oneById(window.ids.materialId), { data: window.material });
  const Component = Route.component;
  function Harness() {
    const loading = useLoading();
    window.loadingState = {strict:loading.isStrictLoading, lax:loading.isLaxLoading};
    window.startStrictLoading = () => loading.startAsyncTransactionLoading(() => new Promise(resolve => { window.finishStrictLoading = resolve; }));
    const [, setRevision] = useState(0);
    window.navigate = () => {
      window.ids = { ...window.ids, materialId: '44444444-4444-4444-8444-444444444444' };
      window.material = { ...window.material, id: window.ids.materialId, objectKey: 'next-material' };
      setRevision(value => value + 1);
    };
    return <QueryClientProvider client={queryClient}><Component /></QueryClientProvider>;
  }
  window.unmount = () => root.unmount();
  const root = createRoot(document.getElementById('root'));
  root.render(<LoadingProvider><Harness /></LoadingProvider>);
};
`;

const mocks: Record<string, string> = {
  "@/api/local/synchronizers/material.synchronizer": `export class MaterialLocalSynchronizer {
    static syncHardDeleteMyMaterialsByIds() { throw new Error('Unexpected local deletion'); }
  }`,
  "@tanstack/react-router": `
    export const createFileRoute = () => options => options;
    export const useLoaderData = () => window.ids;
    export const useRouterState = ({select}) => select({status:'idle'});
    export const notFound = () => new Error('Not found');`,
  "@/hooks": `
    const shelves = { expandedShelves: new Map(), isItemNodeEditing: () => false };
    export const useShelfItem = () => shelves;`,
  "@/pages/app/material-viewer/MaterialViewerNotFoundPage": `export default () => <p>Material not found</p>;`,
  "@/api/functions/material.clientFn": `export const SaveMyMaterialById = request => window.api.save(request);`,
  "@/api/invokers/material.invoker": `
    export const queryFnGetMyMaterialAndItsParentById = request => window.api.metadata(request);
    export const mutationFnCreateMaterialObjectTicket = request => window.api.ticket(request);
    export const queryFnResolveMaterialObjectTicket = request => window.api.resolve(request);
    ${[
      "mutationFnCreateMyMaterial",
      "mutationFnDeleteMyMaterialById",
      "mutationFnDeleteMyMaterialsByIds",
      "mutationFnHardDeleteMyMaterialsByIds",
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
      loader: { ".css": "empty" },
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
    browser = await chromium.launch({
      channel: process.env.PLAYWRIGHT_CHANNEL,
    });
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
        await page.waitForFunction("!window.deferFetch");
        if (route.request().resourceType() === "image") {
          await route.fulfill({
            contentType: "image/png",
            body: Buffer.from(
              "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j4uoAAAAASUVORK5CYII=",
              "base64"
            ),
          });
        } else {
          await route.fulfill({
            contentType: "text/plain",
            body: `Preview ${url.split("/").pop()}`,
          });
        }
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

  it("exposes page navigation and refresh without resetting the PDF view", async () => {
    await page.evaluate(
      "window.pdfPageCount=3; void mount({ contentType: 'application/pdf' });"
    );
    await page.waitForFunction(
      "document.querySelector('canvas')?.width === 300"
    );
    expect(
      await page.getByRole("button", { name: "Edit", exact: true }).count()
    ).toBe(0);
    expect(
      await page.getByRole("button", { name: "View", exact: true }).count()
    ).toBe(0);
    const previous = page.getByRole("button", {
      name: "Previous page",
      exact: true,
    });
    const next = page.getByRole("button", { name: /Next page/ });
    expect(await previous.isDisabled()).toBe(true);
    await next.click();
    await page.waitForFunction("window.state.renderedPages.at(-1) === 2");
    expect(await previous.isEnabled()).toBe(true);
    await next.click();
    await page.waitForFunction("window.state.renderedPages.at(-1) === 3");
    expect(await next.isDisabled()).toBe(true);
    await previous.click();
    await page.waitForFunction("window.state.renderedPages.at(-1) === 2");
    await page.getByRole("button", { name: /Reset zoom/ }).click();
    await page.waitForFunction(
      "document.querySelector('canvas')?.width === 200"
    );
    await page.getByRole("button", { name: "Refresh", exact: true }).click();
    await page.waitForFunction(
      "window.state.metadata === 2 && window.state.pdfLoads.length === 2 && window.state.renderedPages.at(-1) === 2 && document.querySelector('canvas')?.width === 200"
    );
  });

  const dispatchKey = (
    options: Pick<
      KeyboardEventInit,
      "key" | "code" | "metaKey" | "altKey" | "ctrlKey" | "isComposing"
    >
  ) =>
    page.evaluate(async init => {
      const event = new KeyboardEvent("keydown", {
        bubbles: true,
        cancelable: true,
        ...init,
      });
      (document.activeElement ?? document.body).dispatchEvent(event);
      await new Promise(requestAnimationFrame);
      return event.defaultPrevented;
    }, options);

  it.each([
    "cmd",
    "alt",
  ])("zooms only the hovered PDF with %s and leaves bare keys alone", async modifier => {
    await page.evaluate("void mount({ contentType: 'application/pdf' });");
    const canvas = page.locator("canvas");
    await page.waitForFunction(
      "document.querySelector('canvas')?.width === 300"
    );
    await canvas.hover();
    for (const key of ["+", "=", "-", "0"]) {
      expect(await dispatchKey({ key })).toBe(false);
      expect(await canvas.getAttribute("width")).toBe("300");
    }

    const modifiers = modifier === "cmd" ? { metaKey: true } : { altKey: true };
    expect(await dispatchKey({ key: "+", code: "Equal", ...modifiers })).toBe(
      true
    );
    await page.waitForFunction(
      "document.querySelector('canvas')?.width === 350"
    );
    expect(await dispatchKey({ key: "-", code: "Minus", ...modifiers })).toBe(
      true
    );
    await page.waitForFunction(
      "document.querySelector('canvas')?.width === 300"
    );
    expect(await dispatchKey({ key: "0", ...modifiers })).toBe(true);
    await page.waitForFunction(
      "document.querySelector('canvas')?.width === 200"
    );
    await canvas.hover();
    await page.keyboard.press(modifier === "cmd" ? "Meta+Equal" : "Alt+Equal");
    await page.waitForFunction(
      "document.querySelector('canvas')?.width === 250"
    );
    await canvas.hover();
    await page.keyboard.press(modifier === "cmd" ? "Meta+Minus" : "Alt+Minus");
    await page.waitForFunction(
      "document.querySelector('canvas')?.width === 200"
    );
  });

  it("recognizes Option-transformed keys and keeps zoom within its existing limits", async () => {
    await page.evaluate("void mount({ contentType: 'application/pdf' });");
    await page.waitForFunction(
      "document.querySelector('canvas')?.width === 300"
    );
    await page.locator("canvas").hover();
    for (let index = 0; index < 10; index++) {
      await page.locator("canvas").hover();
      expect(await dispatchKey({ key: "≠", code: "Equal", altKey: true })).toBe(
        true
      );
    }
    expect(await page.locator("canvas").getAttribute("width")).toBe("600");
    for (let index = 0; index < 12; index++) {
      await page.locator("canvas").hover();
      expect(await dispatchKey({ key: "–", code: "Minus", altKey: true })).toBe(
        true
      );
    }
    expect(await page.locator("canvas").getAttribute("width")).toBe("100");
  });

  it("does not intercept browser zoom over the sidebar, toolbar or editable fields", async () => {
    await page.evaluate("void mount({ contentType: 'application/pdf' });");
    await page.waitForFunction(
      "document.querySelector('canvas')?.width === 300"
    );
    await page.evaluate(() => {
      const sidebar = document.createElement("aside");
      sidebar.id = "sidebar";
      sidebar.style.cssText =
        "position:fixed;right:0;top:0;width:120px;height:120px";
      sidebar.textContent = "Sidebar";
      document.body.append(sidebar);
    });
    for (const target of [
      page.locator("#sidebar"),
      page.getByRole("button", { name: "Zoom in", exact: true }),
    ]) {
      await page.locator("canvas").hover();
      await target.hover();
      for (const modifiers of [
        { metaKey: true },
        { altKey: true },
        { ctrlKey: true },
      ]) {
        for (const key of ["+", "-", "0"]) {
          expect(await dispatchKey({ key, ...modifiers })).toBe(false);
        }
      }
      expect(await page.locator("canvas").getAttribute("width")).toBe("300");
    }

    await page.locator("canvas").hover();
    expect(await dispatchKey({ key: "+", ctrlKey: true })).toBe(false);
    expect(
      await dispatchKey({ key: "+", metaKey: true, isComposing: true })
    ).toBe(false);
    expect(await page.locator("canvas").getAttribute("width")).toBe("300");

    await page.evaluate(() => {
      const input = document.createElement("input");
      input.id = "draft";
      input.value = "Unsaved annotation";
      document.querySelector("canvas")!.parentElement!.append(input);
    });
    await page.locator("#draft").focus();
    await page.locator("#draft").hover();
    expect(await dispatchKey({ key: "+", metaKey: true })).toBe(false);
    expect(await page.locator("#draft").inputValue()).toBe(
      "Unsaved annotation"
    );
    expect(await page.locator("canvas").getAttribute("width")).toBe("300");
  });

  it("uses renewed CSRF headers to open a material without expiring the session", async () => {
    await page.evaluate("void mount({});");
    await page.getByText("Preview original-1", { exact: true }).waitFor();
    const userAgent = await page.evaluate(() => navigator.userAgent);
    expect(await page.evaluate("state.sessionHeaders")).toEqual([
      { stage: "ticket", userAgent, csrfToken: "initial-csrf" },
      {
        stage: "resolve",
        userAgent,
        csrfToken: "renewed-csrf-original-1",
      },
    ]);
    expect(await page.evaluate("state.authRequired")).toBe(0);
    expect(
      await page.evaluate('sessionStorage.getItem("notegic_CSRFToken")')
    ).toBe(JSON.stringify("renewed-csrf-original-1"));
  });

  it("reads current CSRF headers on automatic ticket resolution and refetch", async () => {
    await page.evaluate("mountResolver();");
    await page
      .getByText("https://material.test/file/standalone-ticket", {
        exact: true,
      })
      .waitFor();
    await page.evaluate(`
      expectedCSRFToken = 'rotated-csrf';
      window.setCSRFToken(expectedCSRFToken);
      void refetchResolver();
    `);
    await page.waitForFunction(
      "state.resolves.length === 2 && state.sessionHeaders.length === 2"
    );
    expect(
      await page.evaluate(
        "state.sessionHeaders.map(header => header.csrfToken)"
      )
    ).toEqual(["initial-csrf", "rotated-csrf"]);
    expect(await page.evaluate("state.authRequired")).toBe(0);
    expect(await page.getByRole("alert").count()).toBe(0);
  });

  it("still reports authentication failure when CSRF is absent without retrying", async () => {
    await page.evaluate(`
      window.clearCSRFToken();
      mountResolver();
    `);
    await page.getByRole("alert").waitFor();
    expect(await page.evaluate("state.resolves.length")).toBe(1);
    expect(await page.evaluate("state.authRequired")).toBe(1);
    expect(await page.evaluate("state.files.length")).toBe(0);
  });

  it.each([
    "ticket",
    "resolve",
  ])("waits for delayed %s without showing an empty-file message", async stage => {
    await page.evaluate(`deferStage = '${stage}'; void mount({});`);
    await page.getByRole("status").waitFor();
    expect(await page.getByRole("status").count()).toBe(1);
    await page.waitForFunction("pending.length === 1");
    expect(
      await page.getByText("No file uploaded.", { exact: false }).count()
    ).toBe(0);
    await page.evaluate("deferStage = null; release();");
    await page.getByText("Preview original-1", { exact: true }).waitFor();
    expect(await page.getByRole("status").count()).toBe(0);
    expect(await page.evaluate("state.files.length")).toBe(1);
  });

  it.each([
    "pdf",
    "render",
  ])("uses one shared cover through delayed PDF %s", async stage => {
    await page.evaluate(value => {
      (window as unknown as { deferStage: string }).deferStage = value;
    }, stage);
    await page.evaluate("void mount({ contentType: 'application/pdf' });");
    await page.waitForFunction("pending.length === 1");
    expect(await page.getByRole("status").count()).toBe(1);
    expect(
      await page.getByText("Loading PDF...", { exact: true }).count()
    ).toBe(0);
    await page.evaluate("deferStage=null; release();");
    await page.waitForFunction(
      "document.querySelector('canvas')?.width === 300"
    );
    await page.getByRole("status").waitFor({ state: "detached" });
  });

  it("covers text fetching without duplicating the app strict cover", async () => {
    await page.evaluate("deferFetch=true; void mount({});");
    await page.waitForFunction("state.files.length === 1");
    await page.waitForFunction("window.loadingState.lax === true");
    expect(await page.getByRole("status").count()).toBe(1);
    await page.evaluate("void startStrictLoading();");
    await page.waitForFunction("document.body.style.pointerEvents === 'none'");
    expect(await page.getByRole("status").count()).toBe(1);
    await page.evaluate("finishStrictLoading();");
    await page.waitForFunction("document.body.style.pointerEvents === 'auto'");
    expect(await page.getByRole("status").count()).toBe(1);
    await page.evaluate("deferFetch=false;");
    await page.getByText("Preview original-1", { exact: true }).waitFor();
    expect(await page.getByRole("status").count()).toBe(0);
    await page.waitForFunction("window.loadingState.lax === false");
  });

  it.each([
    "pdf",
    "render",
  ])("releases the shared cover after %s failure", async stage => {
    await page.evaluate(value => {
      (
        window as unknown as { failStage: string; deferStage: string }
      ).failStage = value;
      (window as unknown as { deferStage: string }).deferStage = value;
    }, stage);
    await page.evaluate("void mount({contentType:'application/pdf'});");
    await page.waitForFunction("pending.length === 1");
    expect(await page.getByRole("status").count()).toBe(1);
    await page.evaluate("deferStage=null; release();");
    await page.getByRole("status").waitFor({ state: "detached" });
    await page
      .getByText("Failed to load PDF preview.", { exact: true })
      .waitFor();
  });

  it("waits for image load using the shared cover", async () => {
    await page.evaluate(
      "deferFetch=true; void mount({contentType:'image/png'});"
    );
    await page.waitForFunction("state.files.length === 1");
    expect(await page.getByRole("status").count()).toBe(1);
    await page.evaluate("deferFetch=false;");
    await page.getByRole("status").waitFor({ state: "detached" });
    expect(
      await page
        .locator("img")
        .evaluate(
          (image: HTMLImageElement) =>
            image.complete && image.naturalWidth === 1
        )
    ).toBe(true);
  });

  it("does not cover a page repaint once the PDF preview is ready", async () => {
    await page.evaluate("void mount({contentType:'application/pdf'});");
    await page.waitForFunction(
      "document.querySelector('canvas')?.width === 300"
    );
    await page.getByRole("status").waitFor({ state: "detached" });
    await page.evaluate("deferStage='render';");
    await page.getByRole("button", { name: "Zoom in", exact: true }).click();
    await page.waitForFunction("pending.length === 1");
    expect(await page.getByRole("status").count()).toBe(0);
    await page.evaluate("deferStage=null; release();");
  });

  it("removes the shared cover on unmount", async () => {
    await page.evaluate(
      "deferStage='pdf'; void mount({contentType:'application/pdf'});"
    );
    await page.waitForFunction("pending.length === 1");
    expect(await page.getByRole("status").count()).toBe(1);
    await page.evaluate("unmount(); deferStage=null; release();");
    await page.getByRole("status").waitFor({ state: "detached" });
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
