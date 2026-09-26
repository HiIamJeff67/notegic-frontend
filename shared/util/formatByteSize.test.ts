import { formatByteSize } from "./formatByteSize";

describe("formatByteSize", () => {
  it("formats values in megabytes using whole numbers by default", () => {
    expect(formatByteSize(12.4 * 1024 ** 2)).toBe("12 MB");
  });

  it("formats gigabytes with an optional fractional precision", () => {
    expect(formatByteSize(1.24 * 1024 ** 3, 1)).toBe("1.2 GB");
  });

  it("formats missing values as zero megabytes", () => {
    expect(formatByteSize()).toBe("0 MB");
  });
});
