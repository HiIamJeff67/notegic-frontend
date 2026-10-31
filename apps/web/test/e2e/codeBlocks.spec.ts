import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("https://www.youtube-nocookie.com/embed/**", route =>
    route.fulfill({ contentType: "text/html", body: "<p>Player fixture</p>" })
  );
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
  test(`${surface} keeps drag and block actions separate at narrow widths`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 760 });
    const section = page.locator(`[data-editor="${surface}"]`);
    const block = section.locator('[data-id="code"]').first();
    await block.hover();

    const sideMenu = page.locator("#code-editor-test-root .bn-side-menu");
    const buttons = sideMenu.locator("button.bn-button");
    await expect(buttons).toHaveCount(surface === "payload" ? 3 : 2);
    const dragHandle = buttons.first();
    const menuButton = buttons.last();
    const dragBounds = await dragHandle.boundingBox();
    const menuBounds = await menuButton.boundingBox();
    const blockBounds = await block.boundingBox();

    expect(dragBounds).not.toBeNull();
    expect(menuBounds).not.toBeNull();
    expect(blockBounds).not.toBeNull();
    expect(dragBounds!.width).toBe(24);
    expect(dragBounds!.height).toBe(24);
    expect(menuBounds!.width).toBe(24);
    expect(menuBounds!.height).toBe(24);
    expect(dragBounds!.x).toBeLessThan(menuBounds!.x);
    expect(menuBounds!.x + menuBounds!.width).toBeLessThanOrEqual(
      blockBounds!.x
    );
    expect(dragBounds!.x).toBeGreaterThanOrEqual(0);
    expect(menuBounds!.x + menuBounds!.width).toBeLessThanOrEqual(320);

    await menuButton.click();
    const actionsMenu = page.locator(".bn-drag-handle-menu");
    await expect(actionsMenu).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(actionsMenu).toBeHidden();

    await dragHandle.dragTo(
      section.locator('.bn-block-outer[data-id="alias"]')
    );
    await expect(actionsMenu).toBeHidden();
  });

  test(`${surface} switches language, highlights code and preserves legacy content on reload`, async ({
    page,
  }, testInfo) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    const section = page.locator(`[data-editor="${surface}"]`);
    await section.locator(".bn-editor").evaluate(element => {
      element.setAttribute("spellcheck", "true");
    });
    const block = section.locator('[data-id="code"]').first();
    const picker = block.getByRole("combobox");
    await expect(picker).toHaveValue("javascript");
    await expect(block.locator(".shiki").first()).toBeVisible();
    await expect(block.locator("code")).toHaveAttribute("spellcheck", "false");
    await expect(section.locator(".bn-editor")).toHaveAttribute(
      "spellcheck",
      "true"
    );
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
    await expect(block.locator("code")).toHaveAttribute("spellcheck", "false");
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
    await expect(block.locator("code")).toHaveAttribute("spellcheck", "false");
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

test("shared calendar spec renders DayPicker and persists month changes", async ({
  page,
}) => {
  await page.evaluate(async () => {
    const path = "/test/e2e/codeBlockTestSupport.tsx";
    const { editors } = await import(/* @vite-ignore */ path);
    for (const editor of Object.values(editors) as any[]) {
      editor.insertBlocks(
        [
          {
            id: "calendar-test",
            type: "calendar",
            props: { anchorDate: "2026-01-01", timezone: "UTC" },
          },
        ],
        editor.document[0],
        "before"
      );
    }
  });
  for (const surface of ["blockpack", "payload"]) {
    const calendar = page
      .locator(`[data-editor="${surface}"] [data-id="calendar-test"]`)
      .first();
    await expect(
      calendar.getByText("January 2026", { exact: true })
    ).toBeVisible();
    await calendar.getByRole("button", { name: /next month/i }).click();
    await expect(
      calendar.getByText("February 2026", { exact: true })
    ).toBeVisible();
    const props = await page.evaluate(async surface => {
      const path = "/test/e2e/codeBlockTestSupport.tsx";
      const { editors } = await import(/* @vite-ignore */ path);
      return editors[surface].getBlock("calendar-test")?.props;
    }, surface);
    expect(props).toMatchObject({
      anchorDate: "2026-02-01",
      timezone: "UTC",
      view: "month",
    });
  }
});

test("shared slash menu retains calendar, math, diagram and codeblock entries", async ({
  page,
}) => {
  const entries = await page.evaluate(async () => {
    const fixturePath = "/test/e2e/codeBlockTestSupport.tsx";
    const { editors, getSuggestionItems } = await import(
      /* @vite-ignore */ fixturePath
    );
    const getItems = getSuggestionItems(editors.payload);
    const all = await getItems("");
    return {
      titles: all.map((item: any) => item.title),
      code: (await getItems("codeblock")).map((item: any) => item.title),
    };
  });
  expect(entries.titles).toEqual(
    expect.arrayContaining([
      "Calendar",
      "Block Equation",
      "Inline Equation",
      "Diagram",
    ])
  );
  expect(entries.code.length).toBeGreaterThan(0);
});
