import { randomUUID } from "node:crypto";
import { expect, type Response, test } from "@playwright/test";
import { toJSON } from "seroval";

const userAgent =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36";
test.use({ userAgent });

test("server functions enforce same-origin metadata without blocking public pages", async ({
  page,
  baseURL,
}) => {
  await page.goto("/");
  await page.locator("html[data-density]").waitFor();
  const rpcRequest = page.waitForRequest(
    request =>
      request.method() === "GET" &&
      new URL(request.url()).pathname.startsWith("/_serverFn/")
  );
  await page.getByRole("button", { name: "Get Started" }).click();
  const rpcURL = (await rpcRequest).url();
  await expect(page).toHaveURL(/\/login$/);
  const origin = new URL(baseURL!).origin;
  const siblingOrigin = new URL(origin);
  siblingOrigin.port = String(Number(siblingOrigin.port) + 1);

  const cases: Array<{
    name: string;
    headers: Record<string, string>;
    status: number;
  }> = [
    {
      name: "same-origin browser request",
      headers: { "Sec-Fetch-Site": "same-origin", Origin: origin },
      status: 200,
    },
    {
      name: "cross-site browser request",
      headers: {
        "Sec-Fetch-Site": "cross-site",
        Origin: "https://untrusted.invalid",
      },
      status: 403,
    },
    {
      name: "same-site different origin",
      headers: {
        "Sec-Fetch-Site": "same-site",
        Origin: siblingOrigin.origin,
      },
      status: 403,
    },
    {
      name: "matching Origin fallback",
      headers: { Origin: origin },
      status: 200,
    },
    {
      name: "different-origin fallback",
      headers: { Origin: siblingOrigin.origin },
      status: 403,
    },
    {
      name: "opaque Origin",
      headers: { Origin: "null" },
      status: 403,
    },
    {
      name: "matching Referer fallback",
      headers: { Referer: `${origin}/login` },
      status: 200,
    },
    {
      name: "foreign Referer",
      headers: { Referer: "https://untrusted.invalid/login" },
      status: 403,
    },
    {
      name: "missing all origin metadata",
      headers: {},
      status: 403,
    },
  ];

  for (const { name, headers, status } of cases) {
    await test.step(name, async () => {
      const response = await page.request.get(rpcURL, {
        headers: { "x-tsr-serverFn": "true", ...headers },
      });
      expect(response.status()).toBe(status);
      if (status === 403) {
        expect(await response.text()).toBe("Forbidden");
        expect(response.headers()["set-cookie"]).toBeUndefined();
      }
    });
  }

  for (const isServerFn of [true, false]) {
    await test.step(`client payload cannot inject a response (${isServerFn})`, async () => {
      const headers = {
        Origin: origin,
        "Sec-Fetch-Site": "same-origin",
        ...(isServerFn ? { "x-tsr-serverFn": "true" } : {}),
      };
      const baseline = await page.request.get(rpcURL, { headers });
      const marker = "untrusted-server-function-result";
      const injectedResponse = {
        status: 200,
        headers: { "content-type": "text/html", "x-injected-result": marker },
        body: `<script>${marker}</script>`,
      };
      const injectedURL = new URL(rpcURL);
      injectedURL.searchParams.set(
        "payload",
        JSON.stringify(
          toJSON({ result: injectedResponse, error: injectedResponse })
        )
      );
      const response = await page.request.get(injectedURL.toString(), {
        headers,
      });
      expect(response.status()).toBe(baseline.status());
      expect(response.headers()["content-type"]).toBe(
        baseline.headers()["content-type"]
      );
      if (isServerFn) {
        expect(response.status()).toBe(200);
        expect(response.headers()["content-type"]).toContain(
          "application/json"
        );
      }
      expect(response.headers()["x-injected-result"]).toBeUndefined();
      expect(await response.text()).not.toContain(marker);
    });
  }

  const publicPage = await page.request.get("/login");
  expect(publicPage.status()).toBe(200);
});

test("real login and protected writes retain both origin and backend token checks", async ({
  page,
  request,
  baseURL,
}) => {
  const apiURL = process.env.E2E_ROUTINE_API_URL;
  const apiKeyURL = process.env.E2E_CSRF_API_KEY_URL;
  const database = process.env.E2E_ROUTINE_DATABASE;
  test.skip(
    process.env.E2E_RUN_CSRF_BACKEND !== "true" ||
      !apiURL ||
      new URL(apiURL).hostname !== "127.0.0.1" ||
      !apiKeyURL ||
      new URL(apiKeyURL).hostname !== "127.0.0.1" ||
      !database?.match(/^notegic_routine_acceptance_[a-z0-9_]+$/),
    "requires isolated ClientGateway, APIGateway and acceptance database"
  );
  test.skip(
    process.env.E2E_PRODUCTION === "true",
    "Protected write cases import development source; login uses the real UI."
  );
  test.setTimeout(120_000);
  const origin = new URL(baseURL!).origin;
  const suffix = randomUUID().replaceAll("-", "").slice(0, 12);
  const name = `Csrf${suffix}`;
  const password = "CsrfAcceptance123!";
  const registration = await request.post(
    `${apiURL}/api/development/v1/auth/register`,
    {
      headers: { Origin: origin, "User-Agent": userAgent },
      data: { name, email: `${name}@example.invalid`, password },
    }
  );
  expect(registration.ok()).toBe(true);
  expect((await registration.json()).success).toBe(true);

  await page.goto("/login");
  await page.locator("html[data-density]").waitFor();
  await page.getByLabel("Account").fill(name);
  await page.getByLabel("Password").fill(password);
  const loginRequest = page.waitForRequest(
    incoming =>
      incoming.method() === "POST" &&
      new URL(incoming.url()).pathname.startsWith("/_serverFn/")
  );
  await page.getByRole("button", { name: "Login", exact: true }).click();
  const login = await loginRequest;
  expect((await login.response())?.status()).toBe(200);
  await expect(page).toHaveURL(/\/app\/dashboard\/?$/, { timeout: 30_000 });
  const cookies = await page.context().cookies();
  expect(
    ["accessToken", "refreshToken"].every(cookieName =>
      cookies.some(cookie => cookie.name === cookieName && cookie.httpOnly)
    )
  ).toBe(true);

  const blockedHeaders: Array<Record<string, string>> = [
    { "Sec-Fetch-Site": "cross-site", Origin: "https://untrusted.invalid" },
    { "Sec-Fetch-Site": "same-site", Origin: "http://127.0.0.1:4174" },
    {},
  ];
  for (const headers of blockedHeaders) {
    const blocked = await page.request.post(login.url(), {
      headers: {
        "Content-Type": "application/json",
        "x-tsr-serverFn": "true",
        ...headers,
      },
      data: login.postData()!,
    });
    expect(blocked.status()).toBe(403);
    expect(await blocked.text()).toBe("Forbidden");
    expect(blocked.headers()["set-cookie"]).toBeUndefined();
  }

  const station = await page.evaluate(async suffix => {
    const load = (path: string) => import(/* @vite-ignore */ path);
    const { CreateStation } = await load(
      "/src/api/functions/station.serverFn.ts"
    );
    const { getClientMutationHeaders } = await load(
      "/src/api/clientHeaders.ts"
    );
    const header = getClientMutationHeaders();
    const response = await CreateStation({
      data: {
        header,
        body: {
          name: `CSRF ${suffix}`,
          description: "Retained isolated CSRF fixture",
        },
      },
    });
    return { id: response.data.id, url: CreateStation.url, header };
  }, suffix);
  const stationId: string = station.id;
  expect(stationId).toMatch(/^[a-f0-9-]{36}$/);

  const graph = await page.evaluate(
    async ({ stationId, suffix }) => {
      const load = (path: string) => import(/* @vite-ignore */ path);
      const { CreateRoutineByStationId } = await load(
        "/src/api/functions/routine.serverFn.ts"
      );
      const { CreateRoutineTaskByRoutineId } = await load(
        "/src/api/functions/routineTask.serverFn.ts"
      );
      const { getClientMutationHeaders } = await load(
        "/src/api/clientHeaders.ts"
      );
      const scheduledStartAt = new Date(Date.now() + 3_600_000);
      scheduledStartAt.setSeconds(0, 0);
      const routine = await CreateRoutineByStationId({
        data: {
          header: getClientMutationHeaders(),
          body: {
            stationId,
            title: `CSRF graph ${suffix}`,
            description: "Retained inactive graph fixture",
            isActive: false,
            timeoutSeconds: 60,
            timezone: "UTC",
            scheduledStartAt: scheduledStartAt.toISOString(),
            scheduledEndAt: new Date(
              scheduledStartAt.getTime() + 3_600_000
            ).toISOString(),
          },
        },
      });
      const start = await CreateRoutineTaskByRoutineId({
        data: {
          header: getClientMutationHeaders(),
          body: {
            routineId: routine.data.id,
            kind: "Start",
            title: "CSRF entry",
            x: 0,
            y: 0,
            payload: { schemaVersion: 1, isActive: true, description: "" },
            expectedDefinitionVersion: 1,
          },
        },
      });
      const action = await CreateRoutineTaskByRoutineId({
        data: {
          header: getClientMutationHeaders(),
          body: {
            routineId: routine.data.id,
            kind: "Action",
            title: "CSRF action",
            x: 300,
            y: 0,
            payload: {
              schemaVersion: 1,
              purpose: "GetRoutine",
              routineId: routine.data.id,
            },
            expectedDefinitionVersion: 2,
          },
        },
      });
      return {
        routineId: routine.data.id,
        startId: start.data.id,
        actionId: action.data.id,
      };
    },
    { stationId, suffix }
  );
  const authenticationFailures: string[] = [];
  const recordAuthenticationFailure = async (response: Response) => {
    if (
      !new URL(response.url()).pathname.startsWith("/_serverFn/") ||
      response.status() < 400
    )
      return;
    const body = await response.text();
    const reason = body.match(
      /InvalidCSRFToken|InvalidSession|Unauthorized|SessionUnavailable/
    );
    if (reason) authenticationFailures.push(reason[0]);
  };
  page.on("response", recordAuthenticationFailure);
  const graphPath = `/app/routines/${graph.routineId}/dependency-graph-editor`;
  await page.goto(graphPath);
  for (const reload of [false, true]) {
    if (reload) await page.reload();
    await expect(
      page.locator(`.react-flow__node[data-id="${graph.startId}"]`)
    ).toBeVisible({ timeout: 30_000 });
    await expect(
      page.locator(`.react-flow__node[data-id="${graph.actionId}"]`)
    ).toBeVisible({ timeout: 30_000 });
    await expect(
      page.getByRole("button", { name: "Create", exact: true })
    ).toBeEnabled();
    await expect(page).toHaveURL(
      new RegExp(`${graph.routineId}/dependency-graph-editor$`)
    );
    await expect(
      page.getByText("Your session ended. Log in again.", { exact: true })
    ).toHaveCount(0);
  }
  expect(authenticationFailures).toEqual([]);
  page.off("response", recordAuthenticationFailure);

  const invalidBody = { name: "", description: "Rejected invalid DTO" };
  const rejectedDTO = await page.request.post(
    `${apiURL}/api/development/v1/stations/`,
    {
      headers: {
        Origin: origin,
        "User-Agent": userAgent,
        "X-CSRF-Token": station.header.csrfToken,
      },
      data: invalidBody,
    }
  );
  expect(rejectedDTO.status()).toBe(400);
  const dtoException = (await rejectedDTO.json()).exception;
  expect(dtoException.status).toBeUndefined();
  const dtoError = await page.evaluate(async body => {
    const load = (path: string) => import(/* @vite-ignore */ path);
    const { CreateStation } = await load(
      "/src/api/functions/station.serverFn.ts"
    );
    const { getClientMutationHeaders } = await load(
      "/src/api/clientHeaders.ts"
    );
    try {
      await CreateStation({
        data: { header: getClientMutationHeaders(), body },
      });
      throw new Error("Expected the invalid DTO to be rejected");
    } catch (error) {
      const exception = (
        error as { unWrap?: { status: number; code: number; reason: string } }
      ).unWrap;
      if (!exception) throw error;
      return {
        status: exception.status,
        code: exception.code,
        reason: exception.reason,
      };
    }
  }, invalidBody);
  expect(dtoError).toEqual({
    status: 400,
    code: 400,
    reason: dtoException.reason,
  });

  for (const token of ["missing", "invalid"] as const) {
    const header = { ...station.header };
    if (token === "missing") delete header.csrfToken;
    else header.csrfToken = "invalid-csrf-fixture";
    const body = {
      name: `Rejected ${suffix}`,
      description: "This fixture must never be created",
    };
    // Send real RPC bytes without deserializing an auth error in the browser,
    // where the application's intentional session-expiry handler would log out.
    const rejectedRPC = await page.request.post(station.url, {
      headers: {
        Origin: origin,
        "Content-Type": "application/json",
        "x-tsr-serverFn": "true",
      },
      data: toJSON({ data: { header, body } }),
    });
    expect(await rejectedRPC.text()).toContain("InvalidCSRFToken");
    // Public exceptions omit HTTP status; assert the status at the Gateway.
    const rejected = await page.request.post(
      `${apiURL}/api/development/v1/stations/`,
      {
        headers: {
          Origin: origin,
          "User-Agent": userAgent,
          ...(header.csrfToken ? { "X-CSRF-Token": header.csrfToken } : {}),
        },
        data: body,
      }
    );
    expect(rejected.status()).toBe(401);
    expect((await rejected.json()).exception.reason).toBe("InvalidCSRFToken");
  }

  const secret: string = await page.evaluate(async suffix => {
    const load = (path: string) => import(/* @vite-ignore */ path);
    const { CreateMyAPIKey } = await load(
      "/src/api/functions/apiKey.serverFn.ts"
    );
    const { getClientMutationHeaders } = await load(
      "/src/api/clientHeaders.ts"
    );
    const response = await CreateMyAPIKey({
      data: {
        header: getClientMutationHeaders(),
        body: { name: `CSRF ${suffix}` },
      },
    });
    return response.data.secret;
  }, suffix);
  expect(typeof secret).toBe("string");
  const wrongKey = `${secret.slice(0, -1)}${secret.endsWith("a") ? "b" : "a"}`;
  for (const { key, status } of [
    { key: secret, status: 200 },
    { key: undefined, status: 401 },
    { key: wrongKey, status: 401 },
  ]) {
    const response = await request.get(
      `${apiKeyURL}/api/development/v1/stations/${stationId}`,
      { headers: key ? { "X-API-Key": key } : {} }
    );
    expect(response.status()).toBe(status);
    if (status === 200) {
      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.data.id).toBe(stationId);
    }
  }

  // Run the browser-deserialized auth failure last: it intentionally signals session expiry.
  const authError = await page.evaluate(async suffix => {
    const load = (path: string) => import(/* @vite-ignore */ path);
    const { CreateStation } = await load(
      "/src/api/functions/station.serverFn.ts"
    );
    const { getClientMutationHeaders } = await load(
      "/src/api/clientHeaders.ts"
    );
    let authRequired = false;
    const onAuthRequired = () => {
      authRequired = true;
    };
    window.addEventListener("notegic:auth-required", onAuthRequired);
    try {
      await CreateStation({
        data: {
          header: {
            ...getClientMutationHeaders(),
            csrfToken: "invalid-csrf-fixture",
          },
          body: {
            name: `Rejected browser ${suffix}`,
            description: "Must never be created",
          },
        },
      });
      throw new Error("Expected invalid CSRF to be rejected");
    } catch (error) {
      const exception = (
        error as { unWrap?: { status: number; code: number; reason: string } }
      ).unWrap;
      if (!exception) throw error;
      return {
        status: exception.status,
        code: exception.code,
        reason: exception.reason,
        authRequired,
      };
    } finally {
      window.removeEventListener("notegic:auth-required", onAuthRequired);
    }
  }, suffix);
  expect(authError).toEqual({
    status: 401,
    code: 401,
    reason: "InvalidCSRFToken",
    authRequired: true,
  });
  await expect(page).toHaveURL(/\/login$/, { timeout: 30_000 });
  await expect(
    page.getByText("Your session ended. Log in again.", { exact: true })
  ).toHaveCount(1);
});
