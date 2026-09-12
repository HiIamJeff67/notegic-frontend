import { getRetryAt } from "./retry";

describe("Retry-After", () => {
  const now = Date.parse("2026-09-12T14:00:00Z");
  it.each([
    null,
    "",
    "garbage",
    "-1",
    "0",
    "30",
    "Fri, 11 Sep 2026 14:00:00 GMT",
  ])("uses at least 60 seconds for %s", value => {
    expect(getRetryAt(value, now)).toBe(now + 60_000);
  });
  it("honors longer delta-seconds", () => {
    expect(getRetryAt("120", now)).toBe(now + 120_000);
  });
  it("honors an HTTP date", () => {
    expect(getRetryAt("Sat, 12 Sep 2026 14:05:00 GMT", now)).toBe(
      now + 300_000
    );
  });
});
