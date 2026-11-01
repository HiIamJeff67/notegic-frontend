import { formatTimezone } from "./timezone";

describe("formatTimezone", () => {
  test("formats a timezone using the given locale", () => {
    expect(formatTimezone("America/Los_Angeles", "en")).not.toBe(
      "America/Los_Angeles"
    );
  });

  test("returns the timezone when it is invalid", () => {
    expect(formatTimezone("Invalid/Timezone", "en")).toBe("Invalid/Timezone");
  });
});
