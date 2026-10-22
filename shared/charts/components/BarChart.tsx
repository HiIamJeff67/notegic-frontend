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

export interface BarChartProps<TMeta = unknown> {
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

export function BarChart<TMeta = unknown>({
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
}: BarChartProps<TMeta>) {
  const [active, setActive] = useState<ChartActive<TMeta> | null>(null);
  const [tooltipPosition, setTooltipPosition] =
    useState<TooltipPosition | null>(null);
  const mergedMargin = {
    ...DEFAULT_CHART_MARGIN,
    left: 72,
    bottom: 32,
    ...margin,
  };
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
    [mergedMargin.top, DEFAULT_VIEWBOX_HEIGHT - mergedMargin.bottom],
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
  const xScale = createLinearScale(domain, inner.x);
  const zeroX = xScale(0);
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
  const yLabelEvery = Math.max(1, Math.ceil(data.data.length / maxXAxisLabels));
  const isEmpty =
    data.series.length === 0 ||
    data.data.length === 0 ||
    chartValues.every(value => !isFiniteChartValue(value));

  const setActiveBar = (
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
      kind: "bar",
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
            const x = xScale(tick);
            return (
              <g key={tick}>
                <line
                  stroke="var(--border)"
                  strokeDasharray="4 4"
                  strokeWidth={1}
                  x1={x}
                  x2={x}
                  y1={inner.y[1]}
                  y2={inner.y[0]}
                />
                <text
                  fill="var(--muted-foreground)"
                  fontSize={11}
                  textAnchor="middle"
                  x={x}
                  y={DEFAULT_VIEWBOX_HEIGHT - 10}
                >
                  {valueFormatter(tick)}
                </text>
              </g>
            );
          })}
        {data.data.map((datum, index) => {
          if (index % yLabelEvery !== 0) {
            return null;
          }

          const y = groupScale.getPosition(datum.id) + groupScale.bandwidth / 2;

          const label = datum.label ?? formatX(datum.x);
          const labelLines = splitSvgTextLines(
            label,
            Math.max(4, Math.floor((mergedMargin.left - 16) / 6))
          );

          return (
            <text
              fill="var(--muted-foreground)"
              fontSize={11}
              key={datum.id}
              textAnchor="end"
              x={mergedMargin.left - 8}
              y={y - (labelLines.length - 1) * 6 + 4}
            >
              {labelLines.map((line, lineIndex) => (
                <tspan
                  dy={lineIndex === 0 ? 0 : 12}
                  key={`${line}-${lineIndex}`}
                  x={mergedMargin.left - 8}
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
            const scaledX = xScale(value);
            const rectX = Math.min(zeroX, scaledX);
            const rectWidth = Math.abs(scaledX - zeroX);
            const y =
              groupScale.getPosition(datum.id) +
              seriesScale.getPosition(series.id);
            const centerY = y + seriesScale.bandwidth / 2;

            return (
              <rect
                aria-label={`${series.label}: ${
                  datum.label ?? formatX(datum.x)
                } ${valueFormatter(value)}`}
                fill={color}
                height={seriesScale.bandwidth}
                key={`${datum.id}-${series.id}`}
                onBlur={clearActive}
                onFocus={() =>
                  setActiveBar(datum, seriesIndex, rectX + rectWidth, centerY)
                }
                onMouseEnter={() =>
                  setActiveBar(datum, seriesIndex, rectX + rectWidth, centerY)
                }
                opacity={active?.datumId === datum.id ? 1 : 0.86}
                role="img"
                rx={3}
                tabIndex={0}
                width={rectWidth}
                x={rectX}
                y={y}
              />
            );
          })
        )}
      </g>
    </ChartFrame>
  );
}
