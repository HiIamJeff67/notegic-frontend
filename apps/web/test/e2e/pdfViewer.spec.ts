import { expect, test } from "@playwright/test";
import { PDFDocument } from "pdf-lib";

for (const path of ["/", "/login", "/register"]) {
  test(`public SSR stays available at ${path}`, async ({ request }) => {
    const response = await request.get(path);
    expect(response.status()).toBe(200);
    const html = await response.text();
    expect(html).toContain("<html");
    expect(html).not.toContain("Invalid URL string");
  });
}

test("loads the PDF worker on demand and renders a real document", async ({
  page,
}) => {
  test.skip(
    process.env.E2E_PRODUCTION === "true",
    "Uses a Vite component module to exercise the real PDF worker configuration."
  );
  const errors: string[] = [];
  const workerRequests: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => {
    if (message.text().includes("fake worker")) errors.push(message.text());
  });
  page.on("request", request => {
    if (/pdf\.worker.*\.mjs/.test(request.url())) {
      workerRequests.push(request.url());
    }
  });

  await page.goto("/");
  await page.locator("html[data-density]").waitFor();
  expect(workerRequests).toEqual([]);

  const document = await PDFDocument.create();
  document.addPage([200, 100]).drawText("PDF regression", { x: 10, y: 50 });
  const bytes = Array.from(await document.save());
  const result = await page.evaluate(async bytes => {
    const path = "/test/e2e/pdfViewerTestSupport.ts";
    const { renderPDF } = await import(/* @vite-ignore */ path);
    return renderPDF(bytes);
  }, bytes);

  expect(result).toMatchObject({
    pages: 1,
    width: 200,
    height: 100,
    hasInk: true,
  });
  expect(workerRequests.length).toBeGreaterThan(0);
  const workerResponse = await page.request.get(result.workerURL);
  expect(workerResponse.status()).toBe(200);
  expect(workerResponse.headers()["content-type"]).toMatch(/javascript/);
  expect(errors).toEqual([]);
});
