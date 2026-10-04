import { createServer, type Server, type ServerResponse } from "node:http";
import { expect, test } from "@playwright/test";

test.describe("@feedback browser submission", () => {
  test.skip(
    process.env.E2E_FEEDBACK_API_URL !== "http://127.0.0.1:4174",
    "Set E2E_FEEDBACK_API_URL=http://127.0.0.1:4174 to use the isolated gateway fixture"
  );
  test.describe.configure({ mode: "serial" });

  let server: Server;
  let requests: { key: string; body: Record<string, unknown> }[];
  let heldResponse: ServerResponse | null;
  let holdFirst: boolean;

  test.beforeAll(async () => {
    server = createServer(async (request, response) => {
      if (!request.url?.endsWith("/feedback/reports")) {
        response.writeHead(404).end();
        return;
      }
      const chunks: Buffer[] = [];
      for await (const chunk of request) chunks.push(Buffer.from(chunk));
      requests.push({
        key: String(request.headers["idempotency-key"]),
        body: JSON.parse(Buffer.concat(chunks).toString()),
      });
      if (holdFirst && requests.length === 1) {
        heldResponse = response;
        return;
      }
      response.writeHead(201, { "Content-Type": "application/json" }).end(
        JSON.stringify({
          success: true,
          exception: null,
          data: {
            reportId: "00000000-0000-4000-8000-000000000001",
            status: "submitted",
            createdAt: "2026-10-04T00:00:00Z",
            replay: requests.length > 1 && requests[0].key === requests[1].key,
          },
        })
      );
    });
    await new Promise<void>(resolve =>
      server.listen(4174, "127.0.0.1", resolve)
    );
  });

  test.afterAll(async () => {
    server?.closeAllConnections();
    await new Promise<void>(resolve => server?.close(() => resolve()));
  });

  test.beforeEach(async ({ page }) => {
    requests = [];
    heldResponse = null;
    holdFirst = false;
    await page.goto("/?private=must-not-be-reported");
    await page.evaluate(async () => {
      // Vite serves this test module only in development; it mounts the real form.
      const path = "/test/e2e/feedback-test-support.tsx";
      const { mountFeedbackForm } = await import(/* @vite-ignore */ path);
      mountFeedbackForm();
    });
    await expect(page.locator("#feedback-title")).toBeVisible();
  });

  test("submits maximum Chinese text and an allowlisted browser context", async ({
    page,
  }) => {
    await page.locator("#feedback-title").fill("中".repeat(200));
    await page.locator("#feedback-description").fill("中".repeat(10000));
    await page.locator("#feedback-test-root button[type=submit]").click();
    await expect(page.locator("#feedback-title")).toHaveValue("");
    expect(requests).toHaveLength(1);
    expect(requests[0].body).toMatchObject({
      type: "bug",
      title: "中".repeat(200),
      description: "中".repeat(10000),
      route: "/",
    });
    expect(
      Object.keys(requests[0].body.browserContext as object).sort()
    ).toEqual([
      "locale",
      "platform",
      "timeZone",
      "viewportHeight",
      "viewportWidth",
    ]);
    expect(requests[0].key).toMatch(/^[0-9a-f-]{36}$/);
  });

  for (const edit of [false, true]) {
    test(`mobile retry ${edit ? "uses a new key after editing" : "keeps the same body after resizing"}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      holdFirst = true;
      await page.locator("#feedback-title").fill("Mobile report");
      await page
        .locator("#feedback-description")
        .fill("The mobile button does not respond.");
      const submit = page.locator("#feedback-test-root button[type=submit]");
      await submit.click();
      await expect(page.locator("#feedback-title")).toBeDisabled();
      await expect(page.locator("#feedback-description")).toBeDisabled();
      await expect(page.locator("#feedback-type")).toBeDisabled();
      await expect.poll(() => heldResponse !== null).toBe(true);
      // Model a committed report whose success response was lost.
      heldResponse?.writeHead(503, { "Content-Type": "application/json" }).end(
        JSON.stringify({
          success: false,
          data: null,
          exception: {
            status: 503,
            reason: "FeedbackRequestFailed",
            message: "Temporary fixture failure",
            retryable: true,
          },
        })
      );
      await expect(submit).toBeEnabled();
      await expect(page.locator("#feedback-title")).toHaveValue(
        "Mobile report"
      );
      await page.setViewportSize({ width: 844, height: 390 });
      if (edit) await page.locator("#feedback-title").fill("Edited report");
      await submit.click();
      await expect(page.locator("#feedback-title")).toHaveValue("");
      expect(requests).toHaveLength(2);
      if (edit) {
        expect(requests[1].key).not.toBe(requests[0].key);
        expect(requests[1].body.title).toBe("Edited report");
      } else {
        expect(requests[1]).toEqual(requests[0]);
      }
    });
  }
});
