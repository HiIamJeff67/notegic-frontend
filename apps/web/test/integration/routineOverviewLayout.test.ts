import { readFile } from "node:fs/promises";
import path from "node:path";
import { type Browser, chromium, type Page } from "@playwright/test";
import { compile } from "@tailwindcss/node";
import { build } from "esbuild";

// Real sidebar, table controls, i18n and CSS; isolated API/storage edges.
const fixture = `
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { ResizeSidebarProvider } from '@/providers/ResizeSidebarProvider';
import ResizableSidebar from '@/components/sidebar/ResizableSidebar/ResizableSidebar';
import AppSidebarInset from '@/components/sidebar/AppSidebar/AppSidebarInset';
import RoutineScopeBar from '@/components/core/RoutineOverviewer/RoutineScopeBar/RoutineScopeBar';
import RoutineTaskTable from '@/components/core/RoutineOverviewer/RoutineTaskTable/RoutineTaskTable';
import RoutineRecordTable from '@/components/core/RoutineOverviewer/RoutineRecordTable/RoutineRecordTable';
import RoutineTaskRecordTable from '@/components/core/RoutineOverviewer/RoutineTaskRecordTable/RoutineTaskRecordTable';
import AppLoadingCover from '@/components/covers/LoadingCover/AppLoadingCover';
import { useResizeSidebar } from '@/hooks';
import i18n from '@/i18n';
window.changeLanguage = language => i18n.changeLanguage(language);
document.documentElement.classList.add('dark');
document.documentElement.dataset.density = window.fixtureDensity ?? 'comfortable';
function Content() {
  const sidebar = useSidebar();
  const resize = useResizeSidebar();
  const [loading, setLoading] = useState(false);
  window.sidebar = sidebar;
  window.setLoading = setLoading;
  return <>
    <header id="scope" className="fixed top-0 right-0 z-20 h-12"
      style={{left: sidebar.isMobile ? 0 : sidebar.open ? resize.width : 'var(--sidebar-width-icon)'}}>
      <RoutineScopeBar />
    </header>
    <div id="tables" className="flex h-full flex-col gap-2 overflow-y-auto pt-12">
      <RoutineTaskTable /><RoutineRecordTable /><RoutineTaskRecordTable />
    </div>
    <AppLoadingCover isLoading={loading} />
  </>;
}
createRoot(document.getElementById('root')).render(
  <SidebarProvider><ResizeSidebarProvider>
    <ResizableSidebar variant="sidebar" collapsible="icon"><span>Sidebar contents</span></ResizableSidebar>
    <AppSidebarInset><Content /></AppSidebarInset>
  </ResizeSidebarProvider></SidebarProvider>
);
`;

const mocks: Record<string, string> = {
  "@/hooks": `
    import { useContext } from 'react';
    import { ResizeSidebarContext } from '@/providers/ResizeSidebarProvider';
    const routine = {id:'routine', stationId:'station', title:'Daily review', routineTagIds:[]};
    const manager = {
      viewMode:'all', activeStationId:null, routines:[routine], visibleRoutines:[routine],
      stations:[{id:'station', name:'Learning Rust Programming Language'}], visibleStations:[],
      routineTags:[], visibleRoutineTags:[], visibleRoutineTasks:[], timeRailScale:'week',
      presence:{stationIds:['station'], routineTagIds:[], showUntaggedRoutines:true, query:''},
      statusSummary:{totalStations:1, totalRoutines:1, totalRoutineTags:0, totalRoutineTasks:30},
      getRoutineById:()=>routine,
      getRoutineTaskById:()=>({title:'Create a daily review note'}),
      getStationById:()=>({name:'Learning Rust Programming Language'}),
      openInspector:()=>{},
    };
    export const useResizeSidebar = () => useContext(ResizeSidebarContext);
    export const useStationRoutine = () => manager;
    export const useModal = () => ({open:()=>{}});
  `,
  "@shared/lib/localStorageManipulator": `export const LocalStorageManipulator = {
    getItemByKey:()=>String(window.savedWidth ?? 384), setItem:()=>true,
  };`,
};

for (const operation of [
  "SearchRoutineTasks",
  "SearchRoutineRecords",
  "SearchRoutineTaskRecords",
]) {
  const field = operation[0].toLowerCase() + operation.slice(1);
  const status =
    operation === "SearchRoutineRecords"
      ? "RoutineRecordStatus_Failed"
      : "RoutineTaskRecordStatus_Failed";
  mocks[`@/api/graphql/hooks/use${operation}`] = `
    const data = {${field}:{totalCount:30,
      searchPageInfo:{hasNextPage:false, endEncodedSearchCursor:null},
      searchEdges:Array.from({length:30},(_,index)=>({node:{
        id:'record-'+index, routineId:'routine', routineTaskId:'task',
        title:'Create Chapter '+index+' Daily Review Notes',
        kind:'Action', payload:{schemaVersion:1,purpose:'CreateBlockPack'},
        purpose:'RoutineTaskPurpose_CreateBlockPack', status:'${status}',
        errorCode:null, errorReason:'Timeout', previousRoutineTaskIds:[],
        priority:0, maxAttempts:1, attempts:1, actualStartedAt:'2026-10-10T08:00:00Z',
        actualEndedAt:'2026-10-10T08:05:00Z', scheduledAt:'2026-10-10T08:00:00Z',
        createdAt:'2026-10-10T08:00:00Z', updatedAt:'2026-10-10T08:00:00Z',
        totalTaskCount:3, successTaskCount:0, failedTaskCount:3, blockedTaskCount:0,
      }}))}};
    const execute=()=>({retain:()=>Promise.resolve({data})});
    const result={data, fetchMore:async()=>({data})};
    export const use${operation}LazyQuery=()=>[execute,result];
  `;
}

describe("Routine overview responsive layout in Chromium", () => {
  let browser: Browser;
  let page: Page;
  let script: string;
  let css: string;

  beforeAll(async () => {
    const result = await build({
      stdin: { contents: fixture, resolveDir: process.cwd(), loader: "tsx" },
      bundle: true,
      write: false,
      metafile: true,
      platform: "browser",
      jsx: "automatic",
      define: { "process.env.NODE_ENV": '"development"' },
      tsconfig: path.resolve("apps/web/tsconfig.json"),
      plugins: [
        {
          name: "routine-layout-boundaries",
          setup(builder) {
            builder.onResolve({ filter: /.*/ }, args =>
              args.path in mocks
                ? { path: args.path, namespace: "routine-test" }
                : undefined
            );
            builder.onLoad(
              { filter: /.*/, namespace: "routine-test" },
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
    const sources = await Promise.all(
      Object.keys(result.metafile.inputs)
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
    page = await browser.newPage();
    await page.route("http://routine-layout.test/", route =>
      route.fulfill({ contentType: "text/html", body: '<div id="root"></div>' })
    );
    await page.goto("http://routine-layout.test/");
    await page.addStyleTag({ content: css });
  });
  afterEach(async () => {
    await page?.close();
  });
  afterAll(async () => {
    await browser?.close();
  });

  it.each([
    320, 390, 600, 767, 768, 1024, 1440,
  ])("keeps filters above scrollable data at %ipx with many records", async width => {
    await page.setViewportSize({ width, height: 800 });
    await page.addScriptTag({ content: script });
    await page.waitForFunction(
      "document.querySelectorAll('#tables tbody tr').length === 90"
    );
    const sections = await page.locator("#tables > section").all();
    for (const section of sections) {
      const layout = await section.evaluate(element => {
        const header = element.firstElementChild;
        const body = element.lastElementChild;
        if (!header || !body) throw new Error("Missing table layout");
        const headerRect = header.getBoundingClientRect();
        return {
          headerBottom: headerRect.bottom,
          bodyTop: body.getBoundingClientRect().top,
          controlBottoms: Array.from(header.querySelectorAll("button"))
            .map(control => control.getBoundingClientRect())
            .filter(rect => rect.height > 0)
            .map(rect => rect.bottom),
          bodyHeight: body.clientHeight,
          bodyScrollHeight: body.scrollHeight,
          height: element.getBoundingClientRect().height,
        };
      });
      expect(layout.height).toBeLessThanOrEqual(481);
      expect(layout.bodyTop).toBeGreaterThanOrEqual(layout.headerBottom - 1);
      for (const bottom of layout.controlBottoms) {
        expect(bottom).toBeLessThanOrEqual(layout.headerBottom - 1);
      }
      expect(layout.bodyHeight).toBeGreaterThan(0);
      expect(layout.bodyScrollHeight).toBeGreaterThan(layout.bodyHeight);
    }
    expect(await sections[1].textContent()).toContain("Routine record table");
    expect(await sections[2].textContent()).toContain(
      "Routine task record table"
    );
  });

  it.each([
    255, 320, 384, 512,
  ])("removes mobile sidebar space while retaining a saved %ipx desktop width", async savedWidth => {
    await page.evaluate(`window.savedWidth = ${savedWidth}`);
    await page.setViewportSize({ width: 1024, height: 800 });
    await page.addScriptTag({ content: script });
    await page.waitForFunction("window.sidebar && !sidebar.isMobile");
    const inset = page.locator('[data-slot="sidebar-inset"]');
    await page.waitForFunction(
      expected => {
        const element = document.querySelector('[data-slot="sidebar-inset"]');
        return element && getComputedStyle(element).paddingLeft === expected;
      },
      `${savedWidth - 255}px`
    );
    for (const width of [767, 600, 390]) {
      await page.setViewportSize({ width, height: 800 });
      await page.waitForFunction("sidebar.isMobile");
      expect(
        await inset.evaluate(element => getComputedStyle(element).paddingLeft)
      ).toBe("0px");
      expect(
        await page
          .locator("#tables")
          .evaluate(element => element.getBoundingClientRect().left)
      ).toBe(0);
      expect(await page.locator('[data-slot="sidebar-gap"]').count()).toBe(0);
    }
    const trigger = page.locator('#scope [data-slot="sidebar-trigger"]');
    expect(await trigger.count()).toBe(1);
    expect(
      await trigger.evaluate(
        element => getComputedStyle(element).backgroundColor
      )
    ).toBe("rgba(0, 0, 0, 0)");
    await trigger.click();
    await page.waitForFunction("sidebar.openMobile");
    expect(await page.locator('[data-mobile="true"]').isVisible()).toBe(true);
    await page.keyboard.press("Escape");
    await page.waitForFunction("!sidebar.openMobile");
    await page.evaluate("setLoading(true)");
    await page.waitForFunction("document.querySelector('.z-9999')");
    expect(
      await trigger.evaluate(element => {
        const rect = element.getBoundingClientRect();
        return document
          .querySelector(".z-9999")
          ?.contains(
            document.elementFromPoint(
              rect.x + rect.width / 2,
              rect.y + rect.height / 2
            )
          );
      })
    ).toBe(true);
    await page.evaluate("setLoading(false)");
    await page.setViewportSize({ width: 1024, height: 800 });
    await page.waitForFunction("!sidebar.isMobile");
    await page.waitForFunction(
      expected => {
        const element = document.querySelector('[data-slot="sidebar-inset"]');
        return element && getComputedStyle(element).paddingLeft === expected;
      },
      `${savedWidth - 255}px`
    );
    expect(await trigger.count()).toBe(0);
    await page.evaluate("sidebar.setOpen(false)");
    await page.waitForFunction("!sidebar.open");
    await page.evaluate(() =>
      Promise.all(document.getAnimations().map(animation => animation.finished))
    );
    expect(
      await inset.evaluate(element => getComputedStyle(element).paddingLeft)
    ).toBe("0px");
    expect(
      await page
        .locator('[data-slot="sidebar-gap"]')
        .evaluate(element => element.getBoundingClientRect().width)
    ).toBe(48);
  });
});
