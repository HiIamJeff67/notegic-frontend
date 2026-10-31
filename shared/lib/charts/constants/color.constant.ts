export const DEFAULT_CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function getChartColor(index: number, override?: string) {
  return override ?? DEFAULT_CHART_COLORS[index % DEFAULT_CHART_COLORS.length];
}
