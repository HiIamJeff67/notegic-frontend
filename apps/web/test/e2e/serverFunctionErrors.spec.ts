import { createServer, type Server } from "node:http";
import { expect, test } from "@playwright/test";

let upstream: Server;
let writes = 0;
let loginReason = "WrongPassword";
const enabled = process.env.E2E_ROUTINE_API_URL === "http://127.0.0.1:38919";
test.skip(
  !enabled || process.env.E2E_PRODUCTION === "true",
  "Requires the isolated RPC fixture at http://127.0.0.1:38919 and Vite source modules"
);

test.beforeAll(async () => {
  upstream = createServer((request, response) => {
    if (request.method === "PUT" || request.method === "POST") writes++;
    request.resume();
    if (request.url?.endsWith("/auth/login")) {
      response.writeHead(
        loginReason === "MalformedResponse"
          ? 200
          : loginReason === "InternalServerError"
            ? 503
            : 401,
        {
          "Content-Type": "application/json",
        }
      );
      response.end(
        JSON.stringify(
          loginReason === "MalformedResponse"
            ? { success: true, data: {} }
            : {
                success: false,
                data: null,
                exception: {
                  reason: loginReason,
                  domain: "Auth",
                  operation: "Login",
                  message: "Fixture diagnostic must not be displayed",
                  retryable: false,
                },
              }
        )
      );
      return;
    }
    const quotaExceeded = request.method === "POST";
    const rescheduleRequired = request.url?.includes("/routines/");
    response.writeHead(quotaExceeded ? 403 : 409, {
      "Content-Type": "application/json",
    });
    response.end(
      JSON.stringify({
        success: false,
        data: null,
        exception: quotaExceeded
          ? {
              reason: "QuotaExceeded",
              domain: "UserQuota",
              operation: "EnforceLimit",
              message: "The current plan's quota has been reached",
              retryable: false,
            }
          : rescheduleRequired
            ? {
                reason: "RescheduleRequired",
                domain: "Routine",
                operation: "Activate",
                message:
                  "Choose a future schedule before activating this routine",
                retryable: false,
              }
            : {
                reason: "DefinitionConflict",
                domain: "Routine",
                operation: "UpdateDefinition",
                message:
                  "The routine was changed; refresh before applying this edit",
                retryable: false,
              },
      })
    );
  });
  await new Promise<void>((resolve, reject) => {
    upstream.once("error", reject);
    upstream.listen(38919, "127.0.0.1", resolve);
  });
});

test.afterAll(async () => {
  if (upstream)
    await new Promise<void>((resolve, reject) =>
      upstream.close(error => (error ? reject(error) : resolve()))
    );
});

for (const password of ["bad", "NotCorrect123!"]) {
  test(`login reports a wrong ${password === "bad" ? "short" : "strong"} password without retrying`, async ({
    page,
  }) => {
    loginReason = "WrongPassword";
    await page.goto("/login");
    await page.locator("html[data-density]").waitFor();
    writes = 0;
    let rpcs = 0;
    page.on("request", request => {
      if (request.method() === "POST" && request.url().includes("/_serverFn/"))
        rpcs++;
    });
    await page.locator("#input-0").fill("fixture@example.invalid");
    await page.locator("#input-1").fill(password);
    await page.locator('button[type="submit"]').click();
    await expect(
      page.getByText("The password is incorrect.", { exact: true })
    ).toBeVisible();
    await expect(page.locator("#input-1")).toHaveValue("");
    expect(writes).toBe(1);
    expect(rpcs).toBe(1);
    await expect(page).toHaveURL(/\/login$/);
  });
}

test("login does not automatically replay credentials after an upstream failure", async ({
  page,
}) => {
  loginReason = "InternalServerError";
  await page.goto("/login");
  await page.locator("html[data-density]").waitFor();
  writes = 0;
  await page.locator("#input-0").fill("fixture@example.invalid");
  await page.locator("#input-1").fill("NotCorrect123!");
  await page.locator('button[type="submit"]').click();
  await expect(
    page.getByText("Something went wrong on our side. Please try again.", {
      exact: true,
    })
  ).toBeVisible();
  await expect(page.locator("#input-1")).toHaveValue("");
  expect(writes).toBe(1);
  loginReason = "WrongPassword";
});

test("login validation and malformed responses have safe messages and no retry", async ({
  page,
}) => {
  await page.goto("/login");
  await page.locator("html[data-density]").waitFor();
  writes = 0;
  await page.locator("#input-0").fill("fixture@example.invalid");
  await page.locator("#input-1").fill("x".repeat(1025));
  await page.locator('button[type="submit"]').click();
  const message =
    "Some data has an invalid format. Please check and try again.";
  await expect(page.getByText(message, { exact: true })).toBeVisible();
  await expect(page.locator("#input-1")).toHaveValue("");
  expect(writes).toBe(0);
  loginReason = "MalformedResponse";
  await page.locator("#input-1").fill("NotCorrect123!");
  await page.locator('button[type="submit"]').click();
  await expect.poll(() => writes).toBe(1);
  await expect(page.locator("#input-1")).toHaveValue("");
  await expect(page.getByText(message, { exact: true }).first()).toBeVisible();
  expect(writes).toBe(1);
  loginReason = "WrongPassword";
});

test("real server-function conflicts retain their API type, translation and no-retry policy", async ({
  page,
}) => {
  test.skip(
    process.env.E2E_PRODUCTION === "true",
    "Imports development RPC modules"
  );
  await page.goto("/login");
  await page.locator("html[data-density]").waitFor();
  writes = 0;
  const result = await page.evaluate(async repositoryRoot => {
    const load = (path: string) => import(/* @vite-ignore */ path);
    const { mutationFnUpdateMyRoutineTaskById } = await load(
      "/src/api/invokers/routineTask.invoker.ts"
    );
    const { NotegicAPIError } = (await load(
      `/@fs${repositoryRoot}/shared/api/exceptions/index.ts`
    )) as typeof import("@shared/api/exceptions");
    const { createQueryClient } = await load(
      `/@fs${repositoryRoot}/shared/api/queryClient.ts`
    );
    const { tError } = await load(`/@fs${repositoryRoot}/shared/i18n/error.ts`);
    const { default: i18n } = await load("/src/i18n/index.ts");
    const client = createQueryClient();
    try {
      await client
        .getMutationCache()
        .build(client, {
          mutationFn: () =>
            mutationFnUpdateMyRoutineTaskById({
              body: {
                routineTaskId: "42345678-1234-4234-8234-123456789abc",
                values: { x: 120, y: 80 },
                expectedDefinitionVersion: 7,
              },
            }),
        })
        .execute(undefined);
      return { succeeded: true };
    } catch (error) {
      return {
        succeeded: false,
        typed: error instanceof NotegicAPIError,
        reason: error instanceof NotegicAPIError ? error.unWrap.reason : null,
        status: error instanceof NotegicAPIError ? error.unWrap.status : null,
        translated:
          tError(error, i18n.t) === i18n.t("server.error.DefinitionConflict"),
      };
    } finally {
      client.clear();
    }
  }, process.cwd());
  expect(result).toEqual({
    succeeded: false,
    typed: true,
    reason: "DefinitionConflict",
    status: 409,
    translated: true,
  });
  expect(writes).toBe(1);
});

test("real Routine activation rejection retains its translation without retrying", async ({
  page,
}) => {
  await page.goto("/login");
  await page.locator("html[data-density]").waitFor();
  writes = 0;
  const result = await page.evaluate(async repositoryRoot => {
    const load = (path: string) => import(/* @vite-ignore */ path);
    const { mutationFnUpdateMyRoutineById } = await load(
      "/src/api/invokers/routine.invoker.ts"
    );
    const { NotegicAPIError } = (await load(
      `/@fs${repositoryRoot}/shared/api/exceptions/index.ts`
    )) as typeof import("@shared/api/exceptions");
    const { createQueryClient } = await load(
      `/@fs${repositoryRoot}/shared/api/queryClient.ts`
    );
    const { tError } = await load(`/@fs${repositoryRoot}/shared/i18n/error.ts`);
    const { default: toast } = await load(
      `/@fs${repositoryRoot}/shared/lib/toast.ts`
    );
    const { default: i18n } = await load("/src/i18n/index.ts");
    await i18n.changeLanguage("zh-TW");
    const client = createQueryClient();
    try {
      await client
        .getMutationCache()
        .build(client, {
          mutationFn: () =>
            mutationFnUpdateMyRoutineById({
              body: {
                routineId: "12345678-1234-4234-8234-123456789abc",
                values: { isActive: true },
              },
            }),
        })
        .execute(undefined);
      return { succeeded: true };
    } catch (error) {
      const message = tError(error, i18n.t);
      toast.error(message);
      return {
        succeeded: false,
        typed: error instanceof NotegicAPIError,
        reason: error instanceof NotegicAPIError ? error.unWrap.reason : null,
        status: error instanceof NotegicAPIError ? error.unWrap.status : null,
        message,
      };
    } finally {
      client.clear();
    }
  }, process.cwd());
  expect(result).toEqual({
    succeeded: false,
    typed: true,
    reason: "RescheduleRequired",
    status: 409,
    message: "請先設定未來的排程時間，再啟用此流程。",
  });
  await expect(
    page.getByText("請先設定未來的排程時間，再啟用此流程。", { exact: true })
  ).toBeVisible();
  expect(writes).toBe(1);
});

for (const batch of [false, true]) {
  test(`real ${batch ? "batch" : "single"} block pack quota failures display a translated toast`, async ({
    page,
  }) => {
    await page.goto("/login");
    await page.locator("html[data-density]").waitFor();
    writes = 0;
    const result = await page.evaluate(
      async ({ repositoryRoot, batch }) => {
        const load = (path: string) => import(/* @vite-ignore */ path);
        const { mutationFnCreateBlockPack, mutationFnCreateBlockPacks } =
          await load("/src/api/invokers/blockPack.invoker.ts");
        const { NotegicAPIError } = (await load(
          `/@fs${repositoryRoot}/shared/api/exceptions/index.ts`
        )) as typeof import("@shared/api/exceptions");
        const { createQueryClient } = await load(
          `/@fs${repositoryRoot}/shared/api/queryClient.ts`
        );
        const { tError } = await load(
          `/@fs${repositoryRoot}/shared/i18n/error.ts`
        );
        const { default: toast } = await load(
          `/@fs${repositoryRoot}/shared/lib/toast.ts`
        );
        const { default: i18n } = await load("/src/i18n/index.ts");
        await i18n.changeLanguage("zh-TW");
        toast.dismiss();
        const client = createQueryClient();
        const rootShelfId = "32345678-1234-4234-8234-123456789abc";
        const parentSubShelfId = "42345678-1234-4234-8234-123456789abc";
        const blockPack = {
          parentSubShelfId,
          name: "Quota fixture",
          icon: null,
          headerBackgroundURL: null,
        };
        let authenticationFailures = 0;
        const onAuthenticationFailure = () => authenticationFailures++;
        window.addEventListener(
          "notegic:auth-required",
          onAuthenticationFailure
        );
        try {
          await client
            .getMutationCache()
            .build(client, {
              mutationFn: () =>
                batch
                  ? mutationFnCreateBlockPacks({
                      body: { createdBlockPacks: [blockPack] },
                      affected: {
                        rootShelfIds: [rootShelfId],
                        parentSubShelfIds: [parentSubShelfId],
                      },
                    })
                  : mutationFnCreateBlockPack({
                      body: blockPack,
                      affected: { rootShelfId, parentSubShelfId },
                    }),
            })
            .execute(undefined);
          return { succeeded: true };
        } catch (error) {
          const message = tError(error, i18n.t);
          toast.error(message);
          return {
            succeeded: false,
            typed: error instanceof NotegicAPIError,
            reason:
              error instanceof NotegicAPIError ? error.unWrap.reason : null,
            status:
              error instanceof NotegicAPIError ? error.unWrap.status : null,
            message,
            authenticationFailures,
          };
        } finally {
          window.removeEventListener(
            "notegic:auth-required",
            onAuthenticationFailure
          );
          client.clear();
        }
      },
      { repositoryRoot: process.cwd(), batch }
    );
    expect(result).toEqual({
      succeeded: false,
      typed: true,
      reason: "QuotaExceeded",
      status: 403,
      message: "已達到目前方案的使用額度。",
      authenticationFailures: 0,
    });
    await expect(
      page.getByText("已達到目前方案的使用額度。", { exact: true })
    ).toBeVisible();
    expect(writes).toBe(1);
  });
}
