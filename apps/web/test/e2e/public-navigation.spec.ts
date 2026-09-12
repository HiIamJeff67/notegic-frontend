import { expect, test } from "@playwright/test";

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
  await page.waitForLoadState("networkidle");

  await page.getByRole("button", { name: "View Docs" }).click();
  await expect(page).toHaveURL(/\/document$/);
  await expect(page.getByRole("heading", { name: "Document" })).toBeVisible();
  await expect(page.getByText("Public API baseline")).toBeVisible();
});
