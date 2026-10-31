import type { CSSProperties, ReactNode } from "react";
import { toCartesianChartData } from "../types/cartesianChart.type";
import type {
  ChartActive,
  ChartMargin,
  ChartSeries,
  ChartTooltipContext,
  ChartValueMode,
} from "../types/chart.type";
import type {
  TwoDimensionalChartType,
  TwoDimensionalData,
} from "../types/dimensionalChart.type";
import { toPieChartData } from "../types/pieChart.type";
import { BarChart } from "./BarChart";
import { ColumnChart } from "./ColumnChart";
import { LineChart } from "./LineChart";
import { PieChart } from "./PieChart";

export interface BaseChartProps<TMeta = unknown> {
  data: TwoDimensionalData<TMeta>;
  chartType: TwoDimensionalChartType;
  series: ChartSeries;
  className?: string;
  style?: CSSProperties;
  height?: number | string;
  width?: number | string;
  ariaLabel?: string;
  loading?: boolean;
  emptyMessage?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  tooltip?: (context: ChartTooltipContext<TMeta>) => ReactNode;
  onActiveChange?: (active: ChartActive<TMeta> | null) => void;
  margin?: Partial<ChartMargin>;
  valueDomain?: [number, number];
  formatX?: (value: string) => string;
  formatY?: (value: number) => string;
  maxXAxisLabels?: number;
  valueMode?: ChartValueMode;
  innerRadiusRatio?: number;
}

export function Chart<TMeta = unknown>({
  data,
  chartType,
  series,
  innerRadiusRatio,
  valueMode,
  ...props
}: BaseChartProps<TMeta>) {
  if (chartType === "pie") {
    return (
      <PieChart
        {...props}
        data={toPieChartData(data)}
        innerRadiusRatio={innerRadiusRatio}
        valueMode={valueMode}
      />
    );
  }

  const cartesianData = toCartesianChartData(data, series);

  if (chartType === "bar") {
    return <BarChart {...props} data={cartesianData} valueMode={valueMode} />;
  }

  if (chartType === "column") {
    return (
      <ColumnChart {...props} data={cartesianData} valueMode={valueMode} />
    );
  }

  return <LineChart {...props} data={cartesianData} valueMode={valueMode} />;
}

export function IntChart<TMeta = unknown>({
  ...props
}: Omit<BaseChartProps<TMeta>, "valueMode">) {
  return <Chart {...props} valueMode="integer" />;
}

export function FloatChart<TMeta = unknown>({
  ...props
}: Omit<BaseChartProps<TMeta>, "valueMode">) {
  return <Chart {...props} valueMode="continuous" />;
}
