import { toCartesianChartData } from "./cartesianChart.type";

test.each([
  "array",
  "wrapper",
])("converts %s data without dropping metadata or changing point order", shape => {
  const meta = { id: "source" };
  const points = [
    { id: "two", x: "Tue", value: 0, meta },
    { id: "one", x: "Mon", value: 1.25 },
  ];
  const series = { id: "count", label: "Count", color: "red" };
  const result = toCartesianChartData(
    shape === "array" ? points : { data: points },
    series
  );
  expect(result).toEqual({
    series: [series],
    data: [
      { id: "two", x: "Tue", label: "Tue", values: { count: 0 }, meta },
      { id: "one", x: "Mon", label: "Mon", values: { count: 1.25 } },
    ],
  });
  expect(result.data[0].meta).toBe(meta);
  expect(points.map(point => point.value)).toEqual([0, 1.25]);
});
