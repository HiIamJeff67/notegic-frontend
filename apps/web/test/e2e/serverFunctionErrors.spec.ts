import { createServer, type Server } from "node:http";
import { expect, test } from "@playwright/test";
import { resources, supportedLanguages } from "@shared/i18n";

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

for (const password of ["Badpass1!", "NotCorrect123!"]) {
  test(`login reports a wrong correctly formatted password (${password.length} characters) without retrying`, async ({
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
  const message = "Password must be no more than 1024 characters.";
  await expect(page.getByText(message, { exact: true })).toBeVisible();
  await expect(page.locator("#input-1")).toHaveValue("");
  expect(writes).toBe(0);
  loginReason = "MalformedResponse";
  await page.locator("#input-1").fill("NotCorrect123!");
  await page.locator('button[type="submit"]').click();
  await expect.poll(() => writes).toBe(1);
  await expect(page.locator("#input-1")).toHaveValue("");
  await expect(
    page.getByText("Unable to complete this action. Please try again later.", {
      exact: true,
    })
  ).toBeVisible();
  expect(writes).toBe(1);
  loginReason = "WrongPassword";
});

for (const language of supportedLanguages) {
  test(`password recovery validation is presented in ${language} without an API call`, async ({
    page,
  }) => {
    await page.goto("/forgetPassword");
    await page.locator("html[data-density]").waitFor();
    await page.evaluate(async language => {
      const path = "/src/i18n/index.ts";
      const { default: i18n } = await import(/* @vite-ignore */ path);
      await i18n.changeLanguage(language);
    }, language);
    writes = 0;
    const locale = resources[language].translation;
    const toastTitle = page
      .locator(
        '[data-slot="toast"]:not([data-ending-style]):not([data-limited]) [data-slot="toast-title"]'
      )
      .first();
    await page.locator("#input-0").fill("broken@");
    await page
      .getByRole("button", {
        name: `${locale.common.send}${locale.syntax.separator}${locale.auth.authCode}`,
        exact: true,
      })
      .click();
    await expect(toastTitle).toHaveText(locale.auth.validation.emailFormat);
    expect(writes).toBe(0);
    for (const [code, password, confirmation, message] of [
      ["123456", "asd", "asd", locale.auth.validation.passwordTooShort],
      ["12", "Fixture123!", "Fixture123!", locale.validation.authCode],
      [
        "123456",
        "Fixture123!",
        "Different123!",
        locale.auth.validation.passwordMismatch,
      ],
    ]) {
      for (const [index, value] of [
        "fixture@example.invalid",
        code,
        password,
        confirmation,
      ].entries()) {
        await page.locator(`#input-${index}`).fill(value);
      }
      await page.locator('button[type="submit"]').click();
      await expect(toastTitle).toHaveText(message);
      expect(writes).toBe(0);
    }
  });

  test(`login request validation is presented in ${language} without an API call`, async ({
    page,
  }) => {
    await page.goto("/login");
    await page.locator("html[data-density]").waitFor();
    await page.evaluate(async language => {
      const path = "/src/i18n/index.ts";
      const { default: i18n } = await import(/* @vite-ignore */ path);
      await i18n.changeLanguage(language);
    }, language);
    writes = 0;
    const messages = resources[language].translation.auth.validation;
    for (const [account, password, message] of [
      ["", "Fixture123!", messages.accountRequired],
      ["asd", "asd", messages.accountFormat],
      ["fixture@example.invalid", "", messages.passwordRequired],
      ["fixture@example.invalid", "asd", messages.passwordTooShort],
      ["fixture@example.invalid", "abcdefgh", messages.passwordStrength],
      ["broken@", "Fixture123!", messages.accountFormat],
      ["fixture@example.invalid", "x".repeat(1025), messages.passwordTooLong],
    ]) {
      await page.locator("#input-0").fill(account);
      await page.locator("#input-1").fill(password);
      await page.locator('button[type="submit"]').click();
      await expect(
        page
          .locator(
            '[data-slot="toast"]:not([data-ending-style]):not([data-limited]) [data-slot="toast-title"]'
          )
          .first()
      ).toHaveText(message);
      expect(writes).toBe(0);
    }
  });

  test(`registration request validation is presented in ${language} without an API call`, async ({
    page,
  }) => {
    await page.goto("/register");
    await page.locator("html[data-density]").waitFor();
    await page.evaluate(async language => {
      const path = "/src/i18n/index.ts";
      const { default: i18n } = await import(/* @vite-ignore */ path);
      await i18n.changeLanguage(language);
    }, language);
    writes = 0;
    const messages = resources[language].translation.auth.validation;
    for (const [name, email, password, confirmation, message] of [
      [
        "fixture123",
        "broken@",
        "Fixture123!",
        "Fixture123!",
        messages.emailFormat,
      ],
      [
        "fixture123!",
        "fixture@example.invalid",
        "Fixture123!",
        "Fixture123!",
        messages.nameFormat,
      ],
      [
        "fixture123",
        "fixture@example.invalid",
        "Ab1!",
        "Ab1!",
        messages.passwordTooShort,
      ],
      [
        "fixture123",
        "fixture@example.invalid",
        "abcdefgh",
        "abcdefgh",
        messages.passwordStrength,
      ],
      [
        "fixture123",
        "fixture@example.invalid",
        "Fixture123!",
        "Different123!",
        messages.passwordMismatch,
      ],
    ]) {
      for (const [index, value] of [
        name,
        email,
        password,
        confirmation,
      ].entries()) {
        await page.locator(`#input-${index}`).fill(value);
      }
      await page.locator('button[type="submit"]').click();
      await expect(
        page
          .locator(
            '[data-slot="toast"]:not([data-ending-style]):not([data-limited]) [data-slot="toast-title"]'
          )
          .first()
      ).toHaveText(message);
      expect(writes).toBe(0);
    }
  });
}

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
