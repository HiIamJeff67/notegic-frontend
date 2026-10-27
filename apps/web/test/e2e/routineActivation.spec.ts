import { expect, test } from "@playwright/test";
import { toCrossJSONAsync } from "seroval";

for (const mode of ["default", "legacy", "weekly"] as const) {
  test(`Routine settings preserve ${mode} activation intent`, async ({
    page,
  }) => {
    test.skip(
      process.env.E2E_PRODUCTION === "true",
      "Imports Vite fixture modules"
    );
    await page.goto("/");
    await page.locator("html[data-density]").waitFor();
    await page.route("**/_serverFn/**", async route => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        headers: { "x-tss-serialized": "true" },
        body: JSON.stringify(
          await toCrossJSONAsync({
            result: {
              success: true,
              exception: null,
              embedded: { publicId: "activation-fixture" },
              data: {
                id: "12345678-1234-4234-8234-123456789abc",
                stationId: "22345678-1234-4234-8234-123456789abc",
                title: "Activation fixture",
                description: "",
                timeoutSeconds: 300,
                phase: null,
                isActive: false,
                hasCustomSchedule: mode === "legacy",
                definitionVersion: 1,
                isPinned: false,
                scheduledStartAt: new Date("2026-09-29T06:00:00Z"),
                scheduledEndAt: new Date("2026-09-29T07:00:00Z"),
                period: mode === "weekly" ? "Weekly" : null,
                timezone: "UTC",
                deletedAt: null,
                createdAt: new Date("2026-09-29T00:00:00Z"),
                updatedAt: new Date("2026-09-29T00:00:00Z"),
                tagIds: [],
                taskIds: [],
                itemIds: [],
              },
            },
          })
        ),
      });
    });
    await page.evaluate(async () => {
      const path = "/test/e2e/routineActivationTestSupport.tsx";
      const { mountRoutineActivationInspector } = await import(
        /* @vite-ignore */ path
      );
      await mountRoutineActivationInspector();
    });
    const custom = page.locator("#routine-inspector-custom-schedule");
    await expect(page.locator("#routine-inspector-title")).toHaveValue(
      "Activation fixture"
    );
    if (mode === "weekly") {
      await expect(custom).toBeChecked();
      await expect(custom).toBeDisabled();
      return;
    }
    if (mode === "legacy") {
      await expect(custom).toBeChecked();
      await custom.click();
    }
    await expect(custom).not.toBeChecked();
    await expect(
      page.getByText("Starts when activated rather than at a fixed date.")
    ).toBeVisible();
    await page.locator("#routine-inspector-active").click();
    await page.getByRole("button", { name: "Save", exact: true }).click();
    const result = page.getByLabel("Submitted routine");
    await expect
      .poll(async () => JSON.parse((await result.textContent())!))
      .toMatchObject({
        isActive: true,
        hasCustomSchedule: false,
      });
    const values = JSON.parse((await result.textContent())!);
    expect(values).not.toHaveProperty("scheduledStartAt");
    expect(values).not.toHaveProperty("scheduledEndAt");
  });
}
