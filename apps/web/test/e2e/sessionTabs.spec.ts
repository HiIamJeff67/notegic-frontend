import { createHmac, randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";

const apiURL = process.env.E2E_ROUTINE_API_URL;
const database = process.env.E2E_ROUTINE_DATABASE;
const userAgent =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36";
test.use({ userAgent });
test.skip(
  process.env.E2E_RUN_ROUTINE_BACKEND !== "true" ||
    !apiURL ||
    new URL(apiURL).hostname !== "127.0.0.1" ||
    !database?.match(/^notegic_routine_acceptance_[a-z0-9_]+$/) ||
    process.env.E2E_PRODUCTION === "true",
  "Requires isolated live Core/Gateway and Vite source imports"
);

test("new tabs, session renewal and real graph conflicts preserve authentication and drafts", async ({
  page,
  context,
  request,
}) => {
  test.setTimeout(240_000);
  const name = `Tabs${randomUUID().replaceAll("-", "").slice(0, 12)}`;
  const password = "CsrfAcceptance123!";
  const registration = await request.post(
    `${apiURL}/api/development/v1/auth/register`,
    {
      headers: { Origin: "http://127.0.0.1:4173", "User-Agent": userAgent },
      data: { name, email: `${name}@example.invalid`, password },
    }
  );
  expect(registration.status()).toBe(200);
  const registered = await registration.json();
  expect(registered.success).toBe(true);
  const headers = {
    Origin: "http://127.0.0.1:4173",
    "User-Agent": userAgent,
    "X-CSRF-Token": registered.data.csrfToken,
  };
  const stationResponse = await request.post(
    `${apiURL}/api/development/v1/stations/`,
    {
      headers,
      data: { name, description: "Retained isolated tab-session fixture" },
    }
  );
  expect(stationResponse.ok()).toBe(true);
  const station = (await stationResponse.json()).data;
  const start = new Date(Date.now() + 3_600_000);
  start.setSeconds(0, 0);
  const routineResponse = await request.post(
    `${apiURL}/api/development/v1/routines/station/${station.id}`,
    {
      headers,
      data: {
        title: name,
        isActive: false,
        scheduledStartAt: start.toISOString(),
        scheduledEndAt: new Date(start.getTime() + 3_600_000).toISOString(),
        timezone: "UTC",
        timeoutSeconds: 300,
      },
    }
  );
  expect(routineResponse.ok()).toBe(true);
  const routine = (await routineResponse.json()).data;
  const taskResponse = await request.post(
    `${apiURL}/api/development/v1/routine-tasks/routine/${routine.id}`,
    {
      headers,
      data: {
        title: "Baseline action",
        kind: "Action",
        priority: 0,
        payload: {
          schemaVersion: 1,
          purpose: "GetRoutine",
          routineId: routine.id,
        },
        expectedDefinitionVersion: routine.definitionVersion,
      },
    }
  );
  expect(taskResponse.ok()).toBe(true);
  const task = (await taskResponse.json()).data;

  const authFailures: number[] = [];
  context.on("response", response => {
    if (response.status() === 401) authFailures.push(response.status());
  });
  await page.goto("/login");
  await page.locator("html[data-density]").waitFor();
  await page.getByLabel("Account").fill(name);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await expect(page).toHaveURL(/\/app\/dashboard\/?$/, { timeout: 60_000 });
  const graphPath = `/app/routines/${routine.id}/dependency-graph-editor`;
  await page.goto(graphPath);
  const nodeSelector = `.react-flow__node[data-id="${task.id}"]`;
  await expect(page.locator(nodeSelector)).toBeVisible({ timeout: 60_000 });
  const second = await context.newPage();
  await second.goto("/document");
  expect(
    await second.evaluate(
      () => sessionStorage.getItem("notegic_CSRFToken") === null
    )
  ).toBe(true);
  await second.goto(graphPath);
  await expect(second.locator(nodeSelector)).toBeVisible({ timeout: 60_000 });
  await expect(second).toHaveURL(new RegExp(routine.id));
  expect(authFailures).toEqual([]);

  const cookies = await context.cookies();
  for (const token of [undefined, "invalid-csrf-fixture"]) {
    const rejected = await request.get(
      `${apiURL}/api/development/v1/users/data`,
      {
        headers: {
          Origin: "http://127.0.0.1:4173",
          "User-Agent": userAgent,
          Cookie: cookies
            .filter(cookie =>
              ["accessToken", "refreshToken"].includes(cookie.name)
            )
            .map(cookie => `${cookie.name}=${cookie.value}`)
            .join("; "),
          ...(token ? { "X-CSRF-Token": token } : {}),
        },
      }
    );
    expect(rejected.status()).toBe(401);
    expect((await rejected.json()).exception.reason).toBe("InvalidCSRFToken");
  }
  expect(
    ["accessToken", "refreshToken"].every(name =>
      cookies.some(cookie => cookie.name === name && cookie.httpOnly)
    )
  ).toBe(true);
  expect(
    cookies.some(
      cookie =>
        cookie.name === "notegic_csrf" &&
        !cookie.httpOnly &&
        cookie.sameSite === "Strict"
    )
  ).toBe(true);
  const access = cookies.find(cookie => cookie.name === "accessToken")!;
  const accessSecret = process.env.E2E_ROUTINE_ACCESS_TOKEN_SECRET;
  if (!accessSecret?.startsWith("routine-refresh-fixture-"))
    throw new Error("Requires isolated fixture access signing key");
  const [header, payload, signature] = access.value.split(".");
  expect(
    createHmac("sha256", accessSecret)
      .update(`${header}.${payload}`)
      .digest("base64url") === signature
  ).toBe(true);
  const expired = Buffer.from(
    JSON.stringify({
      ...JSON.parse(Buffer.from(payload, "base64url").toString()),
      exp: Math.floor(Date.now() / 1000) - 60,
    })
  ).toString("base64url");
  await context.addCookies([
    {
      ...access,
      value: `${header}.${expired}.${createHmac("sha256", accessSecret).update(`${header}.${expired}`).digest("base64url")}`,
    },
  ]);
  const renewal = await page.evaluate(async () => {
    const path = "/src/api/clientHeaders.ts";
    const { getClientCSRFToken } = await import(/* @vite-ignore */ path);
    const token = getClientCSRFToken();
    const rpcPath = "/src/api/functions/user.serverFn.ts";
    const { GetUserData } = await import(/* @vite-ignore */ rpcPath);
    const response = await GetUserData({ data: { header: {}, body: {} } });
    return {
      success: response.success,
      changed: getClientCSRFToken() !== token,
    };
  });
  expect(renewal).toEqual({ success: true, changed: true });
  const secondRead = await second.evaluate(async () => {
    const rpcPath = "/src/api/functions/user.serverFn.ts";
    const { GetUserData } = await import(/* @vite-ignore */ rpcPath);
    return (await GetUserData({ data: { header: {}, body: {} } })).success;
  });
  expect(secondRead).toBe(true);
  expect(authFailures).toEqual([]);

  for (const [tab, title, priority] of [
    [page, "My retained draft", "2"],
    [second, "Remote committed action", "3"],
  ] as const) {
    await tab
      .locator(nodeSelector)
      .click({ button: "right", position: { x: 20, y: 20 } });
    await tab.getByRole("menuitem", { name: "Edit", exact: true }).click();
    await tab.locator("#routine-task-inspector-title").fill(title);
    await tab.locator("#routine-task-inspector-priority").fill(priority);
    await tab
      .getByRole("dialog")
      .getByRole("button", { name: "Save", exact: true })
      .click();
    await expect(
      tab.locator(nodeSelector).getByText(title, { exact: true })
    ).toBeVisible();
  }
  await second.getByRole("button", { name: "Save", exact: true }).click();
  await expect(
    second.getByRole("button", { name: "Save", exact: true })
  ).toBeDisabled();
  await expect(
    second.getByRole("button", { name: "Review latest changes", exact: true })
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Review latest changes", exact: true })
  ).toBeVisible();
  await expect(
    page.locator(nodeSelector).getByText("My retained draft", { exact: true })
  ).toBeVisible();
  await page.reload();
  await expect(
    page.locator(nodeSelector).getByText("My retained draft", { exact: true })
  ).toBeVisible({ timeout: 60_000 });
  await page
    .getByRole("button", { name: "Review latest changes", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByText('"My retained draft"', { exact: true })
  ).toBeVisible();
  await expect(
    dialog.getByText('"Remote committed action"', { exact: true })
  ).toBeVisible();
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(
    page.locator(nodeSelector).getByText("My retained draft", { exact: true })
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Review latest changes", exact: true })
    .click();
  await expect(
    dialog.getByRole("button", { name: "Keep mine", exact: true })
  ).toHaveCount(2);
  for (const button of await dialog
    .getByRole("button", { name: "Keep mine", exact: true })
    .all()) {
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
  }
  await expect(
    dialog.getByRole("button", { name: "Apply to draft", exact: true })
  ).toBeEnabled();
  await dialog
    .getByRole("button", { name: "Apply to draft", exact: true })
    .click();
  await expect(dialog).toHaveCount(0);
  const beforeExplicitSave = await page.evaluate(
    async ({ apiURL, id }) => {
      const path = "/src/api/clientHeaders.ts";
      const { getClientCSRFToken } = await import(/* @vite-ignore */ path);
      const response = await fetch(
        `${apiURL}/api/development/v1/routine-tasks/${id}`,
        {
          credentials: "include",
          headers: {
            "X-CSRF-Token": getClientCSRFToken()!,
            "User-Agent": navigator.userAgent,
          },
        }
      );
      return (await response.json()).data.title;
    },
    { apiURL: apiURL!, id: task.id }
  );
  expect(beforeExplicitSave).toBe("Remote committed action");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Save", exact: true })
  ).toBeDisabled();
  await page.reload();
  await expect(
    page.locator(nodeSelector).getByText("My retained draft", { exact: true })
  ).toBeVisible({ timeout: 60_000 });
  await expect(
    page.getByRole("button", { name: "Review latest changes", exact: true })
  ).toHaveCount(0);
  expect(authFailures).toEqual([]);
  await page.screenshot({ path: "/tmp/notegic-csrf-two-tab-graph.png" });
  await second.close();
});
