import type { CSSProperties, ReactNode } from "react";
import { useState } from "react";
import { getChartColor } from "../constants/color.constant";
import {
  DEFAULT_CHART_MARGIN,
  DEFAULT_VIEWBOX_HEIGHT,
  DEFAULT_VIEWBOX_WIDTH,
} from "../constants/size.constant";
import type {
  CartesianChartData,
  CartesianChartDatum,
  ChartActive,
  ChartMargin,
  ChartTooltipContext,
  ChartValueMode,
} from "../types";
import {
  createIntegerTicks,
  createLinearTicks,
  createBandScale,
  createIntegerDomain,
  createLinearDomain,
  createLinearScale,
  isFiniteChartValue,
  splitSvgTextLines,
} from "../util";
import {
  ChartFrame,
  formatAxisValue,
  formatInteger,
  formatNumber,
  type TooltipPosition,
} from "./ChartFrame";

export interface ColumnChartProps<TMeta = unknown> {
  data: CartesianChartData<TMeta>;
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
}

export function ColumnChart<TMeta = unknown>({
  data,
  margin,
  valueDomain,
  className,
  style,
  height,
  width,
  ariaLabel,
  loading,
  emptyMessage,
  showLegend = true,
  showGrid = true,
  tooltip,
  onActiveChange,
  formatX = formatAxisValue,
  formatY,
  maxXAxisLabels = 8,
  valueMode = "continuous",
}: ColumnChartProps<TMeta>) {
  const [active, setActive] = useState<ChartActive<TMeta> | null>(null);
  const [tooltipPosition, setTooltipPosition] =
    useState<TooltipPosition | null>(null);
  const mergedMargin = { ...DEFAULT_CHART_MARGIN, ...margin };
  const innerWidth = Math.max(
    0,
    DEFAULT_VIEWBOX_WIDTH - mergedMargin.left - mergedMargin.right
  );
  const innerHeight = Math.max(
    0,
    DEFAULT_VIEWBOX_HEIGHT - mergedMargin.top - mergedMargin.bottom
  );
  const inner = {
    x: [mergedMargin.left, mergedMargin.left + innerWidth] as [number, number],
    y: [mergedMargin.top + innerHeight, mergedMargin.top] as [number, number],
  };
  const groupScale = createBandScale(
    data.data.map(datum => datum.id),
    inner.x,
    0.28
  );
  const seriesScale = createBandScale(
    data.series.map(series => series.id),
    [0, groupScale.bandwidth],
    0.16
  );
  const chartValues = data.data.flatMap(datum =>
    data.series.map(series => datum.values[series.id] ?? 0)
  );
  const domain =
    valueDomain ??
    (valueMode === "integer"
      ? createIntegerDomain(chartValues)
      : createLinearDomain(chartValues));
  const yScale = createLinearScale(domain, inner.y);
  const zeroY = yScale(0);
  const ticks =
    valueMode === "integer"
      ? createIntegerTicks(domain)
      : createLinearTicks(domain);
  const valueFormatter =
    formatY ?? (valueMode === "integer" ? formatInteger : formatNumber);
  const legendItems = data.series.map((series, index) => ({
    id: series.id,
    label: series.label,
    color: getChartColor(index, series.color),
  }));
  const xLabelEvery = Math.max(1, Math.ceil(data.data.length / maxXAxisLabels));
  const isEmpty =
    data.series.length === 0 ||
    data.data.length === 0 ||
    chartValues.every(value => !isFiniteChartValue(value));

  const setActiveColumn = (
    datum: CartesianChartDatum<TMeta>,
    seriesIndex: number,
    x: number,
    y: number
  ) => {
    const series = data.series[seriesIndex];
    const value = datum.values[series.id] ?? 0;

    if (!isFiniteChartValue(value)) {
      return;
    }

    const nextActive: ChartActive<TMeta> = {
      kind: "column",
      label: datum.label ?? formatX(datum.x),
      value,
      color: getChartColor(seriesIndex, series.color),
      seriesId: series.id,
      seriesLabel: series.label,
      datumId: datum.id,
      x: datum.x,
      meta: datum.meta,
    };

    setActive(nextActive);
    setTooltipPosition({ x, y });
    onActiveChange?.(nextActive);
  };

  const clearActive = () => {
    setActive(null);
    setTooltipPosition(null);
    onActiveChange?.(null);
  };

  return (
    <ChartFrame
      active={active}
      ariaLabel={ariaLabel}
      className={className}
      emptyMessage={emptyMessage}
      formatValue={valueFormatter}
      height={height}
      isEmpty={isEmpty}
      legendItems={legendItems}
      loading={loading}
      showLegend={showLegend}
      style={style}
      tooltip={tooltip}
      tooltipPosition={tooltipPosition}
      width={width}
    >
      <g onMouseLeave={clearActive}>
        {showGrid &&
          ticks.map(tick => {
            const y = yScale(tick);
            return (
              <g key={tick}>
                <line
                  stroke="var(--border)"
                  strokeDasharray="4 4"
                  strokeWidth={1}
                  x1={inner.x[0]}
                  x2={inner.x[1]}
                  y1={y}
                  y2={y}
                />
                <text
                  fill="var(--muted-foreground)"
                  fontSize={11}
                  textAnchor="end"
                  x={mergedMargin.left - 8}
                  y={y + 4}
                >
                  {valueFormatter(tick)}
                </text>
              </g>
            );
          })}
        {data.data.map((datum, index) => {
          if (index % xLabelEvery !== 0) {
            return null;
          }

          const x = groupScale.getPosition(datum.id) + groupScale.bandwidth / 2;

          const label = datum.label ?? formatX(datum.x);
          const labelLines = splitSvgTextLines(
            label,
            Math.max(4, Math.floor(groupScale.bandwidth / 6))
          );

          return (
            <text
              fill="var(--muted-foreground)"
              fontSize={11}
              key={datum.id}
              textAnchor="middle"
              x={x}
              y={DEFAULT_VIEWBOX_HEIGHT - mergedMargin.bottom + 14}
            >
              {labelLines.map((line, lineIndex) => (
                <tspan
                  dy={lineIndex === 0 ? 0 : 12}
                  key={`${line}-${lineIndex}`}
                  x={x}
                >
                  {line}
                </tspan>
              ))}
            </text>
          );
        })}
        {data.data.map(datum =>
          data.series.map((series, seriesIndex) => {
            const value = datum.values[series.id] ?? 0;

            if (!isFiniteChartValue(value)) {
              return null;
            }

            const color = getChartColor(seriesIndex, series.color);
            const x =
              groupScale.getPosition(datum.id) +
              seriesScale.getPosition(series.id);
            const y = yScale(value);
            const rectY = Math.min(y, zeroY);
            const rectHeight = Math.abs(zeroY - y);
            const centerX = x + seriesScale.bandwidth / 2;

            return (
              <rect
                aria-label={`${series.label}: ${
                  datum.label ?? formatX(datum.x)
                } ${valueFormatter(value)}`}
                fill={color}
                height={rectHeight}
                key={`${datum.id}-${series.id}`}
                onBlur={clearActive}
                onFocus={() =>
                  setActiveColumn(datum, seriesIndex, centerX, rectY)
                }
                onMouseEnter={() =>
                  setActiveColumn(datum, seriesIndex, centerX, rectY)
                }
                opacity={active?.datumId === datum.id ? 1 : 0.86}
                role="img"
                rx={3}
                tabIndex={0}
                width={seriesScale.bandwidth}
                x={x}
                y={rectY}
              />
            );
          })
        )}
      </g>
    </ChartFrame>
  );
}
