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

export interface LineChartProps<TMeta = unknown> {
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

export function LineChart<TMeta = unknown>({
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
}: LineChartProps<TMeta>) {
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
  const xScale = createBandScale(
    data.data.map(datum => datum.id),
    inner.x,
    0.12
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

  const setActivePoint = (
    datum: CartesianChartDatum<TMeta>,
    seriesIndex: number,
    pointX: number,
    pointY: number
  ) => {
    const series = data.series[seriesIndex];
    const value = datum.values[series.id] ?? 0;

    if (!isFiniteChartValue(value)) {
      return;
    }

    const nextActive: ChartActive<TMeta> = {
      kind: "line-point",
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
    setTooltipPosition({ x: pointX, y: pointY });
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

          const x = xScale.getPosition(datum.id) + xScale.bandwidth / 2;

          const label = datum.label ?? formatX(datum.x);
          const labelLines = splitSvgTextLines(
            label,
            Math.max(4, Math.floor(xScale.bandwidth / 6))
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
        {data.series.map((series, seriesIndex) => {
          const color = getChartColor(seriesIndex, series.color);
          const points = data.data.map(datum => {
            const x = xScale.getPosition(datum.id) + xScale.bandwidth / 2;
            const value = datum.values[series.id] ?? 0;
            return {
              x,
              y: isFiniteChartValue(value) ? yScale(value) : null,
            };
          });
          let path = "";
          let segmentStarted = false;

          points.forEach(point => {
            if (point.y === null) {
              segmentStarted = false;
              return;
            }

            if (!segmentStarted) {
              path += `M ${point.x} ${point.y}`;
              segmentStarted = true;
              return;
            }

            path += ` L ${point.x} ${point.y}`;
          });

          return (
            <g key={series.id}>
              <path
                d={path}
                fill="none"
                stroke={color}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
              />
              {data.data.map(datum => {
                const value = datum.values[series.id] ?? 0;

                if (!isFiniteChartValue(value)) {
                  return null;
                }

                const x = xScale.getPosition(datum.id) + xScale.bandwidth / 2;
                const y = yScale(value);

                return (
                  <circle
                    aria-label={`${series.label}: ${
                      datum.label ?? formatX(datum.x)
                    } ${valueFormatter(value)}`}
                    cx={x}
                    cy={y}
                    fill="var(--background)"
                    key={`${datum.id}-${series.id}`}
                    onBlur={clearActive}
                    onFocus={() => setActivePoint(datum, seriesIndex, x, y)}
                    onMouseEnter={() =>
                      setActivePoint(datum, seriesIndex, x, y)
                    }
                    r={4}
                    role="img"
                    stroke={color}
                    strokeWidth={2}
                    tabIndex={0}
                  />
                );
              })}
            </g>
          );
        })}
      </g>
    </ChartFrame>
  );
}
