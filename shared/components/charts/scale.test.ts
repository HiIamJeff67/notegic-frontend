import { createBandScale, createLinearScale } from "./scale";

describe("createLinearScale", () => {
  test("should map values from domain to range", () => {
    const scale = createLinearScale([0, 100], [0, 200]);

    expect(scale(0)).toBe(0);
    expect(scale(50)).toBe(100);
    expect(scale(100)).toBe(200);
  });
});

describe("createBandScale", () => {
  test("should allocate stable band positions", () => {
    const scale = createBandScale(["a", "b"], [0, 100], 0.2);

    expect(scale.bandwidth).toBe(40);
    expect(scale.getPosition("a")).toBe(5);
    expect(scale.getPosition("b")).toBe(55);
  });
});
