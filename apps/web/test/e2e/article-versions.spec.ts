import { expect, test } from "@playwright/test";

const versions = [
  { id: "version-0-3-0", title: "v0.3.0", status: "Next" },
  { id: "version-0-2-0", title: "v0.2.0", status: "Current" },
  { id: "version-0-1-0", title: "v0.1.0", status: "Legacy" },
  { id: "version-0-0-1", title: "v0.0.1", status: "Legacy" },
];

for (const width of [390, 900, 2560]) {
  test(`versions have sidebar entries and a single heading at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 700 });
    await page.goto("/document#versions");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("#versions")).not.toContainText(
      "Product Roadmap"
    );
    await expect(page.locator("#versions")).not.toContainText(
      "Public API baseline"
    );
    await expect(page.locator("#versions [data-slot=card]")).toHaveCount(
      versions.length
    );
    await expect(page.locator("#versions [data-slot=progress]")).toHaveCount(0);
    expect(
      await page
        .locator('#versions section[data-article-level="1"]')
        .evaluateAll(nodes => nodes.map(node => node.id))
    ).toEqual(versions.map(version => version.id));

    for (const version of versions) {
      if (width < 768)
        await page.locator('[data-slot="sidebar-trigger"]').click();
      const link = page.locator(
        `[data-sidebar="menu-sub-button"][href="#${version.id}"]`
      );
      await expect(link).toContainText(version.title);
      await expect(link).toContainText(version.status);
      await expect(link.locator("[data-article-title]")).toHaveText(
        version.title
      );
      const badgeGap = await link.evaluate(element => {
        const title = element.querySelector("[data-article-title]")!;
        const badge = title.nextElementSibling!;
        return (
          badge.getBoundingClientRect().left -
          title.getBoundingClientRect().right
        );
      });
      expect(badgeGap).toBeGreaterThanOrEqual(4);
      expect(badgeGap).toBeLessThanOrEqual(12);
      const parent = link.locator("xpath=ancestor::li[last()]");
      await expect(
        parent.getByRole("button", { name: "Versions", exact: true })
      ).toBeVisible();
      await link.click();
      await expect(link).toHaveAttribute("data-active", "true");
      if (width < 768) {
        await page.keyboard.press("Escape");
        await expect(page.getByRole("dialog")).toBeHidden();
      }
      const section = page.locator(`[id="${version.id}"]`);
      const heading = section.getByRole("heading", { level: 3 });
      await expect(heading).toHaveCount(1);
      await expect(heading).toContainText(version.title);
      await expect(heading).toContainText(version.status);
      await expect(heading).toBeInViewport();
      const card = section.locator('[data-slot="card"]');
      await expect(card).toHaveCount(1);
      await expect(card).not.toContainText(version.title);
      await expect(card.getByText(version.status, { exact: true })).toHaveCount(
        0
      );
      await expect(
        card.locator('[data-slot="card-header"] [data-slot="card-description"]')
      ).not.toBeEmpty();
      await expect(card.locator("li")).toHaveCount(4);
      const alignment = await section.evaluate(element => {
        const prose = document
          .getElementById("overview")!
          .getBoundingClientRect();
        return [
          element,
          element.querySelector("h3")!,
          element.querySelector('[data-slot="card"]')!,
        ].map(node => {
          const bounds = node.getBoundingClientRect();
          return {
            left: bounds.left - prose.left,
            width: bounds.width - prose.width,
          };
        });
      });
      for (const bounds of alignment) {
        expect(Math.abs(bounds.left)).toBeLessThanOrEqual(1);
        expect(Math.abs(bounds.width)).toBeLessThanOrEqual(1);
      }
      if (version.id === "version-0-3-0") {
        await page.screenshot({ path: test.info().outputPath("versions.png") });
      }
    }
    expect(
      await page
        .locator("article")
        .evaluate(element => element.scrollWidth - element.clientWidth)
    ).toBeLessThanOrEqual(1);
  });
}

test("version deep links and command search target the version subparagraph", async ({
  page,
}) => {
  await page.goto("/document#version-0-2-0");
  await page.waitForLoadState("networkidle");
  await expect(page.locator("#version-0-2-0 > h3")).toBeInViewport();
  await expect(
    page.locator('[href="#version-0-2-0"][data-sidebar]')
  ).toHaveAttribute("data-active", "true");
  await page.keyboard.press("Control+k");
  const search = page.getByRole("dialog", { name: "Search article" });
  await search
    .getByPlaceholder("Search sections or API operations...")
    .fill("v0.1.0");
  await search.getByRole("option").filter({ hasText: "v0.1.0" }).click();
  await expect(search).toBeHidden();
  await expect(page.locator("#version-0-1-0 > h3")).toBeInViewport();
  await expect(
    page.locator('[href="#version-0-1-0"][data-sidebar]')
  ).toHaveAttribute("data-active", "true");
});

test("shared article separators follow their host when no reading cap is specified", async ({
  page,
}) => {
  await page.setViewportSize({ width: 2560, height: 700 });
  await page.goto("/document");
  await page.waitForLoadState("networkidle");
  const widths = await page.locator(".article-content").evaluate(element => {
    (element as HTMLElement).style.setProperty(
      "--article-reading-width",
      "initial"
    );
    const style = getComputedStyle(element);
    const sub = document.getElementById("gateway-root-shelves")!;
    return {
      available:
        element.clientWidth -
        Number.parseFloat(style.paddingLeft) -
        Number.parseFloat(style.paddingRight),
      paragraph: element
        .querySelector('[data-article-separator="paragraph"]')!
        .getBoundingClientRect().width,
      subparagraph: Number.parseFloat(getComputedStyle(sub, "::before").width),
      subParent: sub.getBoundingClientRect().width,
    };
  });
  expect(widths.paragraph).toBeCloseTo(widths.available, 0);
  expect(widths.subparagraph).toBeCloseTo(widths.subParent - 32, 0);
});

test("standalone privacy policy keeps its separators within the reading column", async ({
  page,
}) => {
  await page.goto("/privacy-policy");
  await page.waitForLoadState("networkidle");
  for (const width of [390, 2560]) {
    await page.setViewportSize({ width, height: 700 });
    const shadows = await page
      .locator("section + section")
      .evaluateAll(sections =>
        sections.map(section => getComputedStyle(section, "::before").boxShadow)
      );
    expect(shadows).toHaveLength(7);
    expect(shadows.every(shadow => shadow === "none")).toBe(true);
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth
      )
    ).toBeLessThanOrEqual(1);
  }
});

for (const width of [390, 768, 1024, 1280, 1536, 2560]) {
  test(`article separators keep their hierarchy in both themes at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 700 });
    await page.goto("/document");
    await page.waitForLoadState("networkidle");
    for (const theme of ["dark", "light"]) {
      await page.evaluate(value => {
        document.documentElement.classList.remove("dark", "light");
        document.documentElement.classList.add(value);
      }, theme);
      const lines = await page.evaluate(() => {
        const paragraph = document.querySelector<HTMLElement>(
          '.article-content > [data-article-separator="paragraph"]'
        )!;
        const sub = document.getElementById("version-0-2-0")!;
        const api = document.getElementById("gateway-root-shelves")!;
        const nested = document.getElementById("gateway-rule-http-contract")!;
        const prose = document
          .getElementById("overview")!
          .getBoundingClientRect();
        const content = document.querySelector(".article-content")!;
        const contentStyle = getComputedStyle(content);
        const parentStyle = getComputedStyle(paragraph);
        const subStyle = getComputedStyle(sub, "::before");
        const context = document.createElement("canvas").getContext("2d")!;
        const pixels = [
          parentStyle.borderTopColor,
          subStyle.backgroundColor,
        ].map(color => {
          context.clearRect(0, 0, 1, 1);
          context.fillStyle = color;
          context.fillRect(0, 0, 1, 1);
          return Array.from(context.getImageData(0, 0, 1, 1).data);
        });
        return {
          paragraphWidth: paragraph.getBoundingClientRect().width,
          paragraphOffset:
            (paragraph.getBoundingClientRect().left +
              paragraph.getBoundingClientRect().right -
              prose.left -
              prose.right) /
            2,
          proseWidth: prose.width,
          contentWidth:
            content.clientWidth -
            Number.parseFloat(contentStyle.paddingLeft) -
            Number.parseFloat(contentStyle.paddingRight),
          paragraphThickness: Number.parseFloat(parentStyle.borderTopWidth),
          paragraphSpacing: [
            parentStyle.marginTop,
            parentStyle.marginBottom,
          ].map(Number.parseFloat),
          paragraphGaps: [
            paragraph.getBoundingClientRect().top -
              paragraph.previousElementSibling!.getBoundingClientRect().bottom,
            paragraph.nextElementSibling!.getBoundingClientRect().top -
              paragraph.getBoundingClientRect().bottom,
          ],
          sectionGaps: [
            sub,
            api,
            nested,
            document.getElementById("privacy-use")!,
          ].map(section => {
            const before = getComputedStyle(section, "::before");
            const top = section.getBoundingClientRect().top;
            const padding = Number.parseFloat(
              getComputedStyle(section).paddingTop
            );
            const lineTop = top + padding + Number.parseFloat(before.marginTop);
            return {
              before:
                lineTop -
                section.previousElementSibling!.getBoundingClientRect().bottom,
              after:
                section.querySelector("h3")!.getBoundingClientRect().top -
                lineTop -
                Number.parseFloat(before.height),
              margin: Number.parseFloat(before.marginTop),
              padding,
            };
          }),
          subWidth: Number.parseFloat(subStyle.width),
          subThickness: Number.parseFloat(subStyle.height),
          subParent: sub.getBoundingClientRect().width,
          apiWidth: Number.parseFloat(getComputedStyle(api, "::before").width),
          apiParent: api.getBoundingClientRect().width,
          nestedWidth: Number.parseFloat(
            getComputedStyle(nested, "::before").width
          ),
          firstBefore: getComputedStyle(
            document.getElementById("version-0-3-0")!,
            "::before"
          ).content,
          lastAfter: getComputedStyle(
            document.getElementById("version-0-0-1")!,
            "::after"
          ).content,
          pixels,
          articleWidth: document.querySelector("article")!.clientWidth,
          bleed: [
            parentStyle,
            subStyle,
            getComputedStyle(api, "::before"),
            getComputedStyle(nested, "::before"),
            ...Array.from(
              document.querySelectorAll("#privacy-policy section + section"),
              section => getComputedStyle(section, "::before")
            ),
          ].map(style => ({
            spread: Number.parseFloat(
              style.boxShadow.match(/([\d.]+)px$/)?.[1] ?? "0"
            ),
            clip: style.clipPath,
          })),
          privacyFirstBefore: getComputedStyle(
            document.getElementById("privacy-collection")!,
            "::before"
          ).content,
          privacyLastAfter: getComputedStyle(
            document.getElementById("privacy-contact")!,
            "::after"
          ).content,
        };
      });
      expect(lines.paragraphWidth).toBeGreaterThan(lines.subWidth);
      expect(lines.paragraphWidth).toBeGreaterThan(lines.apiWidth);
      expect(lines.apiWidth).toBeGreaterThan(lines.nestedWidth);
      const readingLimit = width >= 1280 ? 896 : width >= 768 ? 672 : width;
      expect(lines.paragraphWidth).toBeCloseTo(
        Math.min(lines.contentWidth, readingLimit + 32),
        0
      );
      expect(lines.paragraphWidth - lines.proseWidth).toBeLessThanOrEqual(32);
      expect(Math.abs(lines.paragraphOffset)).toBeLessThanOrEqual(1);
      expect(lines.apiWidth).toBeCloseTo(
        Math.min(lines.apiParent - 32, readingLimit),
        0
      );
      expect(lines.subWidth).toBeCloseTo(lines.subParent - 32, 0);
      expect(lines.paragraphThickness).toBe(2);
      expect(lines.paragraphSpacing).toEqual([32, 32]);
      for (const gap of lines.paragraphGaps) expect(gap).toBeCloseTo(32, 0);
      expect(lines.sectionGaps.map(section => section.margin)).toEqual([
        24, 24, 16, 24,
      ]);
      for (const section of lines.sectionGaps) {
        expect(section.padding).toBe(8);
        expect(section.before).toBeCloseTo(section.margin + section.padding, 0);
        expect(section.after).toBeCloseTo(section.margin, 0);
      }
      expect(lines.subThickness).toBe(1);
      expect(lines.pixels[0][3]).toBeGreaterThan(lines.pixels[1][3]);
      if (theme === "dark") expect(lines.pixels[0][0]).toBeGreaterThan(220);
      else expect(lines.pixels[0][0]).toBeLessThan(70);
      expect(lines.firstBefore).toBe("none");
      expect(lines.lastAfter).toBe("none");
      for (const line of lines.bleed) {
        expect(line.spread).toBeGreaterThanOrEqual(lines.articleWidth);
        expect(line.clip).toMatch(/^inset\(0px -[\d.]+px\)$/);
      }
      expect(lines.bleed).toHaveLength(11);
      expect(lines.privacyFirstBefore).toBe("none");
      expect(lines.privacyLastAfter).toBe("none");
      expect(
        await page
          .locator("article")
          .evaluate(element => element.scrollWidth - element.clientWidth)
      ).toBeLessThanOrEqual(1);
      if (theme === "dark" && [390, 1280, 2560].includes(width)) {
        await page.locator("article").evaluate(element => {
          element.scrollTop +=
            document.getElementById("version-0-2-0")!.getBoundingClientRect()
              .top -
            element.getBoundingClientRect().top -
            24;
        });
        await page.screenshot({
          path: test.info().outputPath("separators.png"),
        });
      }
    }
    if (width >= 768) {
      await page.locator('[data-slot="sidebar-trigger"]').click();
      expect(
        await page
          .locator("article")
          .evaluate(element => element.scrollWidth - element.clientWidth)
      ).toBeLessThanOrEqual(1);
    }
  });
}
