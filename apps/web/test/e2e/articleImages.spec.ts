import { expect, test } from "@playwright/test";

const imagePattern = /\/(?:images|videos)\/[^/]+\.(?:png|jpe?g|gif)(?:\?.*)?$/;
const imageBody =
  '<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1200"><rect width="1600" height="1200" fill="#6688aa"/></svg>';

test.beforeEach(async ({ page }) => {
  await page.route("https://www.youtube-nocookie.com/embed/**", route =>
    route.fulfill({ contentType: "text/html", body: "<p>Player fixture</p>" })
  );
});

test("document images keep their placeholder until loaded, then reveal from blur without resizing", async ({
  page,
}) => {
  const hydrationErrors: string[] = [];
  page.on("console", message => {
    if (/hydrat/i.test(message.text())) hydrationErrors.push(message.text());
  });
  let releaseImage!: () => void;
  const pendingImage = new Promise<void>(resolve => {
    releaseImage = resolve;
  });
  await page.route(imagePattern, async route => {
    if (route.request().resourceType() !== "image") return route.continue();
    if (route.request().url().includes("dashboard-overview.png")) {
      await pendingImage;
    }
    await route.fulfill({ contentType: "image/svg+xml", body: imageBody });
  });
  await page.goto("/document", { waitUntil: "domcontentloaded" });
  const image = page.locator("#website [data-slot=image]").first();
  await image.scrollIntoViewIfNeeded();
  await expect(image).toHaveAttribute("data-loading-status", "loading");
  await expect(image).toHaveCSS("opacity", "0");
  const bounds = await image.locator("..").boundingBox();
  await page.addStyleTag({
    content: "[data-slot=image] { animation-play-state: paused !important; }",
  });
  releaseImage();
  await expect(image).toHaveAttribute("data-loading-status", "loaded");
  await expect(image).toHaveCSS("filter", "blur(8px)");
  await expect(image.locator("..")).toHaveCSS("overflow", "hidden");
  expect(await image.locator("..").boundingBox()).toEqual(bounds);
  const halfwayBlur = await image.evaluate(element => {
    const animation = element.getAnimations()[0];
    animation.currentTime = 175;
    return Number.parseFloat(getComputedStyle(element).filter.slice(5));
  });
  expect(halfwayBlur).toBeGreaterThan(0);
  expect(halfwayBlur).toBeLessThan(8);
  await image.evaluate(element => element.getAnimations()[0].finish());
  await expect(image).toHaveCSS("filter", "none");
  await expect(image).toHaveCSS("opacity", "1");

  // All generated Website media share the same component, including GIFs.
  const figures = page.locator("#website [data-article-image]");
  await expect(figures).toHaveCount(25);
  for (const figure of await figures.all()) {
    await figure.scrollIntoViewIfNeeded();
    await expect(figure.locator("img")).toHaveAttribute(
      "data-loading-status",
      "loaded"
    );
  }
  expect(hydrationErrors).toEqual([]);
});

for (const setting of ["system", "preference"] as const) {
  test(`${setting} reduced motion displays loaded images without the blur animation`, async ({
    page,
  }) => {
    await page.route(imagePattern, route =>
      route.request().resourceType() === "image"
        ? route.fulfill({ contentType: "image/svg+xml", body: imageBody })
        : route.continue()
    );
    await page.emulateMedia({
      reducedMotion: setting === "system" ? "reduce" : "no-preference",
    });
    await page.goto("/document");
    await page.waitForLoadState("networkidle");
    if (setting === "preference") {
      await page.locator("html").evaluate(element => {
        element.setAttribute("data-reduce-motion", "true");
      });
    }
    const image = page.locator("#website [data-slot=image]").first();
    await image.scrollIntoViewIfNeeded();
    await expect(image).toHaveAttribute("data-loading-status", "loaded");
    await expect(image).toHaveCSS("opacity", "1");
    await expect(image).toHaveCSS("filter", "none");
    await expect(image).toHaveCSS("animation-name", "none");
    await page.reload();
    await image.scrollIntoViewIfNeeded();
    await expect(image).toHaveAttribute("data-loading-status", "loaded");
  });
}

test("failed document images keep the existing unavailable message", async ({
  page,
}) => {
  await page.route(imagePattern, route =>
    route.request().resourceType() === "image"
      ? route.abort()
      : route.continue()
  );
  await page.goto("/document");
  const figure = page.locator('#website [data-article-image="image"]').first();
  await figure.scrollIntoViewIfNeeded();
  await expect(figure.getByRole("img")).not.toHaveJSProperty("tagName", "IMG");
  await expect(figure.getByRole("img")).toHaveText(
    "Media could not be loaded."
  );
});
