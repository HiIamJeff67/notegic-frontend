import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";

declare global {
  interface Window {
    pageAuthenticationFailures: number;
  }
}

test("local authenticated pages retain the session without CSRF failures", async ({
  page,
  request,
}) => {
  const apiURL = process.env.E2E_ROUTINE_API_URL;
  const database = process.env.E2E_ROUTINE_DATABASE;
  test.skip(
    process.env.E2E_RUN_PAGE_BACKEND !== "true" ||
      !apiURL ||
      new URL(apiURL).hostname !== "127.0.0.1" ||
      !database?.match(/^notegic_routine_acceptance_[a-z0-9_]+$/),
    "requires isolated local Core, ClientGateway and acceptance database"
  );
  test.skip(
    process.env.E2E_PRODUCTION === "true",
    "Fixture creation imports Vite source modules"
  );
  test.setTimeout(240_000);
  page.setDefaultNavigationTimeout(60_000);
  await page.addInitScript(() => {
    window.pageAuthenticationFailures = 0;
    window.addEventListener(
      "notegic:auth-required",
      () => window.pageAuthenticationFailures++
    );
  });
  const suffix = randomUUID().replaceAll("-", "").slice(0, 12);
  const name = `Pages${suffix}`;
  const registration = await request.post(
    `${apiURL}/api/development/v1/auth/register`,
    {
      headers: {
        Origin: "http://127.0.0.1:4173",
        "User-Agent": "LocalPageAcceptance/1.0",
      },
      data: {
        name,
        email: `${name}@example.invalid`,
        password: "PageAcceptance123!",
      },
    }
  );
  expect(registration.ok()).toBe(true);
  await page.goto("/login");
  await page.locator("html[data-density]").waitFor();
  await page.getByLabel("Account").fill(name);
  await page.getByLabel("Password").fill("PageAcceptance123!");
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await expect(page).toHaveURL(/\/app\/dashboard\/?$/, { timeout: 30_000 });
  await expect(
    page.getByRole("menuitem").filter({ hasText: name })
  ).toBeVisible({ timeout: 30_000 });
  await page.waitForLoadState("networkidle");

  const fixture = await page.evaluate(async suffix => {
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
          name: `Page fixture ${suffix}`,
          description: "Retained isolated page acceptance",
        },
      },
    });
    const routine = await CreateRoutineByStationId({
      data: {
        header: getClientRequestHeaders(),
        body: {
          stationId: station.data.id,
          title: "Inactive page acceptance",
          description: "Never scheduled",
          isActive: false,
          timezone: "UTC",
        },
      },
    });
    await CreateRoutineTaskByRoutineId({
      data: {
        header: getClientRequestHeaders(),
        body: {
          routineId: routine.data.id,
          expectedDefinitionVersion: 1,
          kind: "Start",
          title: "Page acceptance entry",
          x: 0,
          y: 0,
          payload: { schemaVersion: 1, isActive: true, description: "" },
        },
      },
    });
    localStorage.setItem(
      "notegic_routine_overview_charts",
      JSON.stringify([
        "overall:totalCount",
        "routine:statusCount",
        "routineTask:purposeCount",
      ])
    );
    return { stationId: station.data.id, routineId: routine.data.id };
  }, suffix);

  const failures: Array<{ status: number; reason: string }> = [];
  page.on("response", response => {
    const url = new URL(response.url());
    if (
      !url.pathname.startsWith("/_serverFn/") &&
      !url.pathname.includes("/graphql")
    )
      return;
    if (response.status() === 401 || response.status() >= 500) {
      failures.push({
        status: response.status(),
        reason: "HTTPFailure",
      });
    }
  });
  for (const path of [
    "/app/dashboard",
    "/app/routines",
    `/app/routines/${fixture.stationId}`,
    `/app/routines/${fixture.routineId}/dependency-graph-editor`,
    "/app/setting/account",
    "/app/setting/preferences",
    "/app/trash",
    "/app/material-viewer",
    "/app/block-pack-editor",
  ]) {
    await test.step(
      path
        .replace(fixture.stationId, ":stationId")
        .replace(fixture.routineId, ":routineId"),
      async () => {
        const response = await page.goto(path);
        expect(response?.status()).toBe(200);
        await page.waitForLoadState("networkidle");
        await expect(
          page.getByRole("menuitem").filter({ hasText: name })
        ).toBeVisible({ timeout: 30_000 });
        expect(new URL(page.url()).pathname.replace(/\/$/, "")).toBe(path);
        await expect(
          page.getByText("Your session ended. Log in again.", { exact: true })
        ).toHaveCount(0);
        await expect(
          page.getByText(
            "Something went wrong on our side. Please try again.",
            { exact: true }
          )
        ).toHaveCount(0);
        expect(failures).toEqual([]);
        expect(
          await page.evaluate(() => window.pageAuthenticationFailures)
        ).toBe(0);
      }
    );
  }
});
