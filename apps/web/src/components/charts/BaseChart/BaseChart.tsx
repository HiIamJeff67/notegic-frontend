import type {
  TwoDimensionalChartType,
  TwoDimensionalData,
} from "@shared/components/charts/BaseChart/BaseChart.type";
import { toCartesianChartData } from "@shared/components/charts/cartesian";
import type {
  ChartActive,
  ChartMargin,
  ChartSeries,
  ChartTooltipContext,
  ChartValueMode,
} from "@shared/components/charts/chart.type";
import { toPieChartData } from "@shared/components/charts/PieChart/PieChart.type";
import type { CSSProperties, ReactNode } from "react";
import { BarChart } from "@/components/charts/BarChart/BarChart";
import { ColumnChart } from "@/components/charts/ColumnChart/ColumnChart";
import { LineChart } from "@/components/charts/LineChart/LineChart";
import { PieChart } from "@/components/charts/PieChart/PieChart";

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

export function BaseChart<TMeta = unknown>({
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
  return <BaseChart {...props} valueMode="integer" />;
}

export function FloatChart<TMeta = unknown>({
  ...props
}: Omit<BaseChartProps<TMeta>, "valueMode">) {
  return <BaseChart {...props} valueMode="continuous" />;
}
