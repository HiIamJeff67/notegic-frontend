import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("https://www.youtube-nocookie.com/embed/**", route =>
    route.fulfill({ contentType: "text/html", body: "<p>Player fixture</p>" })
  );
});

test("API and Website guides stay in English regardless of the UI language", async ({
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
      name: "Review and revoke",
      exact: true,
    })
  ).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-TW");
  await expect(page.locator("#website")).toContainText(
    "Write and organize notes, keep reference files"
  );
  await expect(page.locator('#website [lang="en"]')).toBeVisible();
  await expect(page.locator("#website > header button")).toHaveCount(0);
  await expect(page.locator('#privacy-policy [lang="en"]')).toBeVisible();
  await expect(page.locator("#privacy-collection")).toContainText(
    "1. Information we collect"
  );
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
    page.getByRole("heading", { name: "Overview", exact: true })
  ).toBeVisible();
  await expect(page.locator("#overview p")).toHaveCount(2);
  await expect(page.locator("#overview")).toContainText("Start with Website");
  await expect(page.locator("#overview").getByRole("link")).toHaveCount(0);
  await expect(
    page.locator('#overview + [data-article-separator="paragraph"] + #website')
  ).toHaveCount(1);
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
  ).toContainText("check whether the change was applied");
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
  await page.locator("#quick-start").scrollIntoViewIfNeeded();
  await expect(
    page
      .locator('#quick-start pre:visible span[style*="--shiki-light"]')
      .first()
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

test("Website deep links and API resource guide links remain usable", async ({
  page,
}) => {
  await page.goto("/document#api-keys");
  await page.waitForLoadState("networkidle");
  await expect(page.locator("#api-keys > h5")).toBeInViewport();
  await expect(page.locator("#website #api-keys")).toHaveCount(1);

  await page
    .getByRole("link", { name: "Common situations", exact: true })
    .click();
  await expect(page.locator("#q-and-a")).toBeInViewport();
  await expect(page.locator("#q-and-a li")).toHaveCount(6);

  await page.goto("/document#gateway-root-shelves");
  await page
    .locator("#gateway-root-shelves")
    .getByRole("link", { name: "Read the resource guide", exact: true })
    .click();
  await expect(page).toHaveURL(/#root-shelves$/);
  await expect(page.locator("#root-shelves > h5")).toBeInViewport();
  await page.goto("/document#materials");
  await expect(page.locator("#materials > h5")).toBeInViewport();
  await expect(page.locator("#materials")).toContainText(
    "A Material holds a reference file"
  );
  await expect(
    page.locator("#materials a[href='/document#gateway-materials']")
  ).toHaveCount(0);
  await page.goto("/document#routine-task-dependencies");
  await expect(
    page.locator("#routine-task-dependencies > h5")
  ).toBeInViewport();
  await expect(page.locator("#routine-task-dependencies")).toContainText(
    "Dependencies specify which step must wait"
  );
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
