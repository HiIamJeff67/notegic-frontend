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

// Real Trash route/page, mutation hooks, invoker validation and confirmation UI.
// Only RPC, GraphQL and local persistence boundaries use disposable fixtures.
const fixture = `
import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {ApolloClient, InMemoryCache, ApolloLink} from '@apollo/client';
import {ApolloProvider} from '@apollo/client/react';
import {QueryClientProvider} from '@tanstack/react-query';
import {getQueryClient} from '@shared/api/queryClient';
import {queryKeys} from '@shared/api/queryKeys';
import {NotegicAPIError,NotegicException} from '@shared/api/exceptions';
import {AccessControlPermission} from '@shared/api/interfaces/enums';
import {SessionStorageManipulator} from '@shared/lib/sessionStorageManipulator';
import {SessionStorageKey} from '@shared/types/sessionStorage.type';
import {Route} from '@/routes/app.trash';
import i18n from '@/i18n';
const queryClient=getQueryClient();
const client=new ApolloClient({cache:new InMemoryCache(),link:ApolloLink.empty()});
window.calls=[];window.searches=[];window.syncs=[];window.evictions=[];window.messages=[];
const date=new Date('2026-01-01T00:00:00Z');
const kinds=['rootShelf','subShelf','material','blockPack','station','routine'];
const ids=Object.fromEntries(kinds.map((kind,index)=>[kind,'0000000'+(index+1)+'-0000-4000-8000-000000000000']));
window.records=Object.fromEntries(kinds.map(type=>[type,{
  id:ids[type], name:type+' fixture', title:type+' fixture', deletedAt:date, createdAt:date, updatedAt:date,
  rootShelfId:ids.rootShelf,parentSubShelfId:ids.subShelf,prevSubShelfId:null,path:[],
  subShelfCount:1,itemCount:2,lastAnalyzedAt:date,blockCount:1,icon:null,headerBackgroundURL:null,
  size:5,contentType:'text/plain',parseMediaType:'text',objectKey:'fixture',stationId:ids.station,
  description:'Fixture',permission:AccessControlPermission.Owner,routineCount:1,timeoutSeconds:60,
  phase:null,isActive:false,isPinned:false,definitionVersion:1,scheduledStartAt:date,scheduledEndAt:date,
  period:null,timezone:'UTC',admissionState:'Unknown',
  rootShelfName:'Root',parentSubShelfName:'Folder',parentSubShelfPrevSubShelfId:null,
  parentSubShelfPath:[],parentSubShelfDeletedAt:null,parentSubShelfUpdatedAt:date,parentSubShelfCreatedAt:date,
  lastUpdateSequence:0,compactedUntilSequence:0,projectedUntilSequence:0,isProjectionCurrent:true,
}]));
window.records.blockPack.path=[{id:ids.rootShelf,name:'Root'},{id:ids.subShelf,name:'Folder'}];
window.api=async (operation,request)=>{
  window.calls.push({operation,request});
  if(window.holdAPI) await new Promise(resolve=>window.releaseAPI=resolve);
  if(window.failOperation) throw new NotegicAPIError(new NotegicException({reason:'InvalidDto',domain:'Trash',operation,message:'Invalid request',retryable:false}));
  if(window.networkFailure) throw new TypeError('Failed to fetch');
  const type=kinds.find(type=>operation.includes(type[0].toUpperCase()+type.slice(1)));
  const item=window.records[type];
  const data=operation.startsWith('HardDelete')?{deletedAt:date}:{...item};
  const success=!window.rejectOperation;
  if(success && operation.startsWith('Restore')) {item.deletedAt=null;data.deletedAt=null;}
  if(success && operation.startsWith('HardDelete')) delete window.records[type];
  return {success,exception:success?null:{reason:'InvalidDto',domain:'Trash',operation,message:'Invalid request',retryable:false},data,embedded:{publicId:'fixture'},refreshableTokens:{newCSRFToken:'rotated-'+window.calls.length}};
};
const fields={rootShelf:'searchRootShelves',subShelf:'searchSubShelves',material:'searchMaterials',blockPack:'searchBlockPacks',station:'searchStations',routine:'searchRoutines'};
client.query=async ({variables,query})=>{
  const field=query.definitions.find(def=>def.kind==='OperationDefinition').selectionSet.selections[0].name.value;
  window.searches.push({field,input:variables.input});
  const type=kinds.find(type=>fields[type]===field);
  const item=window.records[type];
  const nodes=item && item.deletedAt && item.name.includes(variables.input.query)?[item]:[];
  return {data:{[field]:{totalCount:nodes.length,searchTime:0,searchEdges:nodes.map(node=>({node})),searchPageInfo:{hasNextPage:false,hasPreviousPage:false}}}};
};
const evict=client.cache.evict.bind(client.cache);
client.cache.evict=options=>{window.evictions.push(options.fieldName);return evict(options);};
window.query='';window.data=null;
window.navigate=async ({search})=>{const next=search({query:window.query});if(window.holdSearch) await new Promise(resolve=>window.releaseSearch=resolve);await window.load(next.query);};
window.router={invalidate:async ()=>{if(window.failRefresh) throw new Error('Refresh failed');await window.load(window.query);}};
window.load=async query=>{
  const data=await Route.loader({context:{apolloClient:client},deps:{query}});
  window.query=query;window.data=data;window.render?.();
};
window.changeLanguage=language=>i18n.changeLanguage(language);
window.setQuery=query=>{window.query=query;window.render();};
window.checkInvalidation=()=>queryClient.getQueryState(queryKeys.station.all())?.isInvalidated;
window.mount=async ()=>{
  SessionStorageManipulator.ensureItem(SessionStorageKey.csrfToken,'initial-csrf');
  queryClient.setQueryData(queryKeys.station.all(),{fixture:true});
  await window.load('');
  function Harness(){const [,setRevision]=useState(0);window.render=()=>setRevision(value=>value+1);const Component=Route.component;return <Component/>;}
  const root=createRoot(document.getElementById('root'));
  window.unmount=()=>root.unmount();
  root.render(<ApolloProvider client={client}><QueryClientProvider client={queryClient}><Harness/></QueryClientProvider></ApolloProvider>);
};
`;

describe("Trash actions in Chromium", () => {
  let browser: Browser;
  let page: Page;
  let script: string;
  let css: string;
  let errors: string[];

  beforeAll(async () => {
    const mocks: Record<string, string> = {
      "@tanstack/react-router": `export const createFileRoute=id=>options=>({...options,id,useSearch:()=>({query:window.query}),useLoaderData:()=>window.data,useNavigate:()=>window.navigate});export const useRouter=()=>window.router;`,
      "@/components/ui/sidebar": `export const SidebarTrigger=()=>null;export const useSidebar=()=>({isMobile:false});`,
      "@/api/functions/material.clientFn": `export const SaveMyMaterialById=()=>{throw new Error('Unexpected save');};`,
      "@shared/lib/toast": `export default {success:message=>window.messages.push({kind:'success',message}),error:message=>window.messages.push({kind:'error',message})};`,
    };
    for (const domain of [
      "rootShelf",
      "subShelf",
      "material",
      "blockPack",
      "station",
      "routine",
    ]) {
      const source = await readFile(
        `apps/web/src/api/functions/${domain}.serverFn.ts`,
        "utf8"
      );
      mocks[`@/api/functions/${domain}.serverFn`] = [
        ...source.matchAll(/export const (\w+)\s*=/g),
      ]
        .map(
          ([, name]) =>
            `export const ${name}=({data})=>window.api('${name}',data);`
        )
        .join("\n");
      if (domain === "material") continue;
      const name = domain[0].toUpperCase() + domain.slice(1);
      mocks[`@/api/local/synchronizers/${domain}.synchronizer`] =
        `export const ${name}LocalSynchronizer=new Proxy({},{get:(_,method)=>async request=>window.syncs.push({method,request})});`;
      mocks[`@/api/local/simulators/${domain}.simulator`] =
        `export const ${name}LocalSimulator=new Proxy({},{get:(_,method)=>async ()=>{throw new Error('Unexpected offline simulation: '+method);}});`;
    }
    const result = await build({
      stdin: { contents: fixture, resolveDir: process.cwd(), loader: "tsx" },
      bundle: true,
      write: false,
      metafile: true,
      platform: "browser",
      jsx: "automatic",
      loader: { ".css": "empty" },
      define: { "process.env.NODE_ENV": '"development"' },
      tsconfig: path.resolve("apps/web/tsconfig.json"),
      plugins: [
        {
          name: "trash-data-boundaries",
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
    script = result.outputFiles[0].text;
    const sources = await Promise.all(
      Object.keys(result.metafile!.inputs)
        .filter(
          file =>
            !file.startsWith("mock:") &&
            !file.startsWith("<") &&
            file.endsWith(".tsx")
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
    errors = [];
    page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
    page.on("pageerror", error => errors.push(error.message));
    await page.route("http://trash.test/**", route =>
      route.fulfill({
        contentType: "text/html",
        body: '<html class="dark"><body style="height:100vh"><div id="root" style="height:100%"></div></body></html>',
      })
    );
    await page.goto("http://trash.test/");
    await page.addStyleTag({ content: css });
    await page.addScriptTag({ content: script });
    await page.evaluate("mount()");
    await browserExpect(
      page.getByRole("button", { name: "Restore", exact: true })
    ).toHaveCount(6);
  });
  afterEach(async () => {
    await page?.close();
    expect(errors).toEqual([]);
  });
  afterAll(async () => {
    await browser?.close();
  });

  it.each([
    "rootShelf",
    "subShelf",
    "material",
    "blockPack",
    "station",
    "routine",
  ])("restores a %s through its existing mutation and refreshes Trash", async type => {
    const row = page
      .locator("section > div")
      .filter({ has: page.getByText(type + " fixture", { exact: true }) });
    await row.getByRole("button", { name: "Restore", exact: true }).click();
    await browserExpect(
      page.getByText(type + " fixture", { exact: true })
    ).toHaveCount(0);
    const calls =
      await page.evaluate<
        Array<{
          operation: string;
          request: {
            header: { csrfToken: string };
            param: { isDeleted: boolean };
            affected: Record<string, string>;
          };
        }>
      >("window.calls");
    expect(calls.at(-1)?.operation).toBe(
      `RestoreMy${type[0].toUpperCase() + type.slice(1)}ById`
    );
    expect(calls.at(-1)?.request.header.csrfToken).toBe(
      calls.length === 1 ? "initial-csrf" : "rotated-1"
    );
    if (type === "material" || type === "blockPack") {
      expect(calls).toHaveLength(2);
      expect(calls[0].request.param.isDeleted).toBe(true);
      expect(calls[1].request.affected).toEqual({
        rootShelfId: "00000001-0000-4000-8000-000000000000",
        parentSubShelfId: "00000002-0000-4000-8000-000000000000",
      });
    }
    await page.waitForFunction("window.searches.length===12");
    expect(
      await page.evaluate(
        "window.searches.every(search=>search.input.isDeletedAt===true)"
      )
    ).toBe(true);
    expect(
      await page.evaluate(
        "window.evictions.includes('searchRootShelves')&&window.evictions.includes('searchRoutines')"
      )
    ).toBe(true);
    if (type !== "material")
      expect(
        await page.evaluate(
          "window.syncs.some(sync=>sync.method.startsWith('syncRestore'))"
        )
      ).toBe(true);
  });

  it.each([
    "station",
    "routine",
  ])("requires confirmation for %s hard deletion and prevents duplicate submissions", async type => {
    await page
      .locator("section > div")
      .filter({ has: page.getByText(type + " fixture", { exact: true }) })
      .getByRole("button", { name: "Delete permanently", exact: true })
      .click();
    let dialog = page.getByRole("dialog");
    await browserExpect(
      dialog.getByRole("button", { name: "Delete permanently", exact: true })
    ).toBeDisabled();
    await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
    expect(await page.evaluate("window.calls.length")).toBe(0);
    await page
      .locator("section > div")
      .filter({ has: page.getByText(type + " fixture", { exact: true }) })
      .getByRole("button", { name: "Delete permanently", exact: true })
      .click();
    dialog = page.getByRole("dialog");
    await dialog.getByRole("textbox").fill("DELETE");
    await page.evaluate("window.holdAPI=true");
    await dialog
      .getByRole("button", { name: "Delete permanently", exact: true })
      .evaluate(button => {
        (button as HTMLButtonElement).click();
        (button as HTMLButtonElement).click();
      });
    await page.waitForFunction("window.calls.length===1");
    await page.keyboard.press("Escape");
    await browserExpect(dialog).toBeVisible();
    await browserExpect(
      dialog.getByRole("button", { name: "Cancel", exact: true })
    ).toBeDisabled();
    await page.evaluate("window.holdAPI=false;window.releaseAPI()");
    await browserExpect(dialog).toHaveCount(0);
    await browserExpect(
      page.getByText(type + " fixture", { exact: true })
    ).toHaveCount(0);
    expect(await page.evaluate("window.calls.length")).toBe(1);
    expect(await page.evaluate("window.calls[0].operation")).toBe(
      `HardDeleteMy${type[0].toUpperCase() + type.slice(1)}ById`
    );
    expect(await page.evaluate("window.syncs[0].method")).toBe(
      `syncHardDeleteMy${type[0].toUpperCase() + type.slice(1)}ById`
    );
    expect(await page.evaluate("window.checkInvalidation()")).toBe(true);
  });

  it("shows no unavailable hard-delete action and remains within a narrow viewport", async () => {
    await page.setViewportSize({ width: 375, height: 812 });
    await browserExpect(
      page.getByRole("button", { name: "Delete permanently", exact: true })
    ).toHaveCount(2);
    await browserExpect(
      page.getByText("Permanent deletion is not yet supported for this type.", {
        exact: true,
      })
    ).toHaveCount(4);
    expect(
      await page.evaluate("document.documentElement.scrollWidth<=innerWidth")
    ).toBe(true);
  });

  it("debounces typing, clearing and URL changes without losing newer input", async () => {
    const input = page.getByRole("textbox", {
      name: "Search trash",
      exact: true,
    });
    await page.clock.install();
    await input.fill("s");
    await page.clock.runFor(200);
    await input.fill("sub");
    await page.clock.runFor(499);
    expect(await page.evaluate("window.searches.length")).toBe(6);
    await page.clock.runFor(1);
    await page.waitForFunction("window.query==='sub'");
    expect(await page.evaluate("window.searches.length")).toBe(12);
    await input.fill("");
    await page.clock.runFor(500);
    await page.waitForFunction("window.query===''");
    await page.evaluate("window.setQuery('external')");
    await browserExpect(input).toHaveValue("external");
    await page.clock.runFor(600);
    expect(await page.evaluate("window.searches.length")).toBe(18);
    await input.fill("pending");
    await page.evaluate("window.unmount()");
    await page.clock.runFor(600);
    expect(await page.evaluate("window.searches.length")).toBe(18);
  });

  it.each([
    "failOperation",
    "networkFailure",
    "rejectOperation",
  ])("retains the item and confirmation after %s without automatic retries", async failure => {
    await page.evaluate(key => {
      (window as unknown as Record<string, boolean>)[key] = true;
    }, failure);
    await page
      .locator("section > div")
      .filter({ has: page.getByText("station fixture", { exact: true }) })
      .getByRole("button", { name: "Delete permanently", exact: true })
      .click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("textbox").fill("DELETE");
    await dialog
      .getByRole("button", { name: "Delete permanently", exact: true })
      .click();
    await page.waitForFunction(
      "window.messages.some(message=>message.kind==='error')"
    );
    await page.clock.install();
    await page.clock.runFor(11000);
    await browserExpect(dialog).toBeVisible();
    expect(await page.evaluate("window.calls.length")).toBe(1);
    expect(await page.evaluate("window.syncs.length")).toBe(0);
    expect(
      await page.evaluate(
        "window.messages.some(message=>message.kind==='success')"
      )
    ).toBe(false);
  });

  it("rejects offline actions before calling any mutation or local simulation", async () => {
    await page.evaluate(
      "Object.defineProperty(navigator,'onLine',{configurable:true,value:false})"
    );
    await page
      .getByRole("button", { name: "Restore", exact: true })
      .first()
      .click();
    await page.waitForFunction(
      "window.messages.some(message=>message.kind==='error')"
    );
    expect(await page.evaluate("window.calls.length")).toBe(0);
    expect(await page.evaluate("window.syncs.length")).toBe(0);
    await browserExpect(
      page.getByRole("button", { name: "Restore", exact: true })
    ).toHaveCount(6);
  });

  it("preserves newer typing while an earlier search finishes", async () => {
    const input = page.getByRole("textbox", {
      name: "Search trash",
      exact: true,
    });
    await page.clock.install();
    await page.evaluate("window.holdSearch=true");
    await input.fill("sub");
    await page.clock.runFor(500);
    await page.waitForFunction("typeof window.releaseSearch==='function'");
    await input.fill("subShelf");
    await page.evaluate("window.holdSearch=false;window.releaseSearch()");
    await page.waitForFunction("window.query==='sub'");
    await browserExpect(input).toHaveValue("subShelf");
    await page.clock.runFor(500);
    await page.waitForFunction("window.query==='subShelf'");
    expect(await page.evaluate("window.searches.length")).toBe(18);
  });

  it("keeps a failed restore visible and translates an async success in the current language", async () => {
    const row = page
      .locator("section > div")
      .filter({ has: page.getByText("station fixture", { exact: true }) });
    await page.evaluate("window.rejectOperation=true");
    await row.getByRole("button", { name: "Restore", exact: true }).click();
    await page.waitForFunction(
      "window.messages.some(message=>message.kind==='error')"
    );
    await browserExpect(
      row.getByRole("button", { name: "Restore", exact: true })
    ).toBeEnabled();
    expect(await page.evaluate("window.syncs.length")).toBe(0);
    await page.evaluate("window.rejectOperation=false;window.holdAPI=true");
    await row.getByRole("button", { name: "Restore", exact: true }).click();
    await page.waitForFunction("typeof window.releaseAPI==='function'");
    await page.evaluate("window.changeLanguage('zh-TW')");
    await page.evaluate("window.holdAPI=false;window.releaseAPI()");
    await browserExpect(
      page.getByText("station fixture", { exact: true })
    ).toHaveCount(0);
    expect(
      await page.evaluate(
        "window.messages.some(message=>message.message==='已還原項目。')"
      )
    ).toBe(true);
  });

  it("can show a restored item again if it is subsequently deleted", async () => {
    await page
      .locator("section > div")
      .filter({ has: page.getByText("station fixture", { exact: true }) })
      .getByRole("button", { name: "Restore", exact: true })
      .click();
    await browserExpect(
      page.getByText("station fixture", { exact: true })
    ).toHaveCount(0);
    await page.evaluate(
      "window.records.station.deletedAt=new Date('2026-02-01');window.load('')"
    );
    await browserExpect(
      page.getByText("station fixture", { exact: true })
    ).toBeVisible();
  });

  it("does not offer to repeat a completed deletion when refreshing fails", async () => {
    await page.evaluate("window.failRefresh=true");
    await page
      .locator("section > div")
      .filter({ has: page.getByText("station fixture", { exact: true }) })
      .getByRole("button", { name: "Delete permanently", exact: true })
      .click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("textbox").fill("DELETE");
    await dialog
      .getByRole("button", { name: "Delete permanently", exact: true })
      .click();
    await browserExpect(dialog).toHaveCount(0);
    await browserExpect(
      page.getByText("station fixture", { exact: true })
    ).toHaveCount(0);
    expect(await page.evaluate("window.calls.length")).toBe(1);
    expect(
      await page.evaluate(
        "window.messages.some(message=>message.message.includes('action succeeded'))"
      )
    ).toBe(true);
  });
});
