import {
  createSingleSeriesCartesianData,
  toCartesianChartData,
} from "@/components/charts/cartesian";

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
