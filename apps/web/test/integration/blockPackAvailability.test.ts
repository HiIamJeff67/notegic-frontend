import { readFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";
import { build } from "esbuild";

// Real route and query hook; only the transport, persistence and editor engine are controlled.
test("an open BlockPack tracks deletion, while background reads retain mounted edits", async () => {
  const mocks: Record<string, string> = {
    "@tanstack/react-router": `export const createFileRoute = () => options => options; export const useLoaderData = () => ({ blockPackId: '12345678-1234-4234-8234-123456789abc' });`,
    "@/api/invokers/blockPack.invoker": Array.from(
      readFileSync(
        "apps/web/src/api/invokers/blockPack.invoker.ts",
        "utf8"
      ).matchAll(/export const (\w+)/g),
      ([, name]) =>
        `export const ${name} = () => ${name === "queryFnGetMyBlockPackById" ? "window.read()" : "Promise.reject(new Error('Unexpected API call'))"};`
    ).join("\n"),
    "@/api/local/simulators/blockPack.simulator": `export class BlockPackLocalSimulator { static simulateGetMyBlockPackById() { return window.meta; } }`,
    "@/api/local/synchronizers/blockPack.synchronizer": `export class BlockPackLocalSynchronizer { static async syncGetMyBlockPackById() {} }`,
    "@/pages/app/block-pack-editor/BlockPackEditorPage": `import { useState } from 'react'; export default function Editor() { const [text, setText] = useState(''); return <input aria-label="Editor" value={text} onChange={e => setText(e.target.value)} />; }`,
    "@/pages/app/block-pack-editor/BlockPackEditorNotFoundPage": `export default () => <p>BlockPack not found</p>;`,
    "@/components/covers/LoadingCover/LoadingCover": `export default () => <p>Loading</p>;`,
  };
  const fixture = `
    import React from 'react';
    import { createRoot } from 'react-dom/client';
    import { QueryClientProvider } from '@tanstack/react-query';
    import { getQueryClient } from '@shared/api/queryClient';
    import { queryKeys } from '@shared/api/queryKeys';
    import { NotegicAPIError, NotegicException } from '@shared/api/exceptions';
    import { Route } from '@/routes/app.block-pack-editor.$blockPackId';
    import { invalidateDeletedResources } from '@/api/policies/availablity.policy';
    const id = '12345678-1234-4234-8234-123456789abc';
    const client = getQueryClient();
    const key = queryKeys.blockPack.oneById(id);
    window.meta = { id, parentSubShelfId: id, rootShelfId: id, permission: 'Owner', name: 'Note', icon: '', blockCount: 1, path: [{ id, name: 'Root' }, { id, name: 'Note' }], createdAt: new Date(), updatedAt: new Date(), deletedAt: null };
    window.read = async () => {
      if(window.denied) throw new NotegicAPIError(new NotegicException({ code:404, prefix:'BlockPack', status:404, reason:'NotFound', message:'Not found' }));
      if(window.paused) await new Promise(resolve => window.release = resolve);
      return { success:true, data:window.meta };
    };
    window.refresh = () => client.invalidateQueries({ queryKey:key });
    window.remove = () => invalidateDeletedResources(client, [key]);
    createRoot(document.getElementById('root')).render(<QueryClientProvider client={client}><Route.component /></QueryClientProvider>);
  `;
  const result = await build({
    stdin: { contents: fixture, resolveDir: process.cwd(), loader: "tsx" },
    bundle: true,
    write: false,
    platform: "browser",
    jsx: "automatic",
    tsconfig: path.resolve("apps/web/tsconfig.json"),
    define: {
      "process.env.NODE_ENV": '"development"',
      "process.env.NOTEGIC_VITE_MODE": '"development"',
    },
    plugins: [
      {
        name: "boundaries",
        setup(builder) {
          builder.onResolve({ filter: /.*/ }, args =>
            args.path in mocks
              ? { path: args.path, namespace: "fixture" }
              : undefined
          );
          builder.onLoad({ filter: /.*/, namespace: "fixture" }, args => ({
            contents: mocks[args.path],
            loader: "tsx",
            resolveDir: process.cwd(),
          }));
        },
      },
    ],
  });
  const browser = await chromium.launch({
    channel: process.env.PLAYWRIGHT_CHANNEL,
  });
  try {
    const page = await browser.newPage();
    await page.route("https://editor.test/**", route =>
      route.fulfill({ contentType: "text/html", body: '<div id="root"></div>' })
    );
    await page.goto("https://editor.test/");
    await page.addScriptTag({ content: result.outputFiles[0].text });
    const input = page.getByRole("textbox", { name: "Editor" });
    await input.fill("Unsaved editing state");
    await page.evaluate("window.refresh()");
    expect(await input.inputValue()).toBe("Unsaved editing state");
    await page.evaluate("window.paused=true; void window.refresh()");
    await page.waitForFunction("!!window.release");
    await page.evaluate("window.remove()");
    await page.getByText("BlockPack not found", { exact: true }).waitFor();
    await page.evaluate("window.paused=false; window.release()");
    expect(await input.count()).toBe(0);
    // Restore, then verify an authoritative read cannot resurrect the stale local copy.
    await page.evaluate("window.refresh()");
    await input.waitFor();
    await page.evaluate("window.denied=true; window.refresh()");
    await page.getByText("BlockPack not found", { exact: true }).waitFor();
  } finally {
    await browser.close();
  }
}, 30_000);
