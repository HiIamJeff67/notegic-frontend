import { expect, test } from "@playwright/test";

const imageBody =
  '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><rect width="320" height="180" fill="#6688aa"/></svg>';

test("shared images report load, replacement and failure, preserve native events and avatar fallback", async ({
  page,
}) => {
  test.skip(
    process.env.E2E_PRODUCTION === "true",
    "Uses a Vite component fixture."
  );
  let releaseReplacement!: () => void;
  const pendingReplacement = new Promise<void>(resolve => {
    releaseReplacement = resolve;
  });
  await page.route("**/__image__/**", async route => {
    if (route.request().url().endsWith("failed.svg")) return route.abort();
    if (route.request().url().endsWith("second.svg")) await pendingReplacement;
    await route.fulfill({ contentType: "image/svg+xml", body: imageBody });
  });
  await page.route("https://www.youtube-nocookie.com/embed/**", route =>
    route.fulfill({ contentType: "text/html", body: "<p>Player fixture</p>" })
  );
  await page.goto("/document");
  await page.waitForLoadState("networkidle");
  await page.evaluate(async () => {
    const path = "/test/e2e/imageTestSupport.tsx";
    const { mountImages } = await import(/* @vite-ignore */ path);
    mountImages();
  });
  const root = page.locator("#image-test-root");
  const image = root.getByRole("img", { name: "Shared image", exact: true });
  await expect(image).toHaveAttribute("data-loading-status", "loaded");
  await expect(image).toHaveAttribute("loading", "eager");
  await expect(image).toHaveCSS("--image-reveal-blur", "4px");
  await expect(image).toHaveCSS("animation-duration", "0.6s");
  await root
    .getByRole("button", { name: "Disable reveal", exact: true })
    .click();
  await expect(image).toHaveCSS("animation-name", "none");
  await expect(image).toHaveCSS("opacity", "1");
  await root
    .getByRole("button", { name: "Enable reveal", exact: true })
    .click();
  await expect(
    root.getByRole("img", { name: "Avatar", exact: true })
  ).toHaveAttribute("data-loading-status", "loaded");
  const hoverImage = root.locator("img").last();
  await expect(hoverImage).toHaveAttribute("src", "/__image__/first.svg");
  await root.getByRole("button", { name: "Replace", exact: true }).click();
  await expect(image).toHaveAttribute("data-loading-status", "loading");
  await expect(root.locator("output")).toHaveText("loading");
  await root.getByRole("button", { name: "Retry", exact: true }).click();
  await expect(image).toHaveAttribute("data-loading-status", "loaded");
  await root.getByRole("button", { name: "Replace", exact: true }).click();
  await expect(image).toHaveAttribute("data-loading-status", "loading");
  releaseReplacement();
  await expect(image).toHaveAttribute("data-loading-status", "loaded");
  await expect(root.locator("output")).toHaveText("loaded");
  await root.getByRole("button", { name: "Fail", exact: true }).click();
  await expect(root.locator("output")).toHaveText("error");
  await expect(
    root.getByRole("img", { name: "Avatar", exact: true })
  ).toHaveCount(0);
  await expect(root.getByText("F", { exact: true })).toBeVisible();
  await root.getByRole("button", { name: "Retry", exact: true }).click();
  await expect(image).toHaveAttribute("data-loading-status", "loaded");
  await expect(
    root.getByRole("img", { name: "Avatar", exact: true })
  ).toHaveAttribute("data-loading-status", "loaded");
  const events = await page.evaluate(async () => {
    const path = "/test/e2e/imageTestSupport.tsx";
    const { imageStatuses, imageEvents } = await import(
      /* @vite-ignore */ path
    );
    return { imageStatuses, imageEvents };
  });
  expect(events.imageStatuses).toEqual([
    "loading",
    "loaded",
    "loading",
    "loading",
    "loaded",
    "loading",
    "loaded",
    "loading",
    "error",
    "loading",
    "loaded",
  ]);
  expect(events.imageEvents).toEqual(["load", "load", "load", "error", "load"]);

  await root
    .getByRole("button", { name: "Upload preview", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog.locator('input[type="file"]').setInputFiles({
    name: "preview.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aZz8AAAAASUVORK5CYII=",
      "base64"
    ),
  });
  const preview = dialog.getByRole("img", { name: "preview.png", exact: true });
  await expect(preview).toHaveAttribute("data-loading-status", "loaded");
  const url = await preview.getAttribute("src");
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  const revoked = await page.evaluate(async url => {
    try {
      await fetch(url!);
      return false;
    } catch {
      return true;
    }
  }, url);
  expect(revoked).toBe(true);
});
