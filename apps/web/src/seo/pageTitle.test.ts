import { pageTitle, pageTitleLimit } from "./pageTitle";

test("keeps a short page label intact", () => {
  expect(pageTitle("Document")).toBe("Document | Notegic");
  expect(pageTitle("  Dashboard  ")).toBe("Dashboard | Notegic");
});

test("truncates a label only after 32 characters", () => {
  const limit = "a".repeat(pageTitleLimit);
  expect(pageTitle(limit)).toBe(`${limit} | Notegic`);
  expect(pageTitle(`${limit}b`)).toBe(`${limit}... | Notegic`);
});

test("falls back when a label is empty", () => {
  expect(pageTitle("   ")).toBe("Notegic");
});
