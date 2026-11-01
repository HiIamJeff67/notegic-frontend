import { DEFAULT_CHART_COLORS } from "@/components/charts/defaults";

export function getChartColor(index: number, override?: string) {
  return override ?? DEFAULT_CHART_COLORS[index % DEFAULT_CHART_COLORS.length];
}
