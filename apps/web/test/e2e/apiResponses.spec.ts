import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  test.skip(
    process.env.E2E_PRODUCTION === "true",
    "The component fixture is served by Vite in development."
  );
  await page.goto("/document");
  await page.waitForLoadState("networkidle");
  await page.evaluate(async () => {
    const path = "/test/e2e/apiResponseTestSupport.tsx";
    const { mountResponseExamples } = await import(/* @vite-ignore */ path);
    mountResponseExamples();
  });
  await expect(page.locator("#api-response-test-root")).toBeVisible();
});

test("all response statuses start collapsed and independently reveal their schemas", async ({
  page,
}) => {
  const fixture = page.locator("#api-response-test-root");
  const triggers = fixture.getByRole("button", {
    name: /^Toggle \d+ response details$/,
  });
  await expect(triggers).toHaveCount(4);
  for (const trigger of await triggers.all())
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(fixture.getByText("Response body", { exact: true })).toHaveCount(
    0
  );

  for (const status of ["200", "201", "400"]) {
    const trigger = fixture.getByRole("button", {
      name: `Toggle ${status} response details`,
    });
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    const response = trigger.locator(
      'xpath=ancestor::*[@data-slot="collapsible"][1]'
    );
    await expect(
      response.getByText("Response body", { exact: true })
    ).toBeVisible();
    await expect(response.getByText("Fields", { exact: true })).toBeVisible();
  }
  await expect(fixture.getByText("Response body", { exact: true })).toHaveCount(
    3
  );
  const emptyResponse = fixture.getByRole("button", {
    name: "Toggle 204 response details",
  });
  await emptyResponse.focus();
  await emptyResponse.press("Enter");
  await expect(
    fixture.getByText("No response body.", { exact: true })
  ).toBeVisible();
  await emptyResponse.press("Enter");
  await expect(emptyResponse).toHaveAttribute("aria-expanded", "false");
});

test("response descriptions format Markdown links outside the toggle button", async ({
  page,
}) => {
  const fixture = page.locator("#api-response-test-root");
  const link = fixture.getByRole("link", {
    name: "Response guide",
    exact: true,
  });
  await expect(link).toHaveAttribute("href", "/document#api-keys");
  await expect(link.locator("strong")).toHaveText("Response guide");
  expect(
    await link.evaluate(element => element.closest("button") === null)
  ).toBe(true);
  await link.click();
  await expect(page).toHaveURL(/\/document#api-keys$/);
  await expect(page.locator("#api-keys")).toBeVisible();
});

test("the copy button stays fixed over the code viewport and copies the active language", async ({
  page,
}) => {
  await page.setViewportSize({ width: 420, height: 700 });
  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (value: string) => {
          document.body.dataset.copiedCode = value;
        },
      },
    });
  });
  const example = page
    .locator("#api-response-test-root [data-slot=tabs]")
    .filter({ has: page.getByText("Example", { exact: true }) });
  const copy = example.getByRole("button", { name: "Copy code", exact: true });
  const code = example.locator("pre:visible");
  const expected = await code.locator("code").textContent();
  await copy.scrollIntoViewIfNeeded();
  const before = await copy.boundingBox();
  await code.evaluate(element => {
    element.scrollLeft = element.scrollWidth;
    element.scrollTop = element.scrollHeight;
  });
  expect(await code.evaluate(element => element.scrollLeft)).toBeGreaterThan(0);
  expect(await code.evaluate(element => element.scrollTop)).toBeGreaterThan(0);
  const after = await copy.boundingBox();
  expect(after?.x).toBeCloseTo(before!.x, 0);
  expect(after?.y).toBeCloseTo(before!.y, 0);
  await copy.click();
  await expect(page.locator("body")).toHaveAttribute(
    "data-copied-code",
    expected!
  );

  await example.getByLabel("Use HTTP").click();
  await example.getByRole("button", { name: "Copy code", exact: true }).click();
  await expect(page.locator("body")).toHaveAttribute(
    "data-copied-code",
    "POST https://example.test/example\nContent-Type: application/json"
  );
});
