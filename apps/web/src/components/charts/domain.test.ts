import { createIntegerDomain, createLinearDomain } from "./domain";

describe("createLinearDomain", () => {
  test("should include zero and add padding by default", () => {
    const domain = createLinearDomain([10, 20], { paddingRatio: 0.1 });

    expect(domain[0]).toBe(-2);
    expect(domain[1]).toBe(22);
  });

  test("should fallback when values are empty", () => {
    expect(createLinearDomain([])).toEqual([0, 1]);
  });

  test("should expand single-value domains", () => {
    const domain = createLinearDomain([5, 5], { includeZero: false });

    expect(domain[0]).toBeLessThan(5);
    expect(domain[1]).toBeGreaterThan(5);
  });
});

test("creates a zero-based integer domain for positive counts", () => {
  expect(createIntegerDomain([0, 1, 3])).toEqual([0, 3]);
});
