import { expect, test } from "@playwright/test";
import type { mountVideoGuideWidget } from "./videoGuideWidgetTestSupport";

declare global {
  interface Window {
    videoGuideWidgetExample: ReturnType<typeof mountVideoGuideWidget>;
  }
}

test.beforeEach(async ({ page }) => {
  test.skip(process.env.E2E_PRODUCTION === "true", "Uses Vite source imports");
  await page.goto("/login");
  await page.waitForLoadState("networkidle");
});

test.afterEach(async ({ page }) => {
  await page.evaluate(() => window.videoGuideWidgetExample?.unmount());
});

for (const width of [390, 1440]) {
  test(`Workspace Overview plays within an isolated ${width}px widget after activation`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 800 });
    const mediaRequests: string[] = [];
    page.on("request", request => {
      if (request.resourceType() === "media") mediaRequests.push(request.url());
    });
    await page.evaluate(async () => {
      const path = "/test/e2e/videoGuideWidgetTestSupport.tsx";
      const { mountVideoGuideWidget } = await import(/* @vite-ignore */ path);
      window.videoGuideWidgetExample = mountVideoGuideWidget();
    });
    const widget = page.locator("#video-guide-widget-test-root");
    const video = widget.locator("video");
    await expect(video).toBeVisible();
    await page.waitForLoadState("networkidle");
    expect(await page.evaluate(() => window.crossOriginIsolated)).toBe(true);
    await expect(widget.locator("iframe")).toHaveCount(0);
    await expect(video).toHaveAttribute("preload", "none");
    await expect(video).toHaveAttribute("controls", "");
    await expect(video).toHaveAttribute("playsinline", "");
    await expect(video).not.toHaveAttribute("autoplay");
    await expect(video).toHaveAttribute("src", /workspace-overview.*\.mp4/);
    await expect(video).toHaveAttribute("poster", /workspace-overview.*\.png/);
    await expect(video).toHaveCSS("object-fit", "contain");
    expect(mediaRequests).toEqual([]);
    expect(
      await widget.evaluate(
        element => element.scrollWidth - element.clientWidth
      )
    ).toBeLessThanOrEqual(1);
    await page.screenshot({
      path: testInfo.outputPath("walkthrough-poster.png"),
    });

    await video.evaluate(element => (element as HTMLVideoElement).play());
    await expect
      .poll(() =>
        video.evaluate(element => (element as HTMLVideoElement).currentTime)
      )
      .toBeGreaterThan(0);
    await video.evaluate(element => (element as HTMLVideoElement).pause());
    expect(mediaRequests.length).toBeGreaterThan(0);
    expect(
      await video.evaluate(element => (element as HTMLVideoElement).videoWidth)
    ).toBeGreaterThan(0);
    expect(await page.evaluate(() => window.crossOriginIsolated)).toBe(true);
    await page.screenshot({
      path: testInfo.outputPath("walkthrough-playing.png"),
    });
  });
}

test("saved custom video URLs keep their own source without the built-in poster", async ({
  page,
}) => {
  await page.evaluate(async () => {
    const path = "/test/e2e/videoGuideWidgetTestSupport.tsx";
    const { mountVideoGuideWidget } = await import(/* @vite-ignore */ path);
    window.videoGuideWidgetExample = mountVideoGuideWidget({
      videoURL: "/custom-walkthrough.mp4",
    });
  });
  const video = page.locator("#video-guide-widget-test-root video");
  await expect(video).toHaveAttribute("src", "/custom-walkthrough.mp4");
  await expect(video).not.toHaveAttribute("poster");
  await expect(video).toHaveAttribute("preload", "none");
});
