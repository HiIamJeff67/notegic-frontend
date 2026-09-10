import { expect, type Page, test } from "@playwright/test";

const testAccount = {
  name: "Test1234",
  email: "test1234@notegic.com",
  password: "Test1234!",
};

let hasRegisteredTestAccount = false;

const localDatabaseErrorPattern =
  /local database|local yjs|transaction synchronization|migration|opfs|driver not initialized|pragma user_version/i;

const waitForClientHydration = async (page: Page) => {
  await page.locator("html[data-density]").waitFor();
};

const loginWithTestAccount = async (page: Page) => {
  await page.goto("/login");
  await waitForClientHydration(page);
  await page.getByLabel("Account").fill(testAccount.name);
  await page.getByLabel("Password").fill(testAccount.password);
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await expect(page).toHaveURL(/\/app\/dashboard\/?$/, { timeout: 30_000 });
};

const ensureTestAccountRegistered = async (page: Page) => {
  if (hasRegisteredTestAccount) return;

  await page.goto("/register");
  await page.getByLabel("Name").fill(testAccount.name);
  await page.getByLabel("Email").fill(testAccount.email);
  await page.getByLabel("Password", { exact: true }).fill(testAccount.password);
  await page.getByLabel("Confirm Password").fill(testAccount.password);
  await page.getByRole("button", { name: "Register", exact: true }).click();

  const reachedDashboard = await page
    .waitForURL(/\/app\/dashboard\/?$/, { timeout: 10_000 })
    .then(() => true)
    .catch(() => false);

  if (!reachedDashboard) {
    await loginWithTestAccount(page);
  }

  hasRegisteredTestAccount = true;
};

const deleteTestAccount = async (page: Page) => {
  await page.getByRole("button", { name: "Settings" }).first().click();
  await page.getByRole("menuitem", { name: "Account", exact: true }).click();

  const accountModification = page.locator("#account-modification");
  await accountModification.scrollIntoViewIfNeeded();
  await accountModification
    .getByRole("button", { name: "Delete", exact: true })
    .click();

  const deleteDialog = page.getByRole("dialog");
  await expect(deleteDialog).toBeVisible();
  await deleteDialog
    .getByPlaceholder("Enter DELETE to confirm deletion")
    .fill("DELETE");
  await deleteDialog
    .getByRole("button", { name: "Delete permanently", exact: true })
    .click();

  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("button", { name: "Get Started" })).toBeVisible();
};

test("forwards both auth cookies through the local SSR response", async ({
  page,
}) => {
  await page.goto("/login");
  await waitForClientHydration(page);
  await page.getByLabel("Account").fill(testAccount.name);
  await page.getByLabel("Password").fill(testAccount.password);

  const loginResponsePromise = page.waitForResponse(
    response =>
      response.request().method() === "POST" &&
      response.url().includes("/_serverFn")
  );
  await page.getByRole("button", { name: "Login", exact: true }).click();

  const loginResponse = await loginResponsePromise;
  const setCookie = (await loginResponse.allHeaders())["set-cookie"] ?? "";

  expect(setCookie).toContain("accessToken=");
  expect(setCookie).toContain("refreshToken=");
});

test.describe
  .serial("authenticated local database migration", () => {
    test("registers the fixed test account", async ({ page }) => {
      await ensureTestAccountRegistered(page);
    });

    test("logs in, completes local database startup, and deletes the account", async ({
      page,
    }) => {
      const localDatabaseErrors: string[] = [];
      page.on("console", message => {
        if (
          message.type() === "error" &&
          localDatabaseErrorPattern.test(message.text())
        ) {
          localDatabaseErrors.push(message.text());
        }
      });
      page.on("pageerror", error => {
        if (localDatabaseErrorPattern.test(error.message)) {
          localDatabaseErrors.push(error.message);
        }
      });

      await ensureTestAccountRegistered(page);
      await loginWithTestAccount(page);
      await expect(
        page.getByRole("button", { name: "Settings" }).first()
      ).toBeVisible({ timeout: 30_000 });
      await page.waitForLoadState("networkidle");
      expect(localDatabaseErrors).toEqual([]);

      await deleteTestAccount(page);
      hasRegisteredTestAccount = false;
    });
  });
