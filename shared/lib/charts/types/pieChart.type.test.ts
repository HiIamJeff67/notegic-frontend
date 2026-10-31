import { toPieChartData } from "./pieChart.type";

test.each([
  "array",
  "wrapper",
])("converts %s data without dropping metadata, labels or zero values", shape => {
  const meta = { id: "source" };
  const points = [
    { id: "two", x: "Tue", value: 0, meta },
    { id: "one", x: "Mon", value: 1.25 },
  ];
  const result = toPieChartData(shape === "array" ? points : { data: points });
  expect(result).toEqual({
    slices: [
      { id: "two", label: "Tue", value: 0, meta },
      { id: "one", label: "Mon", value: 1.25 },
    ],
  });
  expect(result.slices[0].meta).toBe(meta);
  expect(points.map(point => point.value)).toEqual([0, 1.25]);
});
