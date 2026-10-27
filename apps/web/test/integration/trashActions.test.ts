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
import {setClientCSRFToken} from '@/api/clientHeaders';
import {Route} from '@/routes/app.trash';
import i18n from '@/i18n';
const queryClient=getQueryClient();
const client=new ApolloClient({cache:new InMemoryCache(),link:ApolloLink.empty()});
window.calls=[];window.searches=[];window.syncs=[];window.evictions=[];window.messages=[];window.extraMaterials=[];window.extraShelves=[];
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
  const stems={rootShelf:['RootShelf','RootShelves'],subShelf:['SubShelf','SubShelves'],material:['Material'],blockPack:['BlockPack'],station:['Station'],routine:['Routine']};
  const type=kinds.find(type=>stems[type].some(stem=>operation.includes(stem)));
  if(!type) throw new Error('Unknown fixture operation: '+operation);
  if(window.failOperation) throw new NotegicAPIError(new NotegicException({reason:'InvalidDto',domain:'Trash',operation,message:'Invalid request',retryable:false}));
  if(window.networkFailure || window.networkFailureType===type) throw new TypeError('Failed to fetch');
  const item=window.records[type];
  const batch=operation.endsWith('ByIds');
  const idFields={rootShelf:'rootShelfIds',subShelf:'subShelfIds',material:'materialIds',blockPack:'blockPackIds',station:'stationIds',routine:'routineIds'};
  const targetIds=batch?request.body[idFields[type]]:[item?.id];
  const targets=[item,...(type==='material'?window.extraMaterials:type==='subShelf'?window.extraShelves:[])].filter(item=>item&&targetIds.includes(item.id));
  const success=!window.rejectOperation&&window.rejectType!==type;
  let data=operation.startsWith('HardDelete')?{deletedAt:date}:batch?targets.map(item=>({...item})):{...item};
  if(success && operation.startsWith('Restore')) {
    const restored=targets.filter(item=>item.id!==window.omitRestoreId);
    for(const item of restored) item.deletedAt=null;
    data=batch?restored.map(item=>({...item})):{...item};
  }
  if(success && operation.startsWith('HardDelete')) {
    if(targetIds.includes(item?.id)) delete window.records[type];
    if(type==='material') window.extraMaterials=window.extraMaterials.filter(item=>!targetIds.includes(item.id));
    if(type==='subShelf') window.extraShelves=window.extraShelves.filter(item=>!targetIds.includes(item.id));
  }
  // This fixture replaces the RPC bridge, which publishes fresh network metadata.
  if(success) setClientCSRFToken('rotated-'+window.calls.length);
  return {success,exception:success?null:{reason:'InvalidDto',domain:'Trash',operation,message:'Invalid request',retryable:false},data,embedded:{publicId:'fixture'},refreshableTokens:{newCSRFToken:'rotated-'+window.calls.length}};
};
const fields={rootShelf:'searchRootShelves',subShelf:'searchSubShelves',material:'searchMaterials',blockPack:'searchBlockPacks',station:'searchStations',routine:'searchRoutines'};
client.query=async ({variables,query})=>{
  const field=query.definitions.find(def=>def.kind==='OperationDefinition').selectionSet.selections[0].name.value;
  window.searches.push({field,input:variables.input});
  const type=kinds.find(type=>fields[type]===field);
  const item=window.records[type];
  const nodes=[item,...(type==='material'?window.extraMaterials:type==='subShelf'?window.extraShelves:[])].filter(item=>item && item.deletedAt && item.name.includes(variables.input.query));
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
window.checkMaterialInvalidation=()=>[
 queryKeys.material.oneById('00000009-0000-4000-8000-000000000000',true,true),
 queryKeys.rootShelf.oneById(ids.rootShelf,true),
 queryKeys.userQuota.my(),
].every(key=>queryClient.getQueryState(key)?.isInvalidated);
window.checkInvalidation=()=>queryClient.getQueryState(queryKeys.station.all())?.isInvalidated;
window.mount=async ()=>{
  SessionStorageManipulator.ensureItem(SessionStorageKey.csrfToken,'initial-csrf');
  queryClient.setQueryData(queryKeys.station.all(),{fixture:true});
  for(const key of [queryKeys.material.oneById('00000009-0000-4000-8000-000000000000',true,true),queryKeys.rootShelf.oneById(ids.rootShelf,true),queryKeys.userQuota.my()]) queryClient.setQueryData(key,{fixture:true});
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
      `RestoreMy${({ rootShelf: "RootShelves", subShelf: "SubShelves", material: "Materials", blockPack: "BlockPacks", station: "Stations", routine: "Routines" } as Record<string, string>)[type]}ByIds`
    );
    expect(calls.at(-1)?.request.header.csrfToken).toBe(
      calls.length === 1 ? "initial-csrf" : "rotated-1"
    );
    if (type === "material" || type === "blockPack") {
      expect(calls).toHaveLength(2);
      expect(calls[0].request.param.isDeleted).toBe(true);
      expect(calls[1].request.affected).toEqual({
        rootShelfIds: ["00000001-0000-4000-8000-000000000000"],
        parentSubShelfIds: ["00000002-0000-4000-8000-000000000000"],
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
    "rootShelf",
    "subShelf",
    "material",
    "blockPack",
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
    const stem = (
      {
        rootShelf: "RootShelves",
        subShelf: "SubShelves",
        material: "Materials",
        blockPack: "BlockPacks",
        station: "Stations",
        routine: "Routines",
      } as Record<string, string>
    )[type];
    expect(await page.evaluate("window.calls[0].operation")).toBe(
      `HardDeleteMy${stem}ByIds`
    );
    expect(await page.evaluate("window.syncs[0].method")).toBe(
      `syncHardDeleteMy${stem}ByIds`
    );
  });

  it.each([
    "All",
    "Materials",
    "Block packs",
  ])("keeps shared selection controls visible in %s when Trash is empty", async filter => {
    await page.evaluate("window.records={};window.load('')");
    await page.getByRole("radio", { name: filter, exact: true }).click();
    await browserExpect(
      page.getByRole("button", { name: "Delete selected", exact: true })
    ).toBeDisabled();
    await browserExpect(
      page.getByRole("button", { name: "Restore selected", exact: true })
    ).toBeDisabled();
    const selectAll = page.getByRole("checkbox", {
      name: "Select visible items",
      exact: true,
    });
    await browserExpect(selectAll).toBeDisabled();
    await browserExpect(selectAll).not.toBeChecked();
    expect(await page.evaluate("window.calls.length")).toBe(0);
  });

  it("restores a mixed selection with one batch per type and fresh CSRF headers", async () => {
    await page
      .getByRole("checkbox", { name: "Select visible items", exact: true })
      .check();
    await page
      .getByRole("button", { name: "Restore selected", exact: true })
      .click();
    await browserExpect(
      page.getByRole("button", { name: "Restore", exact: true })
    ).toHaveCount(0);
    const calls =
      await page.evaluate<
        Array<{ operation: string; request: { header: { csrfToken: string } } }>
      >("window.calls");
    expect(calls.map(call => call.operation)).toEqual([
      "RestoreMyMaterialsByIds",
      "RestoreMyBlockPacksByIds",
      "RestoreMySubShelvesByIds",
      "RestoreMyRootShelvesByIds",
      "RestoreMyRoutinesByIds",
      "RestoreMyStationsByIds",
    ]);
    expect(calls.map(call => call.request.header.csrfToken)).toEqual([
      "initial-csrf",
      "rotated-1",
      "rotated-2",
      "rotated-3",
      "rotated-4",
      "rotated-5",
    ]);
    await page.waitForFunction("window.searches.length===12");
    expect(await page.evaluate("window.syncs.length")).toBe(5);
  });

  it("deletes a mixed selection in child-before-parent batches after one confirmation", async () => {
    await page
      .getByRole("checkbox", { name: "Select visible items", exact: true })
      .check();
    await page
      .getByRole("button", { name: "Delete selected", exact: true })
      .click();
    const dialog = page.getByRole("dialog");
    await browserExpect(dialog).toContainText("6 items");
    await dialog.getByRole("textbox").fill("DELETE");
    await dialog
      .getByRole("button", { name: "Delete permanently", exact: true })
      .click();
    await browserExpect(dialog).toHaveCount(0);
    await browserExpect(
      page.getByRole("button", { name: "Restore", exact: true })
    ).toHaveCount(0);
    expect(
      await page.evaluate("window.calls.map(call=>call.operation)")
    ).toEqual([
      "HardDeleteMyMaterialsByIds",
      "HardDeleteMyBlockPacksByIds",
      "HardDeleteMySubShelvesByIds",
      "HardDeleteMyRootShelvesByIds",
      "HardDeleteMyRoutinesByIds",
      "HardDeleteMyStationsByIds",
    ]);
    expect(await page.evaluate("window.syncs.length")).toBe(6);
    await page.waitForFunction("window.searches.length===12");
  });

  it("deletes nested selected shelves from deepest to shallowest before their root", async () => {
    await page.evaluate(
      "window.extraShelves=[{...window.records.subShelf,id:'00000009-0000-4000-8000-000000000000',name:'nested shelf fixture',prevSubShelfId:window.records.subShelf.id,path:[window.records.subShelf.id]}];window.load('')"
    );
    await browserExpect(
      page.getByRole("button", { name: "Restore", exact: true })
    ).toHaveCount(7);
    await page
      .getByRole("checkbox", { name: "Select visible items", exact: true })
      .check();
    await page
      .getByRole("button", { name: "Delete selected", exact: true })
      .click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("textbox").fill("DELETE");
    await dialog
      .getByRole("button", { name: "Delete permanently", exact: true })
      .click();
    await browserExpect(dialog).toHaveCount(0);
    expect(
      await page.evaluate(
        "window.calls.filter(call=>call.operation==='HardDeleteMySubShelvesByIds').map(call=>call.request.body.subShelfIds)"
      )
    ).toEqual([
      ["00000009-0000-4000-8000-000000000000"],
      ["00000002-0000-4000-8000-000000000000"],
    ]);
    expect(await page.evaluate("window.calls[4].operation")).toBe(
      "HardDeleteMyRootShelvesByIds"
    );
  });

  it("retains a failed mixed deletion and retries only unfinished groups", async () => {
    await page.evaluate("window.rejectType='blockPack'");
    await page
      .getByRole("checkbox", { name: "Select visible items", exact: true })
      .check();
    await page
      .getByRole("button", { name: "Delete selected", exact: true })
      .click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("textbox").fill("DELETE");
    await dialog
      .getByRole("button", { name: "Delete permanently", exact: true })
      .click();
    await page.waitForFunction(
      "window.messages.some(message=>message.kind==='error')"
    );
    await browserExpect(
      page.getByText("material fixture", { exact: true })
    ).toHaveCount(0);
    await browserExpect(dialog).toContainText("5 items");
    expect(await page.evaluate("window.calls.length")).toBe(2);
    await page.evaluate("window.rejectType=null");
    await dialog
      .getByRole("button", { name: "Delete permanently", exact: true })
      .click();
    await browserExpect(dialog).toHaveCount(0);
    expect(
      await page.evaluate(
        "window.calls.filter(call=>call.operation==='HardDeleteMyMaterialsByIds').length"
      )
    ).toBe(1);
    expect(await page.evaluate("window.calls.length")).toBe(7);
    await browserExpect(
      page.getByRole("button", { name: "Restore", exact: true })
    ).toHaveCount(0);
  });

  it("keeps IDs omitted by a restore response selected and retries only those IDs", async () => {
    await page.evaluate(
      "window.extraMaterials=[{...window.records.material,id:'00000007-0000-4000-8000-000000000000',name:'second material fixture'}];window.omitRestoreId=window.extraMaterials[0].id;window.load('')"
    );
    await page.getByRole("radio", { name: "Materials", exact: true }).click();
    await page
      .getByRole("checkbox", { name: "Select visible items", exact: true })
      .check();
    await page
      .getByRole("button", { name: "Restore selected", exact: true })
      .click();
    await page.waitForFunction(
      "window.messages.some(message=>message.kind==='error')"
    );
    await browserExpect(
      page.getByText("material fixture", { exact: true })
    ).toHaveCount(0);
    await browserExpect(
      page.getByRole("checkbox", {
        name: "Select “second material fixture”",
        exact: true,
      })
    ).toBeChecked();
    await page.evaluate("window.omitRestoreId=null");
    await page
      .getByRole("button", { name: "Restore selected", exact: true })
      .click();
    await browserExpect(
      page.getByText("second material fixture", { exact: true })
    ).toHaveCount(0);
    const calls = await page.evaluate<
      Array<{ request: { body: { materialIds: string[] } } }>
    >("window.calls.filter(call=>call.operation==='RestoreMyMaterialsByIds')");
    expect(calls.map(call => call.request.body.materialIds)).toEqual([
      [
        "00000003-0000-4000-8000-000000000000",
        "00000007-0000-4000-8000-000000000000",
      ],
      ["00000007-0000-4000-8000-000000000000"],
    ]);
  });

  it("acts only on selected items in the current type filter", async () => {
    await page
      .getByRole("checkbox", { name: "Select “material fixture”", exact: true })
      .check();
    await page
      .getByRole("checkbox", {
        name: "Select “blockPack fixture”",
        exact: true,
      })
      .check();
    await page.getByRole("radio", { name: "Block packs", exact: true }).click();
    await page
      .getByRole("button", { name: "Delete selected", exact: true })
      .click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("textbox").fill("DELETE");
    await dialog
      .getByRole("button", { name: "Delete permanently", exact: true })
      .click();
    await browserExpect(dialog).toHaveCount(0);
    expect(
      await page.evaluate("window.calls.map(call=>call.operation)")
    ).toEqual(["HardDeleteMyBlockPacksByIds"]);
    await page.getByRole("radio", { name: "All", exact: true }).click();
    await browserExpect(
      page.getByText("material fixture", { exact: true })
    ).toBeVisible();
  });

  it.each([
    320, 375, 768, 1200,
  ])("keeps icon-only actions beside item details at %spx without unavailable placeholders", async width => {
    await page.setViewportSize({ width, height: 812 });
    await browserExpect(
      page.getByRole("button", { name: "Delete permanently", exact: true })
    ).toHaveCount(6);
    await browserExpect(
      page.getByText("Permanent deletion is not yet supported for this type.", {
        exact: true,
      })
    ).toHaveCount(0);
    for (const type of [
      "rootShelf",
      "subShelf",
      "material",
      "blockPack",
      "station",
      "routine",
    ]) {
      const row = page
        .locator("section > div")
        .filter({ has: page.getByText(type + " fixture", { exact: true }) });
      const buttons = row.getByRole("button");
      await browserExpect(buttons).toHaveCount(2);
      for (const button of await buttons.all()) {
        await browserExpect(button).toHaveText("");
        await browserExpect(button).toHaveAttribute("title", /\S/);
        const bounds = await button.boundingBox();
        expect(bounds?.width).toBe(bounds?.height);
      }
      const name = row.getByText(type + " fixture", { exact: true });
      const nameBounds = await name.boundingBox();
      const actionBounds = await buttons.first().boundingBox();
      expect(nameBounds).not.toBeNull();
      expect(actionBounds).not.toBeNull();
      expect(nameBounds!.x + nameBounds!.width).toBeLessThanOrEqual(
        actionBounds!.x
      );
      expect(actionBounds!.y).toBeLessThan(
        nameBounds!.y + (await row.boundingBox())!.height
      );
    }
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
    await page.clock.pauseAt(new Date());
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

  it("deletes two selected materials in one request, disables duplicate actions and refreshes Trash", async () => {
    await page.evaluate(
      "window.extraMaterials=[{...window.records.material,id:'00000007-0000-4000-8000-000000000000',name:'second material fixture'}];window.load('')"
    );
    await page.getByRole("radio", { name: "Materials", exact: true }).click();
    await page
      .getByRole("checkbox", { name: "Select visible items", exact: true })
      .check();
    await page
      .getByRole("button", {
        name: "Delete selected",
        exact: true,
      })
      .click();
    const dialog = page.getByRole("dialog");
    await browserExpect(dialog).toContainText("2 items");
    await dialog.getByRole("textbox").fill("DELETE");
    await page.evaluate("window.holdAPI=true");
    await dialog
      .getByRole("button", { name: "Delete permanently", exact: true })
      .click();
    await page.waitForFunction("typeof window.releaseAPI==='function'");
    await browserExpect(dialog.getByRole("button").last()).toBeDisabled();
    await browserExpect(
      page.locator('[role="checkbox"]').first()
    ).toBeDisabled();
    await page.evaluate("window.holdAPI=false;window.releaseAPI()");
    await browserExpect(dialog).toHaveCount(0);
    await browserExpect(
      page.getByText("material fixture", { exact: true })
    ).toHaveCount(0);
    await browserExpect(
      page.getByText("second material fixture", { exact: true })
    ).toHaveCount(0);
    const calls =
      await page.evaluate<
        Array<{
          operation: string;
          request: {
            body: { materialIds: string[] };
            header: { csrfToken: string };
          };
        }>
      >("window.calls");
    expect(calls).toHaveLength(1);
    expect(calls[0].operation).toBe("HardDeleteMyMaterialsByIds");
    expect(calls[0].request.body.materialIds).toEqual([
      "00000003-0000-4000-8000-000000000000",
      "00000007-0000-4000-8000-000000000000",
    ]);
    expect(calls[0].request.header.csrfToken).toBe("initial-csrf");
    await page.waitForFunction("window.searches.length===18");
    expect(await page.evaluate("window.syncs.length")).toBe(1);
    expect(await page.evaluate("window.checkMaterialInvalidation()")).toBe(
      true
    );
    await page.getByRole("radio", { name: "All", exact: true }).click();
    await page
      .locator("section > div")
      .filter({ has: page.getByText("station fixture", { exact: true }) })
      .getByRole("button", { name: "Restore", exact: true })
      .click();
    await browserExpect(
      page.getByText("station fixture", { exact: true })
    ).toHaveCount(0);
    expect(
      await page.evaluate("window.calls[1].request.header.csrfToken")
    ).toBe("rotated-1");
  });

  it("retains both selected materials after a rejected batch without retrying", async () => {
    await page.evaluate(
      "window.extraMaterials=[{...window.records.material,id:'00000007-0000-4000-8000-000000000000',name:'second material fixture'}];window.load('')"
    );
    await page.getByRole("radio", { name: "Materials", exact: true }).click();
    await page
      .getByRole("checkbox", { name: "Select visible items", exact: true })
      .check();
    await page
      .getByRole("button", {
        name: "Delete selected",
        exact: true,
      })
      .click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("textbox").fill("DELETE");
    await page.evaluate("window.rejectOperation=true");
    await dialog
      .getByRole("button", { name: "Delete permanently", exact: true })
      .click();
    await page.waitForFunction(
      "window.messages.some(message=>message.kind==='error')"
    );
    await browserExpect(dialog).toBeVisible();
    await browserExpect(
      page.getByText("material fixture", { exact: true })
    ).toBeVisible();
    await browserExpect(
      page.getByText("second material fixture", { exact: true })
    ).toBeVisible();
    await page.clock.install();
    await page.clock.runFor(11000);
    expect(await page.evaluate("window.calls.length")).toBe(1);
    expect(
      await page.evaluate(
        "window.messages.some(message=>message.kind==='success')"
      )
    ).toBe(false);
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
