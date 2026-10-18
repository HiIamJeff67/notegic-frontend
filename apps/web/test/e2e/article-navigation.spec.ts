import { expect, test } from "@playwright/test";

test("documentation copy stays in English when the shared UI language changes", async ({
  page,
}) => {
  test.skip(
    process.env.E2E_PRODUCTION === "true",
    "The language switch uses Vite's source module."
  );
  await page.goto("/document");
  await page.waitForLoadState("networkidle");
  await page.evaluate(async () => {
    const path = "/src/i18n/index.ts";
    const { default: i18n } = await import(/* @vite-ignore */ path);
    await i18n.changeLanguage("zh-TW");
  });
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-TW");
  await expect(
    page
      .locator("#quick-start")
      .getByRole("heading", { name: "API key", exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "API key", exact: true })
  ).toBeVisible();
  await page
    .getByRole("link", {
      name: "Learn how to manage and revoke API keys",
      exact: true,
    })
    .click();
  await expect(
    page.locator("#api-key-management").getByRole("heading", {
      name: "Manage and revoke keys",
      exact: true,
    })
  ).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-TW");
});

test("document HTML renders its quick start without relying on client-side recovery", async ({
  request,
}) => {
  const response = await request.get("/document");
  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html).toContain('id="quick-start"');
  expect(html).toContain("https://api.notegic.com/v1/routine-tags");
  expect(html).not.toContain("ReferenceError: Prism is not defined");
});

test("the document API key settings link targets the registered app route", async ({
  page,
  request,
}) => {
  await page.goto("/document");
  await page.waitForLoadState("networkidle");
  const link = page.getByRole("link", {
    name: "Open Account settings → API keys",
    exact: true,
  });
  await expect(link).toHaveAttribute("href", "/app/setting/account#api-keys");
  const response = await request.get("/app/setting/account");
  expect(response.status()).toBe(200);
  await link.click();
  await expect(page).toHaveURL(
    /\/(?:app\/setting\/account#api-keys|login)(?:\?.*)?$/
  );
  await expect(
    page.getByText("404 — Page not found", { exact: true })
  ).toHaveCount(0);
});

test("document sections keep their DOM boundaries and API operations remain searchable", async ({
  page,
}) => {
  await page.goto("/document");
  await page.waitForLoadState("networkidle");
  await expect(
    page.getByRole("heading", { name: "Document", exact: true })
  ).toBeVisible();
  const sections = page.locator(
    '.article-content > section[data-article-level="0"]'
  );
  await expect(sections).toHaveCount(5);
  await expect(
    page.getByRole("button", { name: "Implementation", exact: true })
  ).toHaveCount(0);
  await expect(page.locator(".article-content")).not.toContainText("localhost");
  await expect(page.locator(".article-content")).not.toContainText("SHA-256");
  await expect(page.locator(".article-content")).not.toContainText(
    "make -C contracts"
  );
  await expect(page.locator("#gateway-routine-task-dependencies")).toHaveCount(
    1
  );
  await expect(
    page.locator("#gateway-rule-rate-limits-and-retries")
  ).toContainText("reconcile state");
  await expect(page.locator("#quick-start")).toContainText(
    "https://api.notegic.com/v1/routine-tags"
  );
  await expect(page.locator("#quick-start")).toContainText("X-API-Key");
  await expect(
    page.locator("#gateway-rule-authentication strong").first()
  ).toHaveText("Account settings → API keys");
  await expect(
    page.locator("#gateway-rule-rate-limits-and-retries strong").first()
  ).toHaveText("1,000 requests per minute");
  await expect(page.locator("#gateway-rules")).not.toContainText("**");
  await expect(
    page.locator("#quick-start pre:visible .token").first()
  ).toBeVisible();
  await expect(page.locator("#versions")).not.toContainText("Product Roadmap");
  await expect(page.locator("#versions [data-slot=progress]")).toHaveCount(0);
  expect(
    await sections.evaluateAll(nodes => nodes.map(node => node.id))
  ).toEqual(["overview", "website", "gateway", "versions", "privacy-policy"]);
  await expect(page.locator("#website > header h2")).toHaveText("Website");
  await expect(page.locator("#gateway > header h2")).toHaveText("API");
  await expect(
    page.locator("#gateway > div > section").first()
  ).toHaveAttribute("id", "quick-start");
  await expect(page.locator("#quick-start")).toHaveAttribute(
    "data-article-level",
    "1"
  );
  const apiNavigation = page
    .getByRole("button", { name: "API", exact: true })
    .locator("xpath=..");
  await expect(
    apiNavigation.getByRole("link", { name: "API key", exact: true })
  ).toHaveAttribute("href", "#quick-start");
  const ids = await page
    .locator("section[id]")
    .evaluateAll(sections => sections.map(section => section.id));
  expect(new Set(ids).size).toBe(ids.length);

  const row = page.locator("#gateway-root-shelves tbody tr").first();
  const operation = row.locator("[data-article-operation]");
  const operationId = await operation.getAttribute("data-article-operation");
  const operationName = await operation.textContent();
  expect(operationId).toBeTruthy();
  expect(operationName).toMatch(/^[A-Z][A-Za-z0-9]*$/);
  const description = await row.locator("td").nth(3).textContent();
  expect(description?.trim()).toBeTruthy();
  await expect(page.locator("#gateway")).not.toContainText(
    "Description not provided."
  );
  await expect(row.locator("td").nth(2)).toHaveText(operationName!);
  await expect(row.locator("td").nth(3)).toHaveText(
    (await operation.getAttribute("data-article-operation-summary")) ?? ""
  );
  await row
    .getByRole("button", { name: "Expand details", exact: true })
    .click();
  const responses = page.locator("#gateway-root-shelves");
  await expect(
    responses.getByText("Response body", { exact: true })
  ).toBeHidden();
  await responses
    .getByRole("button", { name: "Toggle 200 response details", exact: true })
    .click();
  await expect(
    page
      .locator("#gateway-root-shelves")
      .getByText("Response body", { exact: true })
  ).toBeVisible();
  await row
    .getByRole("button", { name: "Collapse details", exact: true })
    .click();

  await page.getByRole("button", { name: "Versions", exact: true }).click();
  await expect(page.locator("#versions")).toBeInViewport();
  for (const query of [operationId!, operationName!, description!]) {
    await page.keyboard.press("Control+k");
    const search = page.getByRole("dialog", { name: "Search article" });
    await search
      .getByPlaceholder("Search sections or API operations...")
      .fill(query);
    await search
      .getByRole("option")
      .filter({ hasText: operationName! })
      .click();
    await expect(search).not.toBeVisible();
    await expect(operation).toBeInViewport();
  }
});

test("Website deep links and resource links work within document", async ({
  page,
}) => {
  await page.goto("/document#api-keys");
  await page.waitForLoadState("networkidle");
  await expect(page).toHaveURL(/\/document#api-keys$/);
  await expect(page.locator("#api-keys > h3")).toBeInViewport();
  await expect(page.locator("#website #api-keys")).toHaveCount(1);
  await expect(
    page.locator("#api-keys ol li").last().locator("code")
  ).toHaveText("X-API-Key");

  await page.getByRole("link", { name: "Q&A", exact: true }).click();
  await expect(page.locator("#q-and-a")).toBeVisible();
  await page
    .getByRole("button", { name: "What is a Block Pack?", exact: true })
    .click();
  await expect(
    page.getByText(
      "A Block Pack is a collaborative document container made from ordered blocks.",
      { exact: false }
    )
  ).toBeVisible();

  await page.locator('[data-sidebar][href="#root-shelves"]').click();
  const link = page
    .locator("#root-shelves")
    .getByRole("link", { name: "View Root Shelves API operations" });
  await expect(link).toHaveAttribute("href", "/document#gateway-root-shelves");
  await link.click();
  await expect(page).toHaveURL(/\/document#gateway-root-shelves$/);
  await expect(page.locator("#gateway-root-shelves")).toBeInViewport();
  await page.goto("/document#materials");
  await expect(page.locator("#materials > h3")).toBeInViewport();
  await expect(
    page.locator("#materials a[href='/document#gateway-materials']")
  ).toHaveCount(0);
  await expect(page.locator("#materials")).toContainText(
    "does not currently have a public integration API"
  );
  await page.goto("/document#routine-task-dependencies");
  await expect(
    page.locator("#routine-task-dependencies > h3")
  ).toBeInViewport();
  await page
    .locator("#routine-task-dependencies")
    .getByRole("link", {
      name: "View Routine Task Dependencies API operations",
    })
    .click();
  await expect(
    page.locator("#gateway-routine-task-dependencies")
  ).toBeInViewport();
});

test("the removed tutorial route returns 404 without redirecting", async ({
  request,
}) => {
  const response = await request.get("/tutorial", { maxRedirects: 0 });
  expect(response.status()).toBe(404);
  expect(response.headers().location).toBeUndefined();
});

test("HTTP methods retain their protocol colors across light and dark themes", async ({
  page,
}) => {
  await page.goto("/document");
  await page.waitForLoadState("networkidle");
  for (const theme of ["light", "dark"]) {
    const colors = await page.evaluate(theme => {
      const html = document.documentElement;
      html.classList.remove("light", "dark");
      html.classList.add(theme);
      html.style.setProperty("--primary", "oklch(0.7 0.15 50)");
      const context = document.createElement("canvas").getContext("2d")!;
      return ["GET", "POST", "PUT", "PATCH", "DELETE"].map(method => {
        const badge = document.querySelector(
          `[data-article-method="${method}"]`
        )!;
        context.clearRect(0, 0, 1, 1);
        context.fillStyle = getComputedStyle(badge).color;
        context.fillRect(0, 0, 1, 1);
        return Array.from(context.getImageData(0, 0, 1, 1).data);
      });
    }, theme);
    const [get, post, put, patch, remove] = colors;
    expect(get[1]).toBeGreaterThan(Math.max(get[0], get[2]));
    expect(Math.min(post[0], post[1])).toBeGreaterThan(post[2]);
    expect(put[2]).toBeGreaterThan(Math.max(put[0], put[1]));
    expect(Math.min(patch[0], patch[2])).toBeGreaterThan(patch[1]);
    expect(remove[0]).toBeGreaterThan(Math.max(remove[1], remove[2]));
  }
});
