import { expect, test } from "@playwright/test";

test("starts the local database without migration errors", async ({ page }) => {
  await page.addInitScript(() => {
    const originalPostMessage = Worker.prototype.postMessage;
    const sendPostMessage = originalPostMessage as (
      message: unknown,
      transfer?: Transferable[] | StructuredSerializeOptions
    ) => void;
    Worker.prototype.postMessage = function (
      this: Worker,
      message: unknown,
      transfer?: Transferable[] | StructuredSerializeOptions
    ) {
      if (
        typeof message === "object" &&
        message !== null &&
        "type" in message &&
        message.type === "config"
      ) {
        setTimeout(() => sendPostMessage.call(this, message, transfer), 250);
        return;
      }
      return sendPostMessage.call(this, message, transfer);
    } as typeof Worker.prototype.postMessage;
  });

  const localDatabaseErrors: string[] = [];
  const pages = [page, await page.context().newPage()];

  for (const currentPage of pages) {
    currentPage.on("console", message => {
      if (
        message.type() === "error" &&
        /local database|local yjs|transaction synchronization|migration|opfs|driver not initialized|pragma user_version/i.test(
          message.text()
        )
      ) {
        localDatabaseErrors.push(message.text());
      }
    });

    currentPage.on("pageerror", error => {
      if (
        /local database|local yjs|transaction synchronization|migration|opfs|driver not initialized|pragma user_version/i.test(
          error.message
        )
      ) {
        localDatabaseErrors.push(error.message);
      }
    });
  }

  await Promise.all(
    pages.map(async currentPage => {
      await currentPage.goto("/");
      await currentPage.waitForLoadState("networkidle");
    })
  );

  for (const currentPage of pages) {
    await expect(
      currentPage.getByRole("button", { name: "Get Started" })
    ).toBeVisible();
  }

  await page.reload();
  await page.waitForLoadState("networkidle");
  await expect(page.getByRole("button", { name: "Get Started" })).toBeVisible();
  expect(localDatabaseErrors).toEqual([]);

  await pages[1].close();
});
