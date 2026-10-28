import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("https://www.youtube-nocookie.com/embed/**", route =>
    route.fulfill({
      contentType: "text/html",
      body: "<!doctype html><title>Player fixture</title><p>Player fixture</p>",
    })
  );
});

test("the guide loads all video previews immediately and defers images and GIFs", async ({
  page,
  request,
}) => {
  const response = await request.get("/document");
  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html).toContain("Write and organize notes, keep reference files");
  expect(html).toContain('id="website-contact-support"');
  expect(html.match(/<iframe /g)).toHaveLength(6);

  const gifRequests: string[] = [];
  const youtubeRequests: string[] = [];
  page.on("request", request => {
    if (
      request.resourceType() === "image" &&
      /\.gif(?:\?|$)/.test(request.url())
    )
      gifRequests.push(request.url());
    if (/youtube(?:-nocookie)?\.com/.test(request.url()))
      youtubeRequests.push(request.url());
  });
  await page.goto("/document#website");
  await page.waitForLoadState("networkidle");
  await expect(page.locator("#website")).toBeInViewport();
  await expect(
    page.locator("#website figure[data-article-image=image]")
  ).toHaveCount(21);
  await expect(
    page.locator("#website figure[data-article-image=gif]")
  ).toHaveCount(4);
  await expect(page.locator("#website figure[data-article-video]")).toHaveCount(
    6
  );
  await expect(page.locator("#website img[loading=lazy]")).toHaveCount(21);
  expect(gifRequests).toHaveLength(0);
  expect(youtubeRequests).toHaveLength(6);
  await expect(page.locator("#website iframe[loading=eager]")).toHaveCount(6);
  await expect(page.locator("#website iframe[loading=lazy]")).toHaveCount(0);
  for (const video of await page.locator("[data-article-video]").all()) {
    await expect(
      video.frameLocator("iframe").getByText("Player fixture")
    ).toHaveText("Player fixture");
  }
  await expect(
    page.locator("#website [data-article-video] button")
  ).toHaveCount(0);

  const video = page.locator('[data-article-video*="pH21Od0Io58"]');
  await video.scrollIntoViewIfNeeded();
  await expect(video.getByRole("button")).toHaveCount(0);
  const frame = video.locator("iframe");
  await expect(frame).not.toHaveAttribute("credentialless");
  await expect(frame).toHaveAttribute(
    "referrerpolicy",
    "strict-origin-when-cross-origin"
  );
  await expect(frame).toHaveAttribute("title", "Workspace Overview");
  await expect(frame).toHaveAttribute("src", /\?playsinline=1&rel=0$/);
  await expect(
    video.frameLocator("iframe").getByText("Player fixture")
  ).toBeVisible();
  await expect(page.locator("#website iframe")).toHaveCount(6);

  const gif = page.locator("[data-article-image=gif]").first();
  await gif.scrollIntoViewIfNeeded();
  await expect(gif.locator("img")).toBeVisible();
  await expect
    .poll(() =>
      gif
        .locator("img")
        .evaluate(node => (node as HTMLImageElement).naturalWidth)
    )
    .toBe(1600);
  expect(gifRequests).toHaveLength(1);
  const height = await gif
    .locator("div")
    .first()
    .evaluate(node => node.getBoundingClientRect().height);
  await gif.getByRole("button", { name: /^Pause:/ }).click();
  await expect(gif.locator("img")).toHaveCount(0);
  await expect(frame).toHaveCount(1);
  expect(
    await gif
      .locator("div")
      .first()
      .evaluate(node => node.getBoundingClientRect().height)
  ).toBeCloseTo(height);
  await gif.getByRole("button", { name: /^Play:/ }).focus();
  await page.keyboard.press("Enter");
  await expect(gif.locator("img")).toBeVisible();
  await page
    .locator("article")
    .evaluate(node => node.scrollTo({ top: 0, behavior: "instant" }));
  await expect(gif.locator("img")).toHaveCount(0);
});

test("the English guide has no language picker and keeps section links", async ({
  page,
}, testInfo) => {
  await page.goto("/document#website");
  await page.waitForLoadState("networkidle");
  await expect(page.locator("#website > header button")).toHaveCount(0);
  await expect(page.locator('#website [lang="en"]')).toBeVisible();
  await expect(page.locator('#website [lang="zh-Hant"]')).toHaveCount(0);
  await expect(page.locator("#website [data-article-video]")).toHaveCount(6);
  await page.screenshot({ path: testInfo.outputPath("website-english.png") });
  const ids = await page
    .locator("section[id]")
    .evaluateAll(nodes => nodes.map(node => node.id));
  expect(new Set(ids).size).toBe(ids.length);
  await page
    .locator("#website a[href$='#website-add-a-task-and-check-the-result']")
    .click();
  await expect(
    page.locator("#website-add-a-task-and-check-the-result")
  ).toBeInViewport();
});

test("public documentation embeds players without credentialless support", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(HTMLIFrameElement.prototype, "credentialless", {
      configurable: true,
      value: undefined,
    });
    delete (HTMLIFrameElement.prototype as unknown as Record<string, unknown>)
      .credentialless;
  });
  await page.goto("/document#website");
  await page.waitForLoadState("networkidle");
  expect(await page.evaluate(() => window.crossOriginIsolated)).toBe(false);
  const video = page.locator('[data-article-video*="pH21Od0Io58"]');
  await expect(video.getByRole("button")).toHaveCount(0);
  await expect(
    video.getByRole("link", { name: "Open video", exact: true }).first()
  ).toHaveAttribute("href", "https://youtu.be/pH21Od0Io58");
  await expect(video.locator("iframe")).toHaveCount(1);
  await expect(page.locator("#website iframe[loading=eager]")).toHaveCount(6);
});

for (const width of [320, 768, 1440]) {
  test(
    "guide text and media stay within the reading area at " + width + "px",
    async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 700 });
      await page.goto("/document#website");
      await page.waitForLoadState("networkidle");
      for (const video of await page.locator("[data-article-video]").all()) {
        await video.scrollIntoViewIfNeeded();
        await expect(video.getByRole("button")).toHaveCount(0);
        await expect(
          video.frameLocator("iframe").getByText("Player fixture")
        ).toBeVisible();
      }
      await expect(page.locator("#website iframe")).toHaveCount(6);
      const overflow = await page
        .locator("article")
        .evaluate(node => node.scrollWidth - node.clientWidth);
      expect(overflow).toBeLessThanOrEqual(1);
      const mediaOverflow = await page
        .locator("#website figure")
        .evaluateAll(nodes =>
          nodes.some(
            node => node.getBoundingClientRect().right > window.innerWidth + 1
          )
        );
      expect(mediaOverflow).toBe(false);
      await page.screenshot({
        path: testInfo.outputPath("website-" + width + ".png"),
      });
    }
  );
}

for (const width of [390, 1440]) {
  test(`Article separators keep consistent strokes at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/document");
    await page.waitForLoadState("networkidle");
    const strokes = await page.evaluate(() => {
      const stroke = (element: Element, pseudo?: string) => {
        const style = getComputedStyle(element, pseudo);
        return {
          height: Number.parseFloat(style.height),
          border: Number.parseFloat(style.borderTopWidth),
          color: style.backgroundColor,
          shrink: style.flexShrink,
        };
      };
      return {
        paragraphs: Array.from(
          document.querySelectorAll('[data-article-separator="paragraph"]'),
          element => stroke(element)
        ),
        subparagraphs: Array.from(
          document.querySelectorAll("section[data-article-level]")
        )
          .filter(
            element => getComputedStyle(element, "::before").content !== "none"
          )
          .map(element => stroke(element, "::before")),
      };
    });
    expect(strokes.paragraphs).toHaveLength(4);
    expect(strokes.subparagraphs.length).toBeGreaterThan(20);
    for (const [lines, height] of [
      [strokes.paragraphs, 2],
      [strokes.subparagraphs, 1],
    ] as const) {
      for (const line of lines) {
        expect(line).toEqual({
          height,
          border: 0,
          color: lines[0].color,
          shrink: "0",
        });
      }
    }
  });

  test(`guide separators align with prose and have balanced spacing at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/document#website-user-information");
    await page.waitForLoadState("networkidle");
    for (const id of [
      "website-user-information",
      "website-settings-and-logout",
      "website-headings-and-lists",
    ]) {
      const separator = await page.locator(`#${id}`).evaluate(section => {
        const bounds = section.getBoundingClientRect();
        const line = getComputedStyle(section, "::before");
        const previousContent =
          section.previousElementSibling!.lastElementChild!;
        const heading = section.firstElementChild!.getBoundingClientRect();
        const top =
          bounds.top +
          Number.parseFloat(getComputedStyle(section).paddingTop) +
          Number.parseFloat(line.marginTop);
        const bottom = top + Number.parseFloat(line.height);
        return {
          width: Number.parseFloat(line.width),
          proseWidth: heading.width,
          above: top - previousContent.getBoundingClientRect().bottom,
          below: heading.top - bottom,
        };
      });
      expect(separator.width).toBeCloseTo(separator.proseWidth, 0);
      expect(separator.above).toBeGreaterThanOrEqual(8);
      expect(separator.above).toBeCloseTo(separator.below, 0);
    }
    for (const id of [
      "website-component",
      "website-user-interface",
      "website-settings",
      "website-contact-support",
    ]) {
      const boundary = await page.locator(`#${id}`).evaluate(section => ({
        automatic: getComputedStyle(section, "::before").content,
        precedingLines: section.previousElementSibling!.querySelectorAll(
          '[data-article-separator="subparagraph"]'
        ).length,
      }));
      expect(boundary.automatic).not.toBe("none");
      expect(boundary.precedingLines).toBe(0);
    }
  });
}
