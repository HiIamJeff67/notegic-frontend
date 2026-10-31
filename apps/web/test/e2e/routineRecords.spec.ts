import { execFileSync } from "node:child_process";
import { createHmac, randomUUID } from "node:crypto";
import { expect, type Page, test } from "@playwright/test";
import {
  SearchRoutineRecordSortBy,
  SearchRoutineRecordsDocument,
  SearchSortOrder,
} from "../../../../shared/api/graphql/generated/graphql";
import type { createApolloClient } from "../../src/api/apolloClient";
import type { mountRoutineRecords } from "./routineRecordsTestSupport";

test.beforeEach(async ({ page }) => {
  await page.route("https://www.youtube-nocookie.com/embed/**", route =>
    route.fulfill({ contentType: "text/html", body: "<p>Player fixture</p>" })
  );
});

declare global {
  interface Window {
    routineRecordsExample: ReturnType<typeof mountRoutineRecords>;
    routineRecordsSessionClient: ReturnType<typeof createApolloClient>;
  }
}

const openRecordFilters = async (page: Page) => {
  const trigger = page.getByRole("button", {
    name: "Record filters",
    exact: true,
  });
  if ((await trigger.getAttribute("aria-expanded")) !== "true")
    await trigger.click();
};

for (const mode of [
  "routine",
  "task",
  "dialog",
  "record-dialog",
  "task-dialog",
] as const) {
  test(`${mode} records reset cursor and cache when sorting or filters change`, async ({
    page,
  }) => {
    test.skip(
      process.env.E2E_PRODUCTION === "true",
      "Uses Vite source imports"
    );
    await page.goto("/document");
    await page.waitForLoadState("networkidle");
    const inputs: Array<Record<string, unknown>> = [];
    let blockNextPage = false;
    let resumePage: (() => void) | undefined;
    let pageSettled = Promise.resolve();
    const field =
      mode === "routine" ? "searchRoutineRecords" : "searchRoutineTaskRecords";
    const suffix = mode === "routine" ? "RoutineRecord" : "RoutineTaskRecord";
    await page.route("**/record-acceptance/graphql", async route => {
      const input = route.request().postDataJSON().variables.input;
      inputs.push(input);
      let finishPage: (() => void) | undefined;
      if (input.after && blockNextPage) {
        pageSettled = new Promise<void>(resolve => {
          finishPage = resolve;
        });
        await new Promise<void>(resolve => {
          resumePage = resolve;
        });
      }
      const ids = input.after ? [3] : input.status ? [4] : [1, 2];
      const edges = ids.map(id => ({
        __typename: `Search${suffix}Edge`,
        encodedSearchCursor: `cursor-${id}-${input.sortOrder}-${input.status ?? "all"}`,
        node: {
          __typename: `Private${suffix}`,
          id: `00000000-0000-4000-8000-${String(id).padStart(12, "0")}`,
          routineId: "00000000-0000-4000-8000-000000000001",
          routineTaskId: "00000000-0000-4000-8000-000000000002",
          routineRecordId: `00000000-0000-4000-8000-${String(id).padStart(12, "0")}`,
          purpose: "RoutineTaskPurpose_GetRoutine",
          status:
            input.status ??
            (mode === "routine"
              ? "RoutineRecordStatus_Success"
              : "RoutineTaskRecordStatus_Success"),
          errorCode: null,
          errorReason: null,
          attempts: id,
          actualStartedAt: `2026-10-${String(id).padStart(2, "0")}T01:00:00Z`,
          actualEndedAt: null,
          scheduledAt: "2026-10-01T00:00:00Z",
          createdAt: "2026-10-01T00:00:00Z",
          updatedAt: "2026-10-01T00:00:00Z",
          totalTaskCount: 1,
          successTaskCount: 1,
          failedTaskCount: 0,
          blockedTaskCount: 0,
          runningTaskCount: 0,
          waitingTaskCount: 0,
          snapshot: {},
          payloadSnapshot: { schemaVersion: 1, purpose: "GetRoutine" },
          resultSnapshot: id === 2 ? { updated: 1, items: [] } : {},
        },
      }));
      await route.fulfill({
        json: {
          data: {
            [field]: {
              __typename: `Search${suffix}Connection`,
              searchEdges: edges,
              totalCount: edges.length,
              searchTime: 0,
              searchPageInfo: {
                __typename: "SearchPageInfo",
                hasNextPage: !input.after && !input.status,
                hasPreviousPage: Boolean(input.after),
                startEncodedSearchCursor: edges[0].encodedSearchCursor,
                endEncodedSearchCursor: edges.at(-1)!.encodedSearchCursor,
              },
            },
          },
        },
      });
      finishPage?.();
    });
    await page.evaluate(async mode => {
      const path = "/test/e2e/routineRecordsTestSupport.tsx";
      const { mountRoutineRecords } = await import(/* @vite-ignore */ path);
      window.routineRecordsExample = mountRoutineRecords(mode);
    }, mode);
    const table = page.getByRole("table").last();
    await expect(table.locator("tbody tr")).toHaveCount(2);
    await openRecordFilters(page);
    await page
      .getByRole("button", { name: "Started at or after", exact: true })
      .click();
    await page.locator("button[data-day]:not([disabled])").first().click();
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("button", { name: "Started at or after", exact: true })
    ).toHaveAttribute("aria-expanded", "false");
    await expect
      .poll(() => typeof inputs.at(-1)?.actualStartedAtFrom)
      .toBe("string");
    expect(inputs.at(-1)?.after).toBeUndefined();
    const countBeforeInvalidRange = inputs.length;
    await page
      .getByRole("button", { name: "Started before", exact: true })
      .click();
    await page.locator("button[data-day]:not([disabled])").first().click();
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("button", { name: "Started before", exact: true })
    ).toHaveAttribute("aria-expanded", "false");
    await expect(page.getByRole("alert")).toHaveText(
      "The end must be later than the start."
    );
    expect(inputs.length).toBe(countBeforeInvalidRange);
    await openRecordFilters(page);
    await page
      .getByRole("button", { name: "Reset filters", exact: true })
      .click();
    await expect.poll(() => inputs.at(-1)?.actualStartedAtFrom).toBeUndefined();
    expect(inputs[0]).toMatchObject({
      sortBy: "ACTUAL_STARTED_AT",
      sortOrder: "DESC",
    });
    await page
      .getByRole("button", { name: "Record filters", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Record filters", exact: true })
    ).toHaveAttribute("aria-expanded", "false");
    if (mode.endsWith("dialog")) {
      await expect(
        page.getByRole("status", { name: "Record summary", exact: true })
      ).toHaveText("Loaded 2 records · Success 2");
      await expect(
        page.getByText("Deterministic creation barrier", { exact: true })
      ).toHaveCount(0);
      await expect(
        page.getByText("No detailed output", { exact: true })
      ).toHaveCount(1);
      const previewWidths = () =>
        table.locator("thead th").evaluateAll(columns => ({
          input: columns[6].getBoundingClientRect().width,
          result: columns[7].getBoundingClientRect().width,
        }));
      const compact = await previewWidths();
      expect(compact.input).toBeLessThan(190);
      expect(compact.result).toBeLessThan(190);
      if (mode === "dialog") {
        await expect(
          page.getByRole("dialog", { name: "Record filters", exact: true })
        ).toHaveCount(0);
        await page.screenshot({
          path: "/tmp/notegic-record-preview-compact.png",
        });
      }
      const resultPreview = table
        .locator("summary")
        .filter({ hasText: "Execution result" });
      await resultPreview.click();
      await expect(table.locator("pre:visible")).toContainText('"updated": 1');
      expect((await previewWidths()).result).toBeGreaterThan(310);
      expect((await previewWidths()).input).toBeLessThan(190);
      await expect(
        table.getByRole("columnheader", {
          name: "Execution input",
          exact: true,
        })
      ).toBeVisible();
      await expect(
        table.getByRole("columnheader", {
          name: "Execution result",
          exact: true,
        })
      ).toBeVisible();
      const inputPreviews = table
        .locator("summary")
        .filter({ hasText: "Execution input" });
      await inputPreviews.first().click();
      const expanded = await previewWidths();
      expect(expanded.input).toBeGreaterThan(470);
      expect(expanded.result).toBeGreaterThan(310);
      expect(expanded.input).toBeGreaterThan(expanded.result);
      if (mode === "dialog") {
        await table.evaluate(element => {
          const viewport = element.closest(".custom-scrollbar")!;
          viewport.scrollLeft = viewport.scrollWidth;
        });
        await page.screenshot({ path: "/tmp/notegic-record-preview-wide.png" });
      }
      await resultPreview.click();
      expect((await previewWidths()).result).toBeLessThan(190);
      expect((await previewWidths()).input).toBeGreaterThan(470);
      await inputPreviews.nth(1).click();
      await inputPreviews.first().click();
      expect((await previewWidths()).input).toBeGreaterThan(470);
      await inputPreviews.nth(1).click();
      await expect.poll(previewWidths).toEqual(compact);
      expect(inputs[0].routineTaskIds).toEqual(
        mode === "task-dialog" ? ["00000000-0000-4000-8000-000000000002"] : []
      );
      if (mode === "record-dialog")
        expect(inputs[0].routineRecordId).toBe(
          "00000000-0000-4000-8000-000000000099"
        );
    }
    await table.evaluate(element => {
      const viewport = element.closest(".custom-scrollbar")!;
      viewport.scrollTop = viewport.scrollHeight;
      viewport.dispatchEvent(new Event("scroll", { bubbles: true }));
    });
    await expect(table.locator("tbody tr")).toHaveCount(3);
    expect(inputs.at(-1)?.after).toBeTruthy();
    await page
      .getByRole("button", { name: "Sort records", exact: true })
      .click();
    await page
      .getByRole("menuitemradio", { name: "Ascending", exact: true })
      .click();
    await page.keyboard.press("Escape");
    await expect(table.locator("tbody tr")).toHaveCount(2);
    expect(inputs.at(-1)).toMatchObject({ sortOrder: "ASC" });
    expect(inputs.at(-1)?.after).toBeUndefined();
    await page
      .getByRole("button", { name: "Sort records", exact: true })
      .click();
    await expect(
      page.getByRole("menuitemradio", { name: "Ascending", exact: true })
    ).toBeChecked();
    await expect(
      page
        .getByRole("menuitemradio", { name: "Ascending", exact: true })
        .locator("svg.lucide-check")
    ).toHaveCount(1);
    await page
      .getByRole("menuitemradio", { name: "Updated at", exact: true })
      .click();
    await expect.poll(() => inputs.at(-1)?.sortBy).toBe("LAST_UPDATE");
    expect(inputs.at(-1)?.sortOrder).toBe("ASC");
    expect(inputs.at(-1)?.after).toBeUndefined();
    await page.keyboard.press("Escape");
    await openRecordFilters(page);
    await page.getByRole("combobox", { name: "Status", exact: true }).click();
    await page.getByRole("option", { name: "Failed", exact: true }).click();
    await expect(table.locator("tbody tr")).toHaveCount(1);
    expect(inputs.at(-1)?.status).toBe(
      mode === "routine"
        ? "RoutineRecordStatus_Failed"
        : "RoutineTaskRecordStatus_Failed"
    );
    expect(inputs.at(-1)?.after).toBeUndefined();
    await page.keyboard.press("Escape");
    await page
      .getByRole("textbox", { name: "Search records", exact: true })
      .fill("failure");
    await expect.poll(() => inputs.at(-1)?.query).toBe("failure");
    expect(inputs.at(-1)?.after).toBeUndefined();
    await openRecordFilters(page);
    await page
      .getByRole("button", { name: "Reset filters", exact: true })
      .click();
    await expect.poll(() => inputs.at(-1)?.query).toBe("");
    expect(inputs.at(-1)?.sortOrder).toBe("ASC");
    expect(inputs.at(-1)?.sortBy).toBe("LAST_UPDATE");
    await page.keyboard.press("Escape");
    await expect(table.locator("tbody tr")).toHaveCount(2);
    blockNextPage = true;
    await table.evaluate(element => {
      const viewport = element.closest(".custom-scrollbar")!;
      viewport.scrollTop = viewport.scrollHeight;
      viewport.dispatchEvent(new Event("scroll", { bubbles: true }));
    });
    await expect.poll(() => Boolean(resumePage)).toBe(true);
    await openRecordFilters(page);
    await page.getByRole("combobox", { name: "Status", exact: true }).click();
    await page.getByRole("option", { name: "Failed", exact: true }).click();
    await expect(table.locator("tbody tr")).toHaveCount(1);
    resumePage?.();
    await pageSettled;
    await page.evaluate(
      () =>
        new Promise<void>(resolve =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
        )
    );
    await expect(table.locator("tbody tr")).toHaveCount(1);
    await page.keyboard.press("Escape");
    if (mode.endsWith("dialog")) {
      const dialog = page.getByRole("dialog", {
        name: "Routine task records",
        exact: true,
      });
      for (const size of [
        { width: 1920, height: 1080 },
        { width: 1024, height: 600 },
        { width: 844, height: 390 },
        { width: 390, height: 844 },
        { width: 320, height: 280 },
      ]) {
        await page.setViewportSize(size);
        await expect(dialog).toBeVisible();
        const columns = table.locator("thead th");
        expect((await columns.nth(6).boundingBox())!.width).toBeLessThan(270);
        expect((await columns.nth(7).boundingBox())!.width).toBeLessThan(270);
        const scroll = await table.evaluate(element => {
          const viewport = element.closest(".custom-scrollbar")!;
          viewport.scrollLeft = viewport.scrollWidth;
          return {
            width: viewport.clientWidth,
            content: viewport.scrollWidth,
            left: viewport.scrollLeft,
          };
        });
        if (size.width < 1900) {
          expect(scroll.content).toBeGreaterThan(scroll.width);
          expect(scroll.left).toBeGreaterThan(0);
        }
        if (mode === "dialog" && size.width === 320)
          await page.screenshot({
            path: "/tmp/notegic-record-preview-small.png",
          });
        await expect(
          table.locator("tbody tr").last().locator("td").last()
        ).toBeInViewport();
        const bounds = await dialog.boundingBox();
        expect(bounds!.width).toBeGreaterThan(size.width * 0.85);
        expect(bounds!.x).toBeGreaterThanOrEqual(8);
        expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(size.width - 8);
        expect(bounds!.y).toBeGreaterThanOrEqual(0);
        expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(size.height);
        await expect(
          dialog.getByRole("button", { name: "Close", exact: true })
        ).toBeInViewport();
        await table.locator("tbody tr").last().scrollIntoViewIfNeeded();
        await expect(table.locator("tbody tr").last()).toBeInViewport();
        await page
          .getByRole("textbox", { name: "Search records", exact: true })
          .scrollIntoViewIfNeeded();
        await expect(
          page.getByRole("textbox", { name: "Search records", exact: true })
        ).toBeInViewport();
        for (const control of ["Record filters", "Sort records"]) {
          const trigger = page.getByRole("button", {
            name: control,
            exact: true,
          });
          await trigger.click();
          const panel = page.getByRole(
            control === "Record filters" ? "dialog" : "menu",
            { name: control, exact: true }
          );
          await expect(panel).toBeVisible();
          await expect
            .poll(async () => {
              const box = await panel.boundingBox();
              return (
                box !== null &&
                box.height <= 321 &&
                box.x >= 0 &&
                box.x + box.width <= size.width &&
                box.y >= 0 &&
                box.y + box.height <= size.height
              );
            })
            .toBe(true);
          if (control === "Record filters") {
            const label = (await panel.locator("label").first().boundingBox())!;
            const input = (await panel
              .getByRole("combobox", { name: "Status", exact: true })
              .boundingBox())!;
            expect(label.x + label.width).toBeLessThan(input.x);
            const reset = panel.getByRole("button", {
              name: "Reset filters",
              exact: true,
            });
            await reset.scrollIntoViewIfNeeded();
            await expect(reset).toBeInViewport();
          } else {
            const ascending = panel.getByRole("menuitemradio", {
              name: "Ascending",
              exact: true,
            });
            await ascending.scrollIntoViewIfNeeded();
            await expect(ascending).toBeInViewport();
          }
          await page.keyboard.press("Escape");
          await expect(panel).toHaveCount(0);
          await expect(trigger).toBeFocused();
        }
      }
    }
    await page.evaluate(() => window.routineRecordsExample.unmount());
  });
}

test("real backend filters complete Routine history before cursor pagination", async ({
  page,
  request,
}) => {
  const apiURL = process.env.E2E_ROUTINE_API_URL;
  const database = process.env.E2E_ROUTINE_DATABASE;
  test.skip(
    process.env.E2E_RUN_RECORD_BACKEND !== "true" ||
      !apiURL ||
      new URL(apiURL).hostname !== "127.0.0.1" ||
      !database?.match(/^notegic_routine_acceptance_[a-z0-9_]+$/),
    "requires retained isolated local Core, ClientGateway and acceptance database"
  );
  test.skip(process.env.E2E_PRODUCTION === "true", "Uses Vite source imports");
  test.setTimeout(240_000);
  const name = `Records${randomUUID().replaceAll("-", "").slice(0, 12)}`;
  const registration = await request.post(
    `${apiURL}/api/development/v1/auth/register`,
    {
      headers: {
        Origin: "http://127.0.0.1:4173",
        "User-Agent": "RecordAcceptance/1.0",
      },
      data: {
        name,
        email: `${name}@example.invalid`,
        password: "RecordAcceptance123!",
      },
    }
  );
  expect(registration.ok()).toBe(true);
  await page.goto("/login");
  await page.locator("html[data-density]").waitFor();
  await page.getByLabel("Account").fill(name);
  await page.getByLabel("Password").fill("RecordAcceptance123!");
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await expect(page).toHaveURL(/\/app\/dashboard\/?$/, { timeout: 30_000 });
  await page.waitForLoadState("networkidle");
  const fixture = await page.evaluate(async () => {
    const load = (path: string) => import(/* @vite-ignore */ path);
    const { getClientRequestHeaders } = await load("/src/api/clientHeaders.ts");
    const { CreateStation } = await load(
      "/src/api/functions/station.serverFn.ts"
    );
    const { CreateRoutineByStationId } = await load(
      "/src/api/functions/routine.serverFn.ts"
    );
    const { CreateRoutineTaskByRoutineId } = await load(
      "/src/api/functions/routineTask.serverFn.ts"
    );
    const station = await CreateStation({
      data: {
        header: getClientRequestHeaders(),
        body: {
          name: "Record acceptance",
          description: "Retained isolated records fixture",
        },
      },
    });
    const routine = await CreateRoutineByStationId({
      data: {
        header: getClientRequestHeaders(),
        body: {
          stationId: station.data.id,
          title: "Inactive records acceptance",
          description: "Never scheduled",
          isActive: false,
          timezone: "UTC",
        },
      },
    });
    const task = await CreateRoutineTaskByRoutineId({
      data: {
        header: getClientRequestHeaders(),
        body: {
          routineId: routine.data.id,
          expectedDefinitionVersion: routine.data.definitionVersion ?? 1,
          kind: "Action",
          title: "Record acceptance action",
          x: 0,
          y: 0,
          maxAttempts: 1,
          priority: 0,
          payload: {
            schemaVersion: 1,
            purpose: "GetRoutine",
            routineId: routine.data.id,
          },
        },
      },
    });
    return { routineId: routine.data.id, taskId: task.data.id };
  });
  const ids = Array.from({ length: 32 }, () => randomUUID());
  const values = ids.map((id, index) => {
    const at = new Date(Date.UTC(2026, 0, 1, 0, 0, 32 - index)).toISOString();
    return `('${id}','${fixture.routineId}',1,'${index < 22 ? "Success" : "Failed"}','${at}','${at}',1,0,0,0,0,0,'{}','${at}','${at}')`;
  });
  const tasks = ids.map((id, index) => {
    const at = new Date(Date.UTC(2026, 0, 1, 0, 0, 32 - index)).toISOString();
    return `('${randomUUID()}','${id}','${fixture.taskId}','GetRoutine','${index < 22 ? "Success" : "Failed"}',1,'{}','{}','${at}','${at}','${at}')`;
  });
  const sql = `BEGIN; INSERT INTO "RoutineRecordTable" (id,routine_id,definition_version,status,scheduled_at,actual_started_at,total_task_count,success_task_count,failed_task_count,blocked_task_count,running_task_count,waiting_task_count,snapshot,updated_at,created_at) VALUES ${values.join(",")}; INSERT INTO "RoutineTaskRecordTable" (id,routine_record_id,routine_task_id,purpose,status,attempts,payload_snapshot,result_snapshot,actual_started_at,updated_at,created_at) VALUES ${tasks.join(",")}; COMMIT;`;
  execFileSync(
    "docker",
    [
      "exec",
      "-i",
      "notegic-db",
      "sh",
      "-c",
      `PGPASSWORD="$POSTGRES_PASSWORD" exec psql -U "$POSTGRES_USER" -d ${database} -v ON_ERROR_STOP=1`,
    ],
    { input: sql, stdio: ["pipe", "pipe", "pipe"] }
  );
  const requests: Array<Record<string, unknown>> = [];
  page.on("request", request => {
    if (request.url() === `${apiURL}/api/development/v1/graphql/`)
      requests.push(request.postDataJSON().variables.input);
  });
  for (const mode of ["routine", "task", "dialog"] as const) {
    await page.evaluate(
      async ({ mode, fixture, apiURL }) => {
        const path = "/test/e2e/routineRecordsTestSupport.tsx";
        const { mountRoutineRecords } = await import(/* @vite-ignore */ path);
        window.routineRecordsExample = mountRoutineRecords(mode, {
          ...fixture,
          uri: `${apiURL}/api/development/v1/graphql/`,
        });
      },
      { mode, fixture, apiURL }
    );
    const table = page.getByRole("table").last();
    await expect(table.locator("tbody tr")).toHaveCount(20, {
      timeout: 30_000,
    });
    const before = requests.length;
    await table.evaluate(element => {
      const viewport = element.closest(".custom-scrollbar")!;
      viewport.scrollTop = viewport.scrollHeight;
      viewport.dispatchEvent(new Event("scroll", { bubbles: true }));
    });
    await expect(table.locator("tbody tr")).toHaveCount(32);
    expect(requests.length).toBeGreaterThan(before);
    expect(requests.at(-1)?.after).toBeTruthy();
    await openRecordFilters(page);
    await page.getByRole("combobox", { name: "Status", exact: true }).click();
    await page.getByRole("option", { name: "Failed", exact: true }).click();
    await expect(table.locator("tbody tr")).toHaveCount(10);
    expect(
      await table.evaluate(
        element => element.closest(".custom-scrollbar")!.scrollTop
      )
    ).toBe(0);
    expect(requests.at(-1)?.after).toBeUndefined();
    await page.keyboard.press("Escape");
    await page
      .getByRole("button", { name: "Sort records", exact: true })
      .click();
    await page
      .getByRole("menuitemradio", { name: "Ascending", exact: true })
      .click();
    await page.keyboard.press("Escape");
    await expect.poll(() => requests.at(-1)?.sortOrder).toBe("ASC");
    expect(requests.at(-1)?.after).toBeUndefined();
    await page.evaluate(() => window.routineRecordsExample.unmount());
  }
  await page.evaluate(
    async ({ fixture, apiURL, id }) => {
      const path = "/test/e2e/routineRecordsTestSupport.tsx";
      const { mountRoutineRecords } = await import(/* @vite-ignore */ path);
      window.routineRecordsExample = mountRoutineRecords("dialog", {
        ...fixture,
        routineRecordId: id,
        uri: `${apiURL}/api/development/v1/graphql/`,
      });
    },
    { fixture, apiURL, id: ids.at(-1)! }
  );
  await expect(page.getByRole("table").last().locator("tbody tr")).toHaveCount(
    1
  );
  expect(requests.at(-1)?.routineRecordId).toBe(ids.at(-1));
  await expect(
    page.getByText("No detailed output", { exact: true })
  ).toBeVisible();
  await page.evaluate(() => window.routineRecordsExample.unmount());
  const csrfToken = await page.evaluate(() =>
    JSON.parse(sessionStorage.getItem("notegic_CSRFToken")!)
  );
  const graphql = async (
    field: string,
    type: string,
    input: Record<string, unknown>
  ) => {
    const response = await page.request.post(
      `${apiURL}/api/development/v1/graphql/`,
      {
        headers: {
          Origin: "http://127.0.0.1:4173",
          "X-CSRF-Token": csrfToken,
          "User-Agent": await page.evaluate(() => navigator.userAgent),
        },
        data: {
          query: `query Records($input: ${type}!) { ${field}(input: $input) { searchEdges { encodedSearchCursor node { id actualStartedAt } } searchPageInfo { hasNextPage endEncodedSearchCursor } } }`,
          variables: { input },
        },
      }
    );
    expect(response.status()).toBe(200);
    const result = await response.json();
    expect(
      Object.keys(result).every(key =>
        [
          "data",
          "errors",
          "extensions",
          "embedded",
          "refreshableTokens",
        ].includes(key)
      )
    ).toBe(true);
    expect(typeof result.embedded?.publicId).toBe("string");
    expect(JSON.stringify(result).includes('"accessToken":')).toBe(false);
    expect(JSON.stringify(result).includes('"refreshToken":')).toBe(false);
    if (result.refreshableTokens) {
      expect(
        response.headers()["x-csrf-token"] ===
          result.refreshableTokens.newCSRFToken
      ).toBe(true);
    }
    return result;
  };
  for (const task of [false, true]) {
    const field = task ? "searchRoutineTaskRecords" : "searchRoutineRecords";
    const type = task
      ? "SearchRoutineTaskRecordInput"
      : "SearchRoutineRecordInput";
    const input = {
      routineIds: [fixture.routineId],
      ...(task ? { routineTaskIds: [] } : {}),
      query: "",
      status: task
        ? "RoutineTaskRecordStatus_Failed"
        : "RoutineRecordStatus_Failed",
      actualStartedAtFrom: "2026-01-01T00:00:03Z",
      actualStartedAtBefore: "2026-01-01T00:00:08Z",
      first: 2,
      sortBy: "ACTUAL_STARTED_AT",
      sortOrder: "DESC",
    };
    const first = await graphql(field, type, input);
    expect(first.errors).toBeUndefined();
    expect(
      first.data[field].searchEdges.map(
        (edge: { node: { actualStartedAt: string } }) =>
          new Date(edge.node.actualStartedAt).getUTCSeconds()
      )
    ).toEqual([7, 6]);
    expect(first.data[field].searchPageInfo.hasNextPage).toBe(true);
    const after = first.data[field].searchPageInfo.endEncodedSearchCursor;
    const second = await graphql(field, type, { ...input, after });
    expect(second.errors).toBeUndefined();
    expect(
      second.data[field].searchEdges.map(
        (edge: { node: { actualStartedAt: string } }) =>
          new Date(edge.node.actualStartedAt).getUTCSeconds()
      )
    ).toEqual([5, 4]);
    const last = await graphql(field, type, {
      ...input,
      after: second.data[field].searchPageInfo.endEncodedSearchCursor,
    });
    expect(
      last.data[field].searchEdges.map(
        (edge: { node: { actualStartedAt: string } }) =>
          new Date(edge.node.actualStartedAt).getUTCSeconds()
      )
    ).toEqual([3]);
    expect(last.data[field].searchPageInfo.hasNextPage).toBe(false);
    const changed = await graphql(field, type, {
      ...input,
      after,
      sortOrder: "ASC",
    });
    expect(changed.errors).toHaveLength(1);
    expect(changed.errors[0].extensions.reason).toBe("CursorDecodeFailed");
    expect(changed.errors[0].extensions.httpStatus).toBe(400);
    expect(changed.errors[0].path).toEqual([field]);
    expect(changed.errors[0].locations.length).toBeGreaterThan(0);
    const invalidRange = await graphql(field, type, {
      ...input,
      actualStartedAtBefore: input.actualStartedAtFrom,
    });
    expect(invalidRange.errors).toHaveLength(1);
    expect(invalidRange.errors[0].extensions.httpStatus).toBe(400);
    if (task) {
      const purpose = await graphql(field, type, {
        ...input,
        purpose: "RoutineTaskPurpose_CreateMaterial",
      });
      expect(purpose.errors).toBeUndefined();
      expect(purpose.data[field].searchEdges).toHaveLength(0);
    }
  }

  const accessSecret = process.env.E2E_ROUTINE_ACCESS_TOKEN_SECRET;
  expect(accessSecret?.startsWith("routine-refresh-fixture-")).toBe(true);
  await page.evaluate(async () => {
    const path = "/src/api/apolloClient.ts";
    const { createApolloClient } = await import(/* @vite-ignore */ path);
    window.routineRecordsSessionClient = createApolloClient();
  });
  for (const phase of ["cache-miss", "cursor-error", "cache-hit"] as const) {
    const cacheMiss = phase === "cache-miss";
    const previousCSRFToken = await page.evaluate(() =>
      JSON.parse(sessionStorage.getItem("notegic_CSRFToken")!)
    );
    const accessCookie = (await page.context().cookies()).find(
      cookie => cookie.name === "accessToken"
    );
    expect(accessCookie).toBeDefined();
    const [header, payload, signature] = accessCookie!.value.split(".");
    expect(
      createHmac("sha256", accessSecret!)
        .update(`${header}.${payload}`)
        .digest("base64url") === signature
    ).toBe(true);
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString());
    const expiredPayload = Buffer.from(
      JSON.stringify({
        ...claims,
        iat: Math.floor(Date.now() / 1000) - 3600,
        exp: Math.floor(Date.now() / 1000) - 60,
      })
    ).toString("base64url");
    const expiredSignature = createHmac("sha256", accessSecret!)
      .update(`${header}.${expiredPayload}`)
      .digest("base64url");
    const expiredAccess = `${header}.${expiredPayload}.${expiredSignature}`;
    if (cacheMiss) {
      const state = execFileSync(
        "docker",
        [
          "exec",
          "notegic-redis",
          "sh",
          "-c",
          'REDISCLI_AUTH="$REDIS_PASSWORD" redis-cli -n 14 EXISTS "$1" && REDISCLI_AUTH="$REDIS_PASSWORD" redis-cli -n 14 EXPIRE "$1" 0 && REDISCLI_AUTH="$REDIS_PASSWORD" redis-cli -n 14 EXISTS "$1"',
          "record-refresh",
          `UserData:${name}`,
        ],
        { encoding: "utf8" }
      ).trim();
      expect(state.split(/\s+/)).toEqual(["1", "1", "0"]);
    }
    await page
      .context()
      .addCookies([{ ...accessCookie!, value: expiredAccess }]);
    const input = {
      routineIds: [fixture.routineId],
      query: "",
      first: 2,
      sortBy: SearchRoutineRecordSortBy.ActualStartedAt,
      sortOrder: SearchSortOrder.Desc,
      ...(phase === "cursor-error" ? { after: "invalid-fixture-cursor" } : {}),
    };
    const [renewalResponse, renewalResult] = await Promise.all([
      page.waitForResponse(
        response => response.url() === `${apiURL}/api/development/v1/graphql/`
      ),
      page.evaluate(
        async ({ document, input }) => {
          try {
            const result = await window.routineRecordsSessionClient.query({
              query: document,
              variables: { input },
              fetchPolicy: "no-cache",
            });
            return {
              count: result.data?.searchRoutineRecords.searchEdges.length,
            };
          } catch (error) {
            return {
              reason: (
                error as {
                  errors?: Array<{ extensions?: { reason?: string } }>;
                }
              ).errors?.[0]?.extensions?.reason,
            };
          }
        },
        { document: SearchRoutineRecordsDocument, input }
      ),
    ]);
    expect(renewalResponse.status()).toBe(200);
    const renewed = await renewalResponse.json();
    expect(typeof renewed.refreshableTokens?.newCSRFToken).toBe("string");
    if (!cacheMiss) {
      expect(renewed.refreshableTokens.newCSRFToken === previousCSRFToken).toBe(
        false
      );
    }
    if (phase === "cursor-error") {
      expect(renewed.errors[0].extensions.reason).toBe("CursorDecodeFailed");
      expect(renewed.errors[0].extensions.httpStatus).toBe(400);
      expect(renewalResult.reason).toBe("CursorDecodeFailed");
    } else {
      expect(renewed.errors).toBeUndefined();
      expect(renewalResult.count).toBe(2);
    }
    expect(
      await page.evaluate(
        token =>
          JSON.parse(sessionStorage.getItem("notegic_CSRFToken")!) === token,
        renewed.refreshableTokens.newCSRFToken
      )
    ).toBe(true);
    const renewedCookie = (await page.context().cookies()).find(
      cookie => cookie.name === "accessToken"
    );
    expect(renewedCookie?.httpOnly).toBe(true);
    expect(renewedCookie?.value === expiredAccess).toBe(false);
    const renewedClaims = JSON.parse(
      Buffer.from(renewedCookie!.value.split(".")[1], "base64url").toString()
    );
    expect(renewedClaims.sub === claims.sub).toBe(true);
    expect(renewedClaims.exp).toBeGreaterThan(Date.now() / 1000);
    const [followupResponse, followupCount] = await Promise.all([
      page.waitForResponse(
        response => response.url() === `${apiURL}/api/development/v1/graphql/`
      ),
      page.evaluate(
        async ({ document, input }) => {
          const result = await window.routineRecordsSessionClient.query({
            query: document,
            variables: { input: { ...input, after: undefined } },
            fetchPolicy: "no-cache",
          });
          return result.data?.searchRoutineRecords.searchEdges.length;
        },
        { document: SearchRoutineRecordsDocument, input }
      ),
    ]);
    expect(followupCount).toBe(2);
    expect(followupResponse.status()).toBe(200);
    expect(
      followupResponse.request().headers()["x-csrf-token"] ===
        renewed.refreshableTokens.newCSRFToken
    ).toBe(true);
    const cacheState = execFileSync(
      "docker",
      [
        "exec",
        "notegic-redis",
        "sh",
        "-c",
        'REDISCLI_AUTH="$REDIS_PASSWORD" redis-cli -n 14 EXISTS "$1"',
        "record-refresh",
        `UserData:${name}`,
      ],
      { encoding: "utf8" }
    ).trim();
    expect(cacheState).toBe("1");
  }
  await page.evaluate(() => window.routineRecordsSessionClient.stop());
});

for (const mode of ["routines", "tasks"] as const) {
  test(`${mode} table searches and orders the API with isolated cursor pages on mobile`, async ({
    page,
  }) => {
    test.skip(
      process.env.E2E_PRODUCTION === "true",
      "Uses Vite source imports"
    );
    await page.goto("/document");
    await page.locator("html[data-density]").waitFor();
    const inputs: Array<Record<string, unknown>> = [];
    let blockNextPage = false;
    let release: (() => void) | undefined;
    let settled = Promise.resolve();
    const field = mode === "routines" ? "searchRoutines" : "searchRoutineTasks";
    await page.route("**/record-acceptance/graphql", async route => {
      const input = route.request().postDataJSON().variables.input;
      inputs.push(input);
      let finish: (() => void) | undefined;
      if (input.after && blockNextPage) {
        settled = new Promise<void>(resolve => {
          finish = resolve;
        });
        await new Promise<void>(resolve => {
          release = resolve;
        });
      }
      const ids = input.query
        ? [4]
        : input.after
          ? [3]
          : input.sortOrder === "DESC"
            ? [2, 1]
            : [1, 2];
      const edges = ids.map(id => ({
        __typename:
          mode === "routines" ? "SearchRoutineEdge" : "SearchRoutineTaskEdge",
        encodedSearchCursor: `entity-${id}-${input.query}-${input.sortBy}-${input.sortOrder}`,
        node: {
          __typename:
            mode === "routines"
              ? "PrivateSearchableRoutine"
              : "PrivateRoutineTask",
          id: `00000000-0000-4000-8000-${String(id).padStart(12, "0")}`,
          stationId: "00000000-0000-4000-8000-000000000010",
          routineId: "00000000-0000-4000-8000-000000000001",
          title:
            id === 1
              ? "Alpha"
              : id === 2
                ? "Zulu"
                : id === 3
                  ? "Next page"
                  : "Fresh needle",
          kind: "Action",
          x: 0,
          y: 0,
          payload: { schemaVersion: 1, purpose: "GetRoutine" },
          priority: id,
          maxAttempts: 3,
          previousRoutineTaskIds: [],
          phase: "RoutinePhase_Plan",
          timeoutSeconds: 600,
          isActive: false,
          hasCustomSchedule: false,
          admissionState: "Paused",
          definitionVersion: 1,
          isPinned: false,
          scheduledStartAt: "2026-10-22T00:00:00Z",
          scheduledEndAt: "2026-10-22T01:00:00Z",
          period: null,
          timezone: "UTC",
          deletedAt: null,
          createdAt: "2026-10-21T00:00:00Z",
          updatedAt: "2026-10-22T00:00:00Z",
          tagIds: [],
          taskIds: [],
          itemIds: [],
        },
      }));
      await route.fulfill({
        json: {
          data: {
            [field]: {
              __typename:
                mode === "routines"
                  ? "SearchRoutineConnection"
                  : "SearchRoutineTaskConnection",
              searchEdges: edges,
              totalCount: edges.length,
              searchTime: 0,
              searchPageInfo: {
                __typename: "SearchPageInfo",
                hasNextPage: !input.after && !input.query,
                hasPreviousPage: Boolean(input.after),
                startEncodedSearchCursor: edges[0].encodedSearchCursor,
                endEncodedSearchCursor: edges.at(-1)!.encodedSearchCursor,
              },
            },
          },
        },
      });
      finish?.();
    });
    await page.evaluate(async mode => {
      const path = "/test/e2e/routineRecordsTestSupport.tsx";
      const { mountRoutineRecords } = await import(/* @vite-ignore */ path);
      window.routineRecordsExample = mountRoutineRecords(mode);
    }, mode);
    const table = page.locator("#routine-record-acceptance table");
    await expect(table.locator("tbody tr")).toHaveCount(2);
    const search = page.getByRole("textbox", {
      name: mode === "routines" ? "Search routines" : "Search routine tasks",
      exact: true,
    });
    const sort = page.getByRole("button", {
      name: mode === "routines" ? "Sort routines" : "Sort routine tasks",
      exact: true,
    });
    const filter = page.getByRole("button", {
      name: mode === "routines" ? "Routine filters" : "Routine task filters",
      exact: true,
    });
    const loadMore = () =>
      table.evaluate(element => {
        const viewport = element.closest(".custom-scrollbar")!;
        viewport.scrollTop = viewport.scrollHeight;
        viewport.dispatchEvent(new Event("scroll", { bubbles: true }));
      });
    await loadMore();
    await expect(table.locator("tbody tr")).toHaveCount(3);
    expect(inputs.at(-1)?.after).toBeTruthy();
    await sort.click();
    await page
      .getByRole("menuitemradio", { name: "Descending", exact: true })
      .click();
    await expect(table.locator("tbody tr")).toHaveCount(2);
    await expect(table.locator("tbody tr").first()).toContainText("Zulu");
    expect(inputs.at(-1)?.after).toBeUndefined();
    expect(inputs.at(-1)?.sortOrder).toBe("DESC");
    await expect(
      page
        .getByRole("menuitemradio", { name: "Descending", exact: true })
        .locator("svg.lucide-check")
    ).toHaveCount(1);
    await page
      .getByRole("menuitemradio", { name: "Updated at", exact: true })
      .click();
    await expect.poll(() => inputs.at(-1)?.sortBy).toBe("LAST_UPDATE");
    expect(inputs.at(-1)?.after).toBeUndefined();
    await page.keyboard.press("Escape");
    blockNextPage = true;
    await loadMore();
    await expect.poll(() => Boolean(release)).toBe(true);
    await search.fill("old");
    await search.fill("needle");
    await expect.poll(() => inputs.at(-1)?.query).toBe("needle");
    expect(inputs.at(-1)?.after).toBeUndefined();
    await expect(table.locator("tbody tr")).toHaveCount(1);
    await expect(table.locator("tbody tr")).toContainText("Fresh needle");
    release?.();
    await settled;
    await expect(table.locator("tbody tr")).toHaveCount(1);
    if (mode === "tasks") {
      await filter.click();
      await page
        .getByRole("combobox", { name: "Routine", exact: true })
        .click();
      await page
        .getByRole("option", { name: "Record acceptance", exact: true })
        .click();
      await expect
        .poll(() => inputs.at(-1)?.routineIds)
        .toEqual(["00000000-0000-4000-8000-000000000001"]);
      expect(inputs.at(-1)?.after).toBeUndefined();
      await page
        .getByRole("button", { name: "Reset filters", exact: true })
        .click();
      await expect.poll(() => inputs.at(-1)?.routineIds).toEqual([]);
      expect(inputs.at(-1)?.query).toBe("needle");
      expect(inputs.at(-1)?.sortBy).toBe("LAST_UPDATE");
      await page.keyboard.press("Escape");
    }
    for (const size of [
      { width: 1280, height: 720 },
      { width: 390, height: 844 },
      { width: 320, height: 280 },
    ]) {
      await page.setViewportSize(size);
      await expect(search).toBeInViewport();
      const searchBox = (await search.boundingBox())!;
      const filterBox = (await filter.boundingBox())!;
      expect(searchBox.x + searchBox.width).toBeLessThanOrEqual(filterBox.x);
      for (const trigger of [filter, sort]) {
        const label = (await trigger.getAttribute("aria-label"))!;
        await trigger.click();
        const panel = page.getByRole(trigger === filter ? "dialog" : "menu", {
          name: label,
          exact: true,
        });
        await expect(panel).toBeVisible();
        const bounds = (await panel.boundingBox())!;
        expect(bounds.height).toBeLessThanOrEqual(321);
        expect(bounds.x).toBeGreaterThanOrEqual(0);
        expect(bounds.x + bounds.width).toBeLessThanOrEqual(size.width);
        await page.keyboard.press("Escape");
        await expect(panel).toHaveCount(0);
      }
      await table.evaluate(element => {
        const viewport = element.closest(".custom-scrollbar")!;
        viewport.scrollTop = 0;
        viewport.scrollLeft = viewport.scrollWidth;
      });
      const edit = table.locator("tbody tr").first().getByRole("button").last();
      await expect(edit).toBeInViewport();
      const button = (await edit.boundingBox())!;
      const cell = (await table
        .locator("tbody tr")
        .first()
        .locator("td")
        .last()
        .boundingBox())!;
      expect(button.width).toBeGreaterThanOrEqual(
        mode === "routines" ? 27 : 23
      );
      expect(button.x).toBeGreaterThanOrEqual(cell.x);
      expect(button.x + button.width).toBeLessThanOrEqual(cell.x + cell.width);
      if (mode === "routines" && size.width === 390)
        await page.screenshot({
          path: "/tmp/notegic-routine-table-mobile.png",
        });
    }
    await table.locator("tbody tr").first().getByRole("button").last().click();
    await expect(page.locator("#routine-record-acceptance")).toHaveAttribute(
      "data-inspected-id",
      "00000000-0000-4000-8000-000000000004"
    );
    await page.evaluate(() => window.routineRecordsExample.unmount());
  });
}
