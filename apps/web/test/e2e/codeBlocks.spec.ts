import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  test.skip(
    process.env.E2E_PRODUCTION === "true",
    "Uses a Vite component fixture."
  );
  const failures: string[] = [];
  page.on("requestfailed", request =>
    failures.push(`${request.url()}: ${request.failure()?.errorText}`)
  );
  await page.goto("/document");
  await page.waitForLoadState("networkidle");
  await page
    .evaluate(async () => {
      const path = "/test/e2e/codeBlockTestSupport.tsx";
      const { mountCodeEditors } = await import(/* @vite-ignore */ path);
      mountCodeEditors();
    })
    .catch(async error => {
      await test.info().attach("fixture-network-failures", {
        body: failures.join("\n"),
        contentType: "text/plain",
      });
      throw error;
    });
  await expect(page.locator('[data-editor="blockpack"] select')).toHaveCount(5);
});

for (const surface of ["blockpack", "payload"]) {
  test(`${surface} switches language, highlights code and preserves legacy content on reload`, async ({
    page,
  }, testInfo) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    const section = page.locator(`[data-editor="${surface}"]`);
    const block = section.locator('[data-id="code"]').first();
    const picker = block.getByRole("combobox");
    await expect(picker).toHaveValue("javascript");
    await expect(block.locator(".shiki").first()).toBeVisible();
    await block.screenshot({
      path: testInfo.outputPath(`${surface}-code-block.png`),
    });
    const original = await block.locator("code").innerText();
    const before = await page.evaluate(async surface => {
      const path = "/test/e2e/codeBlockTestSupport.tsx";
      const { editors } = await import(/* @vite-ignore */ path);
      return editors[surface].document;
    }, surface);
    await picker.selectOption("typescript");
    await expect(picker).toHaveValue("typescript");
    await expect(block.locator("code")).toHaveText(original);
    await expect(section.locator('[data-id="alias"] select')).toHaveValue("ts");
    await expect(
      section.locator('[data-id="alias"] .shiki').first()
    ).toBeVisible();
    await expect(section.locator('[data-id="unknown"] code')).toHaveText(
      "<script>keep this code</script>"
    );
    await expect(section.locator('[data-id="unknown"] script')).toHaveCount(0);
    await expect(section.locator('[data-id="unknown"] select')).toHaveValue(
      "legacy-language"
    );
    await expect(
      section.locator('[data-id="empty-language"] select')
    ).toHaveValue("");
    await expect(section.locator('[data-id="plain"] select')).toHaveValue(
      "text"
    );
    const after = await page.evaluate(async surface => {
      const path = "/test/e2e/codeBlockTestSupport.tsx";
      const { editors } = await import(/* @vite-ignore */ path);
      return editors[surface].document;
    }, surface);
    expect(after).toEqual(
      before.map((item: any) =>
        item.id === "code"
          ? { ...item, props: { ...item.props, language: "typescript" } }
          : item
      )
    );
    await page.evaluate(async () => {
      const path = "/test/e2e/codeBlockTestSupport.tsx";
      const { editors, mountCodeEditors } = await import(
        /* @vite-ignore */ path
      );
      mountCodeEditors(
        Object.fromEntries(
          Object.entries(editors).map(([name, editor]: [string, any]) => [
            name,
            editor.document,
          ])
        )
      );
    });
    await expect(picker).toHaveValue("typescript");
    await expect(block.locator(".shiki").first()).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test("payload language changes support undo/redo and retain editable text", async ({
  page,
}) => {
  const block = page
    .locator('[data-editor="payload"] [data-id="code"]')
    .first();
  await block.getByRole("combobox").selectOption("python");
  await page.evaluate(async () => {
    const path = "/test/e2e/codeBlockTestSupport.tsx";
    const { editors } = await import(/* @vite-ignore */ path);
    editors.payload.undo();
  });
  await expect(block.getByRole("combobox")).toHaveValue("javascript");
  await page.evaluate(async () => {
    const path = "/test/e2e/codeBlockTestSupport.tsx";
    const { editors } = await import(/* @vite-ignore */ path);
    editors.payload.redo();
  });
  await expect(block.getByRole("combobox")).toHaveValue("python");
  await block.locator("code").click();
  await page.keyboard.press("End");
  await page.keyboard.type(" # retained draft");
  await expect(block.locator("code")).toContainText("# retained draft");
  await block.getByRole("combobox").selectOption("javascript");
  await expect(block.locator("code")).toContainText("# retained draft");
});

test("code palettes follow the theme and language pickers fit narrow screens", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 760 });
  const block = page
    .locator('[data-editor="payload"] [data-id="code"]')
    .first();
  const token = block.locator(".shiki").first();
  await expect(token).toBeVisible();
  await page.evaluate(async () => {
    const path = "/test/e2e/codeBlockTestSupport.tsx";
    const { setCodeTheme } = await import(/* @vite-ignore */ path);
    setCodeTheme(false);
  });
  await expect(
    page.locator('[data-editor="payload"] .bn-container')
  ).toHaveAttribute("data-color-scheme", "light");
  const light = await token.evaluate(
    element => getComputedStyle(element).color
  );
  await page.evaluate(async () => {
    const path = "/test/e2e/codeBlockTestSupport.tsx";
    const { setCodeTheme } = await import(/* @vite-ignore */ path);
    setCodeTheme(true);
  });
  await expect(
    page.locator('[data-editor="payload"] .bn-container')
  ).toHaveAttribute("data-color-scheme", "dark");
  await expect
    .poll(() => token.evaluate(element => getComputedStyle(element).color))
    .not.toBe(light);
  for (const picker of await page
    .locator("#code-editor-test-root select")
    .all()) {
    await picker.scrollIntoViewIfNeeded();
    const rect = await picker.boundingBox();
    expect(rect!.x).toBeGreaterThanOrEqual(0);
    expect(rect!.x + rect!.width).toBeLessThanOrEqual(320);
    expect(
      await picker.evaluate(element => getComputedStyle(element).opacity)
    ).toBe("1");
    await picker.hover();
    expect(
      await picker.evaluate(element => getComputedStyle(element).opacity)
    ).toBe("1");
  }
});

test("every selectable grammar loads through the shared JavaScript highlighter", async ({
  page,
}) => {
  const result = await page.evaluate(async () => {
    const path = "/test/e2e/codeBlockTestSupport.tsx";
    const { codeLanguages, getCodeHighlighter, loadHighlighter } = await import(
      /* @vite-ignore */ path
    );
    const instance = await getCodeHighlighter();
    const results = [];
    for (const language of Object.keys(codeLanguages)) {
      const loaded = await loadHighlighter(language);
      const tokens = loaded?.highlight("const value = 42;").lines;
      results.push(
        tokens
          ?.map((line: Array<{ content: string }>) =>
            line.map(token => token.content).join("")
          )
          .join("\n")
      );
    }
    return {
      results,
      shared: instance === (await getCodeHighlighter()),
      unknown: await loadHighlighter("constructor"),
    };
  });
  expect(
    result.results.every((text: string) => text === "const value = 42;")
  ).toBe(true);
  expect(result.shared).toBe(true);
  expect(result.unknown).toBeNull();
});

test("collaborative language changes and code survive Yjs replication", async ({
  page,
}) => {
  const block = page
    .locator('[data-editor="blockpack"] [data-id="code"]')
    .first();
  await block.getByRole("combobox").selectOption("go");
  const result = await page.evaluate(async () => {
    const path = "/test/e2e/codeBlockTestSupport.tsx";
    const {
      Y,
      document,
      editors,
      yDocToBlocks,
      NOTEGIC_BLOCKNOTE_YJS_FRAGMENT_NAME,
    } = await import(/* @vite-ignore */ path);
    const replica = new Y.Doc();
    Y.applyUpdate(replica, Y.encodeStateAsUpdate(document));
    const restored = yDocToBlocks(
      editors.blockpack,
      replica,
      NOTEGIC_BLOCKNOTE_YJS_FRAGMENT_NAME
    );
    replica.destroy();
    return { restored, source: editors.blockpack.document };
  });
  expect(result.restored).toEqual(result.source);
  expect(
    result.restored.find((block: any) => block.id === "code").props.language
  ).toBe("go");
});
