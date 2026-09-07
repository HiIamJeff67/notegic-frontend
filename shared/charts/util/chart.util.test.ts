import { createSingleSeriesCartesianData } from "@shared/charts/types";
import {
  buildIntegerTicks,
  createBandScale,
  createIntegerDomain,
  createLinearDomain,
  createLinearScale,
} from "@shared/charts/util";

describe("Charts Shared Unit Tests", () => {
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

  describe("createLinearScale", () => {
    test("should map values from domain to range", () => {
      const scale = createLinearScale([0, 100], [0, 200]);

      expect(scale(0)).toBe(0);
      expect(scale(50)).toBe(100);
      expect(scale(100)).toBe(200);
    });
  });

  describe("integer chart values", () => {
    test("should create a zero-based integer domain for positive counts", () => {
      expect(createIntegerDomain([0, 1, 3])).toEqual([0, 3]);
    });

    test("should generate integer ticks for small count domains", () => {
      expect(buildIntegerTicks([0, 3])).toEqual([0, 1, 2, 3]);
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

  describe("createSingleSeriesCartesianData", () => {
    test("should normalize simple x/y points into cartesian chart data", () => {
      const data = createSingleSeriesCartesianData(
        { id: "count", label: "Count" },
        [
          { id: "day-1", x: "Mon", y: 2 },
          { id: "day-2", x: "Tue", y: 0 },
        ]
      );

      expect(data.series).toEqual([{ id: "count", label: "Count" }]);
      expect(
        data.data.flatMap(datum =>
          data.series.map(series => datum.values[series.id])
        )
      ).toEqual([2, 0]);
    });
  });
});
