import { dateToTimeString, timeStringToDate } from "./timeString";

describe("timeString conversions", () => {
  it("converts a local time string to a date", () => {
    const date = timeStringToDate("08:05");

    expect(date.getHours()).toBe(8);
    expect(date.getMinutes()).toBe(5);
  });

  it("formats a date as a zero-padded local time string", () => {
    expect(dateToTimeString(new Date(2000, 0, 1, 8, 5))).toBe("08:05");
  });
});
