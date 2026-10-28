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
  const expected = (
    await code
      .locator('[data-slot="code-block-line-content"]')
      .allTextContents()
  ).join("\n");
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

  await example.getByRole("tab", { name: "HTTP", exact: true }).click();
  await example.getByRole("button", { name: "Copy code", exact: true }).click();
  await expect(page.locator("body")).toHaveAttribute(
    "data-copied-code",
    "POST https://example.test/example\nContent-Type: application/json"
  );
});

test("code examples use keyboard-accessible tabs and load real Shiki tokens", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  const example = page
    .locator("#api-response-test-root [data-slot=tabs]")
    .filter({ has: page.getByText("Example", { exact: true }) });
  const curl = example.getByRole("tab", { name: "cURL", exact: true });
  const http = example.getByRole("tab", { name: "HTTP", exact: true });
  await expect(curl).toHaveAttribute("aria-selected", "true");
  await expect(example.locator('[style*="--shiki-light"]')).not.toHaveCount(0);
  await curl.focus();
  await curl.press("ArrowRight");
  await expect(http).toBeFocused();
  await expect(http).toHaveAttribute("aria-selected", "true");
  await expect(
    example.getByRole("tabpanel").filter({ visible: true })
  ).toContainText("Content-Type");
  await expect(example.locator('[style*="--shiki-light"]')).not.toHaveCount(0);
  const token = example.locator('[style*="--shiki-light"]').first();
  await page.evaluate(() => {
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");
  });
  const lightColor = await token.evaluate(
    element => getComputedStyle(element).color
  );
  await page.evaluate(() => {
    document.documentElement.classList.remove("light");
    document.documentElement.classList.add("dark");
  });
  expect(
    await token.evaluate(element => getComputedStyle(element).color)
  ).not.toBe(lightColor);
  await http.press("ArrowLeft");
  await expect(curl).toBeFocused();
  await expect(curl).toHaveAttribute("aria-selected", "true");
  expect(errors).toEqual([]);
});

test("clipboard rejection leaves the code usable and does not announce success", async ({
  page,
}) => {
  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async () => {
          throw new Error("Clipboard denied");
        },
      },
    });
  });
  const example = page
    .locator("#api-response-test-root [data-slot=tabs]")
    .filter({ has: page.getByText("Example", { exact: true }) });
  await example.getByRole("button", { name: "Copy code", exact: true }).click();
  await expect(
    example.getByRole("button", { name: "Copy code", exact: true })
  ).toBeEnabled();
  await expect(example.locator('[aria-live="polite"]')).toHaveText("");
  await expect(example.locator("pre:visible")).toContainText(
    "curl https://example.test"
  );
});

test("the JavaScript highlighter preserves all supported languages and rejects unknown grammars", async ({
  page,
}) => {
  const results = await page.evaluate(async () => {
    const path = "/test/e2e/apiResponseTestSupport.tsx";
    const { loadHighlighter } = await import(/* @vite-ignore */ path);
    const examples = [
      ["curl", "curl https://example.test\n# Example"],
      ["http", "GET /example HTTP/1.1\nHost: example.test"],
      ["json", '{"example":"<script>alert(1)</script>"}'],
      ["go", 'package main\nfunc main() { println("example") }'],
      ["python", 'def example():\n    return "text"'],
      ["typescript", 'const example: string = "text";'],
    ];
    const checked = [];
    for (const [language, code] of examples) {
      const highlighter = await loadHighlighter(language);
      const lines = highlighter?.highlight(code).lines as Array<
        Array<{ content: string }>
      >;
      checked.push({
        language,
        matches:
          lines
            .map(line => line.map(token => token.content).join(""))
            .join("\n") === code,
      });
    }
    return {
      checked,
      unknown: await loadHighlighter("unknown-language"),
      inherited: await loadHighlighter("constructor"),
    };
  });
  expect(results.checked).toHaveLength(6);
  expect(results.checked.every(result => result.matches)).toBe(true);
  expect(results.unknown).toBeNull();
  expect(results.inherited).toBeNull();
});

test("code blocks and copy controls stay inside a narrow documentation viewport", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 800 });
  const example = page
    .locator("#api-response-test-root [data-slot=tabs]")
    .filter({ has: page.getByText("Example", { exact: true }) });
  await example.scrollIntoViewIfNeeded();
  const bounds = await example.boundingBox();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(320);
  expect(
    await example.evaluate(element => element.scrollWidth - element.clientWidth)
  ).toBeLessThanOrEqual(1);
  for (const tab of await example.getByRole("tab").all()) {
    await tab.click();
    await expect(
      example.getByRole("button", { name: "Copy code", exact: true })
    ).toBeInViewport();
  }
  await page.setViewportSize({ width: 1100, height: 800 });
  await example.scrollIntoViewIfNeeded();
  await page.screenshot({
    path: testInfo.outputPath("document-code-block.png"),
  });
});
