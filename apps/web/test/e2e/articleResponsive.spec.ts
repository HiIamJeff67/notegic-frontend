import { expect, test } from "@playwright/test";

for (const width of [320, 390, 767, 768, 900, 1024, 1280, 1440, 1536, 2560]) {
  test(`document tables stay reachable within a ${width}px viewport`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/document");
    await page.waitForLoadState("networkidle");

    const article = page.locator("article");
    expect(
      await article.evaluate(
        element => element.scrollWidth - element.clientWidth
      )
    ).toBeLessThanOrEqual(1);
    expect(
      await page
        .locator('[data-slot="sidebar-wrapper"] > div')
        .evaluate(element => element.getBoundingClientRect().right)
    ).toBeLessThanOrEqual(width);
    expect(
      await page
        .locator(".article-content")
        .evaluate(element => element.getBoundingClientRect().width)
    ).toBeLessThanOrEqual(
      width >= 1536 ? 1280 : width >= 1280 ? 1152 : width >= 768 ? 896 : width
    );
    const readingLimit = width >= 1280 ? 896 : width >= 768 ? 672 : width;
    const prose = page.locator(
      "#overview, #quick-start, #versions, #versions section, #versions h3, #versions [data-slot=card], #privacy-policy, #gateway > header, #gateway-contract, #gateway-rules, #gateway-root-shelves > h3, #gateway-root-shelves > div > p"
    );
    for (const element of await prose.all()) {
      expect(
        await element.evaluate(node => node.getBoundingClientRect().width)
      ).toBeLessThanOrEqual(readingLimit);
    }
    const table = page.locator("#gateway-root-shelves table");
    await expect(table.locator("thead th")).toHaveCount(6);
    await expect(
      table.getByRole("columnheader", { name: "Description", exact: true })
    ).toBeVisible();
    await expect(
      table.getByRole("columnheader", { name: "Operation", exact: true })
    ).toBeVisible();
    expect(
      await page
        .locator("#gateway table tbody td")
        .evaluateAll(
          cells =>
            cells.filter(cell => cell.scrollWidth > cell.clientWidth + 1).length
        )
    ).toBe(0);
    const viewport = table.locator("..");
    expect(
      await viewport.evaluate(element => element.getBoundingClientRect().right)
    ).toBeLessThanOrEqual(width);
    const availableWidth = await viewport.evaluate(
      element => element.clientWidth
    );
    if (availableWidth >= 768) {
      expect(
        await viewport.evaluate(
          element => element.scrollWidth - element.clientWidth
        )
      ).toBeLessThanOrEqual(1);
    }

    const trigger = table
      .getByRole("button", { name: "Expand details", exact: true })
      .first();
    await trigger.click();
    await expect(
      table.getByRole("button", { name: "Collapse details", exact: true })
    ).toBeInViewport();
    const columns = await table
      .locator('td[colspan="6"] > div')
      .evaluate(
        element =>
          getComputedStyle(element).gridTemplateColumns.split(" ").length
      );
    expect(columns).toBe(availableWidth >= 768 ? 2 : 1);
    expect(
      await article.evaluate(
        element => element.scrollWidth - element.clientWidth
      )
    ).toBeLessThanOrEqual(1);
    const response = table.getByRole("button", {
      name: "Toggle 200 response details",
      exact: true,
    });
    await response.click();
    await expect(
      table.getByText("Response body", { exact: true })
    ).toBeVisible();
  });
}

for (const width of [320, 768, 900, 1280, 2560]) {
  test(`all Website sections keep their reading width at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 600 });
    await page.goto("/document#website");
    await page.waitForLoadState("networkidle");
    const pageIds = [
      "website",
      "api-keys",
      "api-key-management",
      "notegic-model",
      "root-shelves",
      "sub-shelves",
      "materials",
      "block-packs",
      "blocks",
      "stations",
      "routines",
      "routine-tasks",
      "routine-tags",
      "routine-task-dependencies",
      "integration-patterns",
      "q-and-a",
    ];
    for (const id of pageIds) {
      await page.evaluate(value => {
        window.location.hash = value;
      }, id);
      await expect(page.locator(`section[id="${id}"]`)).toBeVisible();
      await expect(
        page.locator(".article-content > section:visible")
      ).toHaveCount(5);
      const content = page.locator("#website");
      expect(
        await content.evaluate(element => element.getBoundingClientRect().width)
      ).toBeLessThanOrEqual(width >= 1280 ? 896 : width >= 768 ? 672 : width);
      expect(
        await content.evaluate(
          element => element.scrollWidth - element.clientWidth
        )
      ).toBeLessThanOrEqual(1);
      expect(
        await page
          .locator("article")
          .evaluate(element => element.getBoundingClientRect().right)
      ).toBeLessThanOrEqual(width);
    }
    const question = page.locator("#q-and-a").getByRole("button").last();
    await question.focus();
    await question.press("Enter");
    await expect(question).toHaveAttribute("aria-expanded", "true");
    expect(
      await page
        .locator("article")
        .evaluate(node => node.scrollWidth - node.clientWidth)
    ).toBeLessThanOrEqual(1);
    await expect(
      page.locator('.article-content > div[aria-hidden="true"]')
    ).toHaveCSS("height", "0px");
  });
}

test("page width caps grow at breakpoints and stay centered with either sidebar state", async ({
  page,
}) => {
  await page.goto("/document");
  await page.waitForLoadState("networkidle");
  for (const width of [1024, 1280, 1536, 2560]) {
    await page.setViewportSize({ width, height: 700 });
    for (const state of ["expanded", "collapsed"]) {
      if (state === "collapsed")
        await page.locator('[data-slot="sidebar-trigger"]').click();
      const gap = page.locator('[data-slot="sidebar-gap"]');
      await expect(gap).toHaveCSS(
        "width",
        state === "expanded" ? "256px" : "0px"
      );
      const layout = await page
        .locator(".article-content")
        .evaluate(element => {
          const bounds = element.getBoundingClientRect();
          const parent = element.parentElement!.getBoundingClientRect();
          return {
            width: bounds.width,
            limit: getComputedStyle(element).maxWidth,
            offset:
              (bounds.left + bounds.right - parent.left - parent.right) / 2,
          };
        });
      const limit = width >= 1536 ? 1280 : width >= 1280 ? 1152 : 896;
      expect(layout.limit).toBe(`${limit}px`);
      expect(layout.width).toBeCloseTo(
        Math.min(limit, width - (state === "expanded" ? 256 : 0)),
        0
      );
      expect(Math.abs(layout.offset)).toBeLessThanOrEqual(1);
    }
    await page.locator('[data-slot="sidebar-trigger"]').click();
  }
});

for (const width of [390, 900, 1280, 2560]) {
  test(`version progress stays below the description when toggled at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 700 });
    await page.goto("/document#versions");
    await page.waitForLoadState("networkidle");
    for (const card of await page
      .locator('#versions [data-slot="card"]')
      .all()) {
      const header = card.locator('[data-slot="card-header"]');
      const readProgressPosition = () =>
        header.evaluate(element => {
          const description = element
            .querySelector('[data-slot="card-description"]')!
            .getBoundingClientRect();
          const progress = element
            .querySelector('[data-slot="ring"]')!
            .parentElement!.getBoundingClientRect();
          return {
            gap: progress.top - description.bottom,
            offset: progress.top - element.getBoundingClientRect().top,
          };
        });
      const initial = await readProgressPosition();
      expect(initial.gap).toBeCloseTo(16, 0);
      await expect(header).toHaveCSS("align-content", "flex-start");
      const expand = card.getByRole("button", {
        name: /^Show all \d+ features$/,
      });
      const total = Number((await expand.innerText()).match(/\d+/)![0]);
      await expand.click();
      await expect(card.locator("li")).toHaveCount(total);
      const expanded = await readProgressPosition();
      expect(expanded.gap).toBeCloseTo(16, 0);
      expect(expanded.offset).toBeCloseTo(initial.offset, 0);
      await card
        .getByRole("button", { name: "Show less", exact: true })
        .click();
      await expect(card.locator("li")).toHaveCount(4);
      const collapsed = await readProgressPosition();
      expect(collapsed.gap).toBeCloseTo(16, 0);
      expect(collapsed.offset).toBeCloseTo(initial.offset, 0);
    }
  });
}

test("version cards respond to their own width and keep all expanded features reachable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 2560, height: 700 });
  await page.goto("/document#versions");
  await page.waitForLoadState("networkidle");
  const cards = page.locator('#versions [data-slot="card"]');
  await expect(cards).toHaveCount(4);
  for (const card of await cards.all()) {
    await expect(card.locator("li")).toHaveCount(4);
    const expand = card.getByRole("button", {
      name: /^Show all \d+ features$/,
    });
    const total = Number((await expand.innerText()).match(/\d+/)![0]);
    await expand.focus();
    await expand.press("Enter");
    await expect(card.locator("li")).toHaveCount(total);
    for (const width of [320, 640, 767, 770, 900, 1024]) {
      await card.evaluate((element, value) => {
        element.style.width = `${value}px`;
      }, width);
      const layout = await card.evaluate(element => {
        const content = element.querySelector<HTMLElement>(
          '[data-slot="card-content"]'
        )!;
        const grid = content.querySelector("ul")!;
        const style = getComputedStyle(content);
        return {
          direction: getComputedStyle(element.firstElementChild!).flexDirection,
          available: element.clientWidth,
          featureWidth:
            content.clientWidth -
            Number.parseFloat(style.paddingLeft) -
            Number.parseFloat(style.paddingRight),
          columns: getComputedStyle(grid).gridTemplateColumns.split(" ").length,
          overflow: element.scrollWidth - element.clientWidth,
        };
      });
      expect(layout.direction).toBe(layout.available >= 672 ? "row" : "column");
      expect(layout.columns).toBe(layout.featureWidth >= 512 ? 2 : 1);
      expect(layout.overflow).toBeLessThanOrEqual(1);
      expect(
        await card
          .locator("li")
          .evaluateAll(
            nodes =>
              nodes.filter(node => node.scrollWidth > node.clientWidth + 1)
                .length
          )
      ).toBe(0);
    }
    await card.getByRole("button", { name: "Show less", exact: true }).click();
    await expect(card.locator("li")).toHaveCount(4);
    await card.evaluate(element => {
      element.style.removeProperty("width");
    });
  }
});

test("version cards keep their reading cap when the sidebar closes", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1024, height: 600 });
  await page.goto("/document#versions");
  await page.waitForLoadState("networkidle");
  const layout = page.locator('#versions [data-slot="card"] > div').first();
  await expect(layout).toHaveCSS("flex-direction", "column");
  await page.locator('[data-slot="sidebar-trigger"]').click();
  await expect(layout).toHaveCSS("flex-direction", "column");
  await expect(page.locator("#versions")).toHaveCSS("width", "672px");
  await page.locator('[data-slot="sidebar-trigger"]').click();
  await expect(layout).toHaveCSS("flex-direction", "column");
  await page.setViewportSize({ width: 1280, height: 600 });
  await expect(page.locator("#versions")).toHaveCSS("width", "896px");
  await expect(layout).toHaveCSS("flex-direction", "row");
});

for (const width of [320, 767]) {
  test(`the mobile sidebar remains usable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 520 });
    await page.goto("/document#website");
    await page.waitForLoadState("networkidle");
    const trigger = page.locator('[data-slot="sidebar-trigger"]');
    await trigger.focus();
    await trigger.press("Enter");
    const sidebar = page.getByRole("dialog");
    await expect(sidebar).toBeVisible();
    expect(
      await sidebar.evaluate(node => node.getBoundingClientRect().right)
    ).toBeLessThanOrEqual(width);
    await sidebar.getByRole("link", { name: "Q&A", exact: true }).click();
    await page.keyboard.press("Escape");
    await expect(sidebar).toBeHidden();
    await expect(trigger).toBeInViewport();
    await expect(page.locator("#q-and-a")).toBeVisible();
  });
}

for (const size of [
  { width: 390, height: 520 },
  { width: 1024, height: 600 },
  { width: 1280, height: 720 },
  { width: 2560, height: 900 },
]) {
  test(`document end spacing stays minimal at ${size.width}x${size.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(size);
    await page.goto("/document");
    await page.waitForLoadState("networkidle");
    const article = page.locator("article");
    const spacer = page.locator('.article-content > div[aria-hidden="true"]');
    const expected = await article.evaluate(element => {
      const last = element.querySelector("#privacy-policy")!;
      const content = element.querySelector(".article-content")!;
      return Math.max(
        0,
        element.clientHeight -
          last.getBoundingClientRect().height -
          Number.parseFloat(getComputedStyle(content).paddingBottom)
      );
    });
    await expect(spacer).toHaveCSS("height", `${expected}px`);
    await article.evaluate(element => {
      const last = element.querySelector("#privacy-policy")!;
      element.scrollTop +=
        last.getBoundingClientRect().top - element.getBoundingClientRect().top;
    });
    expect(
      Math.abs(
        await article.evaluate(
          element =>
            element.querySelector("#privacy-policy")!.getBoundingClientRect()
              .top - element.getBoundingClientRect().top
        )
      )
    ).toBeLessThanOrEqual(1);
    await article.evaluate(element => {
      element.scrollTop = element.scrollHeight;
    });
    const endGap = await article.evaluate(element => {
      const last = element.querySelector("#privacy-contact > div")!;
      return (
        element.getBoundingClientRect().bottom -
        last.getBoundingClientRect().bottom
      );
    });
    expect(endGap).toBeGreaterThanOrEqual(32);
    if (size.width >= 768) {
      await expect(
        page.getByRole("button", { name: "Privacy and policy", exact: true })
      ).toHaveAttribute("data-active", "true");
    }
  });
}

for (const zoom of [0.8, 1.25, 1.5]) {
  test(`article bottom padding remains visible at ${zoom * 100}% layout zoom`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    for (const path of ["/document", "/document#q-and-a"]) {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      await page.evaluate(value => {
        document.documentElement.style.zoom = String(value);
      }, zoom);
      const article = page.locator("article");
      await article.evaluate(element => {
        element.scrollTop = element.scrollHeight;
      });
      await expect
        .poll(() =>
          article.evaluate(element => {
            const content = element.querySelector(".article-content")!;
            const sections = Array.from(
              content.querySelectorAll<HTMLElement>(
                ':scope > section[data-article-level="0"]'
              )
            );
            const last = sections
              .filter(section => getComputedStyle(section).display !== "none")
              .at(-1)!;
            const rect = last.getBoundingClientRect();
            const zoom = Number(
              getComputedStyle(document.documentElement).zoom
            );
            return (
              (element.getBoundingClientRect().bottom - rect.bottom) / zoom
            );
          })
        )
        .toBeGreaterThanOrEqual(31);
    }
  });
}
