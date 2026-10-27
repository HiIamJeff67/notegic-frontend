import { expect, test } from "@playwright/test";
import type { mountCalendarWidgets } from "./calendarWidgetTestSupport";

declare global {
  interface Window {
    calendarWidgetExample: ReturnType<typeof mountCalendarWidgets>;
  }
}

test.beforeEach(async ({ page }) => {
  test.skip(process.env.E2E_PRODUCTION === "true", "Uses Vite source imports");
  // August 2026 needs six rows, including the last day on the bottom row.
  await page.clock.setFixedTime(new Date("2026-08-15T12:00:00"));
  await page.goto("/document");
  await page.waitForLoadState("networkidle");
});

test.afterEach(async ({ page }) => {
  await page.evaluate(() => window.calendarWidgetExample?.unmount());
});

for (const density of ["compact", "comfortable"]) {
  for (const frameSize of [80, 100, 140]) {
    test(`all Calendar frames fit with ${frameSize}px cells in ${density} density`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.evaluate(
        async ({ density, frameSize }) => {
          document.documentElement.dataset.density = density;
          const path = "/test/e2e/calendarWidgetTestSupport.tsx";
          const { mountCalendarWidgets } = await import(
            /* @vite-ignore */ path
          );
          window.calendarWidgetExample = mountCalendarWidgets(frameSize);
        },
        { density, frameSize }
      );
      const calendars = page.locator(
        "#calendar-widget-test-root [data-slot=calendar]"
      );
      await expect(calendars).toHaveCount(3);
      for (const calendar of await calendars.all()) {
        await expect(calendar.locator("tbody tr")).toHaveCount(6);
        await expect(calendar.locator("tbody button")).toHaveCount(42);
        const clipped = await calendar.evaluate(element => {
          const bounds = element.parentElement!.getBoundingClientRect();
          return Array.from(
            element.querySelectorAll("button, th, select")
          ).flatMap(control => {
            const rect = control.getBoundingClientRect();
            return rect.left < bounds.left + 1 ||
              rect.right > bounds.right - 1 ||
              rect.top < bounds.top + 1 ||
              rect.bottom > bounds.bottom - 1
              ? [control.outerHTML.slice(0, 180)]
              : [];
          });
        });
        expect(clipped).toEqual([]);
        const nonSquareDays = await calendar
          .locator("tbody button")
          .evaluateAll(buttons =>
            buttons.flatMap(button => {
              const rect = button.getBoundingClientRect();
              const cell = button.parentElement!.getBoundingClientRect();
              return Math.abs(rect.width - rect.height) > 0.5 ||
                Math.abs(rect.x - cell.x) > 0.5 ||
                Math.abs(rect.y - cell.y) > 0.5 ||
                Math.abs(rect.width - cell.width) > 0.5 ||
                Math.abs(rect.height - cell.height) > 0.5
                ? [button.getAttribute("data-day")]
                : [];
            })
          );
        expect(nonSquareDays).toEqual([]);
        for (const day of ["8/14/2026", "8/15/2026"]) {
          const button = calendar.locator(`button[data-day="${day}"]`);
          await button.hover();
          expect(
            await button.evaluate(element => {
              const button = getComputedStyle(element);
              const cell = getComputedStyle(element.parentElement!);
              return (
                button.borderRadius === cell.borderRadius &&
                parseFloat(button.borderRadius) > 0
              );
            })
          ).toBe(true);
        }
        const lastDay = calendar.locator('button[data-day="8/31/2026"]');
        await lastDay.click();
        await expect(lastDay).toHaveAttribute("data-selected-single", "true");
        await calendar
          .getByRole("button", { name: "Go to the Next Month" })
          .click();
        await expect(
          calendar.locator('select[aria-label="Choose the Month"]')
        ).toHaveValue("8");
        await calendar
          .getByRole("button", { name: "Go to the Previous Month" })
          .click();
      }
    });
  }
}

test("resizes the mounted calendars at narrow viewports without losing selection", async ({
  page,
}) => {
  await page.evaluate(async () => {
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");
    const path = "/test/e2e/calendarWidgetTestSupport.tsx";
    const { mountCalendarWidgets } = await import(/* @vite-ignore */ path);
    window.calendarWidgetExample = mountCalendarWidgets(120);
  });
  const calendars = page.locator(
    "#calendar-widget-test-root [data-slot=calendar]"
  );
  await expect(calendars).toHaveCount(3);
  for (const calendar of await calendars.all()) {
    await calendar.locator('button[data-day="8/31/2026"]').click();
  }
  for (const [width, zoom] of [
    [1440, 1],
    [1024, 1],
    [768, 1],
    [390, 1],
    [320, 1],
    [390, 1.25],
  ]) {
    await page.setViewportSize({ width, height: 900 });
    const frameSize = width >= 1024 ? 120 : 80;
    await page.evaluate(
      ({ frameSize, zoom }) => {
        document.body.style.zoom = String(zoom);
        window.calendarWidgetExample.resize(frameSize);
      },
      { frameSize, zoom }
    );
    await expect(calendars.first().locator("..")).toHaveCSS(
      "width",
      `${frameSize * 2 - 6}px`
    );
    for (const calendar of await calendars.all()) {
      await expect(
        calendar.locator('button[data-day="8/31/2026"]')
      ).toHaveAttribute("data-selected-single", "true");
      expect(
        await calendar.evaluate(element => {
          const bounds = element.parentElement!.getBoundingClientRect();
          return Array.from(
            element.querySelectorAll("button, th, select")
          ).every(control => {
            const rect = control.getBoundingClientRect();
            return (
              rect.left >= bounds.left + 1 &&
              rect.right <= bounds.right - 1 &&
              rect.top >= bounds.top + 1 &&
              rect.bottom <= bounds.bottom - 1
            );
          });
        })
      ).toBe(true);
    }
  }
});
