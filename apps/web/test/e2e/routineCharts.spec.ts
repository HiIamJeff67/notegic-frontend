import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";
import { fromJSON } from "seroval";
import type { mountRoutineChartsExample } from "./routineChartsTestSupport";

declare global {
  interface Window {
    routineChartsExample: ReturnType<typeof mountRoutineChartsExample>;
    chartAuthenticationFailures: number;
  }
}

test("Overview charts and all eleven statistics queries use fresh session headers", async ({
  page,
}) => {
  test.skip(process.env.E2E_PRODUCTION === "true", "Uses Vite source imports");
  await page.goto("/document");
  await page.waitForLoadState("networkidle");
  const requests: Array<{
    token?: string;
    transportToken?: string;
    userAgent?: string;
    path: string;
  }> = [];
  await page.route("**/_serverFn/**", async route => {
    const url = new URL(route.request().url());
    const payload = fromJSON(JSON.parse(url.searchParams.get("payload")!)) as {
      data: { header?: { csrfToken?: string; userAgent?: string } };
    };
    requests.push({
      token: payload.data.header?.csrfToken,
      transportToken: route.request().headers()["x-csrf-token"],
      userAgent: payload.data.header?.userAgent,
      path: url.pathname,
    });
    await route.fulfill({
      contentType: "application/json",
      headers:
        requests.length === 1
          ? { "X-CSRF-Token": "renewed-fixture-token" }
          : {},
      body: JSON.stringify({
        result: {
          success: true,
          data: { data: [] },
          exception: null,
        },
      }),
    });
  });
  await page.evaluate(async () => {
    const headersPath = "/src/api/clientHeaders.ts";
    const { setClientCSRFToken } = await import(/* @vite-ignore */ headersPath);
    setClientCSRFToken("initial-fixture-token");
    window.chartAuthenticationFailures = 0;
    window.addEventListener(
      "notegic:auth-required",
      () => window.chartAuthenticationFailures++
    );
    const path = "/test/e2e/routineChartsTestSupport.tsx";
    const { mountRoutineChartsExample } = await import(/* @vite-ignore */ path);
    window.routineChartsExample = mountRoutineChartsExample();
  });
  await expect(page.locator("[data-record-query-status]")).toHaveAttribute(
    "data-record-query-status",
    "true"
  );
  await expect.poll(() => requests.length).toBe(11);
  expect(new Set(requests.map(request => request.path)).size).toBe(11);
  expect(
    requests.every(
      request => request.token && request.transportToken && request.userAgent
    )
  ).toBe(true);
  await expect
    .poll(() =>
      page.evaluate(async () => {
        const path = "/src/api/clientHeaders.ts";
        const { getClientCSRFToken } = await import(/* @vite-ignore */ path);
        return getClientCSRFToken();
      })
    )
    .toBe("renewed-fixture-token");
  await page.evaluate(() => window.routineChartsExample.refetch());
  expect(requests.slice(11)).toHaveLength(11);
  expect(
    requests
      .slice(11)
      .every(
        request =>
          request.token === "renewed-fixture-token" &&
          request.transportToken === "renewed-fixture-token"
      )
  ).toBe(true);
  await page.evaluate(async () => {
    const path = "/src/api/clientHeaders.ts";
    const { setClientCSRFToken } = await import(/* @vite-ignore */ path);
    setClientCSRFToken("latest-fixture-token");
    return window.routineChartsExample.fetchTotal();
  });
  expect(requests).toHaveLength(23);
  expect(requests.at(-1)?.token).toBe("latest-fixture-token");
  expect(requests.at(-1)?.transportToken).toBe("latest-fixture-token");
  expect(await page.evaluate(() => window.chartAuthenticationFailures)).toBe(0);
  await page.evaluate(() => window.routineChartsExample.unmount());
});

test("real backend keeps Overview authenticated and validates all statistics requests", async ({
  page,
  request,
}) => {
  const apiURL = process.env.E2E_ROUTINE_API_URL;
  const database = process.env.E2E_ROUTINE_DATABASE;
  test.skip(
    process.env.E2E_RUN_VISUALIZE_BACKEND !== "true" ||
      !apiURL ||
      new URL(apiURL).hostname !== "127.0.0.1" ||
      !database?.match(/^notegic_routine_acceptance_[a-z0-9_]+$/),
    "requires isolated local Core, ClientGateway and acceptance database"
  );
  test.skip(process.env.E2E_PRODUCTION === "true", "Uses Vite source imports");
  test.setTimeout(180_000);
  const userAgent = "RoutineChartAcceptance/1.0";
  const name = `Charts${randomUUID().replaceAll("-", "").slice(0, 12)}`;
  const registration = await request.post(
    `${apiURL}/api/development/v1/auth/register`,
    {
      headers: { Origin: "http://127.0.0.1:4173", "User-Agent": userAgent },
      data: {
        name,
        email: `${name}@example.invalid`,
        password: "RoutineAcceptance123!",
      },
    }
  );
  expect(registration.ok()).toBe(true);
  await page.goto("/login");
  await page.locator("html[data-density]").waitFor();
  await page.getByLabel("Account").fill(name);
  await page.getByLabel("Password").fill("RoutineAcceptance123!");
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await expect(page).toHaveURL(/\/app\/dashboard\/?$/, { timeout: 30_000 });
  await expect(
    page.getByRole("menuitem").filter({ hasText: name })
  ).toBeVisible({ timeout: 30_000 });
  await page.evaluate(() => {
    localStorage.setItem(
      "notegic_routine_overview_charts",
      JSON.stringify(["overall:totalCount", "routine:statusCount"])
    );
  });
  await page.waitForLoadState("networkidle");
  await page
    .getByRole("button", { name: "Routines", exact: true })
    .first()
    .click();
  await expect(
    page.getByText("Your session ended. Log in again.", { exact: true })
  ).toHaveCount(0);
  await page.waitForLoadState("networkidle");
  await expect(page).toHaveURL(/\/app\/routines\/?$/);
  await expect(
    page.getByRole("heading", { name: "Charts", exact: true })
  ).toBeVisible();
  await page.evaluate(async () => {
    window.chartAuthenticationFailures = 0;
    window.addEventListener(
      "notegic:auth-required",
      () => window.chartAuthenticationFailures++
    );
    const path = "/test/e2e/routineChartsTestSupport.tsx";
    const { mountRoutineChartsExample } = await import(/* @vite-ignore */ path);
    window.routineChartsExample = mountRoutineChartsExample();
  });
  await expect(page.locator("[data-record-query-status]")).toHaveAttribute(
    "data-record-query-status",
    "true",
    { timeout: 30_000 }
  );
  await page.evaluate(() => window.routineChartsExample.refetch());
  expect(
    await page.evaluate(() => window.routineChartsExample.queryStates())
  ).toEqual(Array(11).fill("success"));
  const browserUserAgent = await page.evaluate(() => navigator.userAgent);
  const login = await page.request.post(
    `${apiURL}/api/development/v1/auth/login`,
    {
      headers: {
        Origin: "http://127.0.0.1:4173",
        "User-Agent": browserUserAgent,
      },
      data: { account: name, password: "RoutineAcceptance123!" },
    }
  );
  expect(login.status()).toBe(200);
  const refreshed = await login.json();
  expect(typeof refreshed.data.csrfToken).toBe("string");
  await page.evaluate(async token => {
    const path = "/src/api/clientHeaders.ts";
    const { getClientCSRFToken, setClientCSRFToken } = await import(
      /* @vite-ignore */ path
    );
    const previous = getClientCSRFToken();
    if (previous === token)
      throw new Error("Login did not rotate the fixture session token");
    setClientCSRFToken(token);
    return window.routineChartsExample.refetch();
  }, refreshed.data.csrfToken);
  expect(
    await page.evaluate(() => window.routineChartsExample.queryStates())
  ).toEqual(Array(11).fill("success"));
  await page.evaluate(() => window.routineChartsExample.fetchTotal());
  const paths = await page.evaluate(() => window.routineChartsExample.paths);
  expect(paths).toHaveLength(11);
  for (const path of paths) {
    for (const token of [undefined, "incorrect-fixture-token"]) {
      const response = await page.request.get(
        `${apiURL}/api/development/v1/${path}`,
        {
          params: {
            permission: "Owner",
            timeHourUnit: "24",
            queryRangeStartedAt: "2026-10-20T00:00:00Z",
            queryRangeEndedAt: "2026-10-21T00:00:00Z",
          },
          headers: {
            Origin: "http://127.0.0.1:4173",
            "User-Agent": browserUserAgent,
            ...(token ? { "X-CSRF-Token": token } : {}),
          },
        }
      );
      expect(response.status(), path).toBe(401);
      expect((await response.json()).exception.reason, path).toBe(
        "InvalidCSRFToken"
      );
    }
  }
  await page.evaluate(() => window.routineChartsExample.refetch());
  expect(await page.evaluate(() => window.chartAuthenticationFailures)).toBe(0);
  await expect(page).toHaveURL(/\/app\/routines\/?$/);
  await page.evaluate(() => window.routineChartsExample.unmount());
});
