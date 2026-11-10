import {
  dateToTimeString,
  isQuietHours,
  minutesToTimeString,
  timeStringToDate,
  timeToMinutes,
} from "./timeString";

describe("timeString conversions", () => {
  it("converts a local time string to a date", () => {
    const date = timeStringToDate("08:05");

    expect(date.getHours()).toBe(8);
    expect(date.getMinutes()).toBe(5);
  });

  it("formats a date as a zero-padded local time string", () => {
    expect(dateToTimeString(new Date(2000, 0, 1, 8, 5))).toBe("08:05");
  });

  it("converts clock times to minutes since midnight and back", () => {
    expect(timeToMinutes("08:05")).toBe(485);
    expect(minutesToTimeString(485)).toBe("08:05");
    expect(timeToMinutes("24:00")).toBeNull();
    expect(timeToMinutes("08:60")).toBeNull();
  });

  it("handles quiet hours that cross midnight", () => {
    expect(isQuietHours(new Date(2026, 0, 1, 23, 30), "22:00", "08:00")).toBe(
      true
    );
    expect(isQuietHours(new Date(2026, 0, 1, 7, 30), "22:00", "08:00")).toBe(
      true
    );
    expect(isQuietHours(new Date(2026, 0, 1, 12, 0), "22:00", "08:00")).toBe(
      false
    );
  });
});
