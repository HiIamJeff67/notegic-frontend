import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("https://www.youtube-nocookie.com/embed/**", route =>
    route.fulfill({ contentType: "text/html", body: "<p>Player fixture</p>" })
  );
});

test("@environment visitors can reach the login and registration forms", async ({
  page,
}) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  await page.getByRole("button", { name: "Get Started" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();
  await expect(page.getByLabel("Account")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();

  await page.getByRole("button", { name: "Register", exact: true }).click();
  await expect(page).toHaveURL(/\/register$/);
  await expect(page.getByRole("heading", { name: "Register" })).toBeVisible();
  await expect(page.getByLabel("Name")).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Confirm Password")).toBeVisible();
});

test("@environment visitors can open the published API documentation", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator("html[data-density]").waitFor();

  await expect(
    page
      .getByRole("button", { name: "View Docs" })
      .locator("svg.lucide-book-open")
  ).toBeVisible();
  await page.getByRole("button", { name: "View Docs" }).click();
  await expect(page).toHaveURL(/\/document$/);
  await expect(
    page.getByRole("heading", { name: "Overview", exact: true, level: 1 })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "API", exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Website", exact: true })
  ).toBeVisible();
});

test("Playground is available only in development", async ({ page }) => {
  const production = process.env.E2E_PRODUCTION === "true";
  const response = await page.goto("/playground");
  expect(response?.status()).toBe(production ? 404 : 200);
  if (!production) {
    await expect(
      page.getByRole("button", { name: /App Command/ })
    ).toBeVisible();
  }
});

test("the retired Meta OAuth callback is unavailable", async ({ page }) => {
  const response = await page.goto("/redirect/meta");
  expect(response?.status()).toBe(404);
});

test.describe("OAuth callback before hydration", () => {
  test.use({ javaScriptEnabled: false });

  test("the first document paint already shows the shared loading cover", async ({
    page,
  }) => {
    const response = await page.goto("/redirect/x");
    expect(response?.status()).toBe(200);
    const cover = page.getByRole("status");
    await expect(cover).toHaveCount(1);
    await expect(cover).toHaveText("Validating X authentication...");
    await expect(cover.locator("svg")).toHaveCSS("width", "154px");
    await expect(cover.locator("p")).toHaveCSS("font-size", "16px");
  });
});

for (const provider of ["google", "github", "x", "discord", "apple"]) {
  test(`the ${provider} OAuth callback has a public route`, async ({
    page,
  }) => {
    test.setTimeout(60_000);
    const response = await page.goto(`/redirect/${provider}`);
    expect(response?.status()).toBe(200);
    await expect(page).toHaveURL(/\/login\?oauthFailed=true$/, {
      timeout: 30_000,
    });
    await expect(page.locator(".loading-logo-front")).toHaveCount(0);
  });
}
