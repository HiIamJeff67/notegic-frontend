import type { CSSProperties, ReactNode } from "react";
import { useState } from "react";
import { getChartColor } from "../constants/color.constant";
import {
  DEFAULT_VIEWBOX_HEIGHT,
  DEFAULT_VIEWBOX_WIDTH,
} from "../constants/size.constant";
import type {
  ChartActive,
  ChartTooltipContext,
  ChartValueMode,
} from "../types/chart.type";
import type { PieChartData } from "../types/pieChart.type";
import {
  ChartFrame,
  formatInteger,
  formatNumber,
  type TooltipPosition,
} from "./ChartFrame";

export interface PieChartProps<TMeta = unknown> {
  data: PieChartData<TMeta>;
  className?: string;
  style?: CSSProperties;
  height?: number | string;
  width?: number | string;
  ariaLabel?: string;
  loading?: boolean;
  emptyMessage?: string;
  showLegend?: boolean;
  tooltip?: (context: ChartTooltipContext<TMeta>) => ReactNode;
  onActiveChange?: (active: ChartActive<TMeta> | null) => void;
  innerRadiusRatio?: number;
  formatValue?: (value: number) => string;
  valueMode?: ChartValueMode;
}

export function PieChart<TMeta = unknown>({
  data,
  className,
  style,
  height,
  width,
  ariaLabel,
  loading,
  emptyMessage,
  showLegend = true,
  tooltip,
  onActiveChange,
  innerRadiusRatio = 0,
  formatValue,
  valueMode = "continuous",
}: PieChartProps<TMeta>) {
  const valueFormatter =
    formatValue ?? (valueMode === "integer" ? formatInteger : formatNumber);
  const [active, setActive] = useState<ChartActive<TMeta> | null>(null);
  const [tooltipPosition, setTooltipPosition] =
    useState<TooltipPosition | null>(null);
  const centerX = DEFAULT_VIEWBOX_WIDTH / 2;
  const centerY = DEFAULT_VIEWBOX_HEIGHT / 2;
  const radius = Math.min(DEFAULT_VIEWBOX_WIDTH, DEFAULT_VIEWBOX_HEIGHT) * 0.36;
  const innerRadius = radius * Math.min(Math.max(innerRadiusRatio, 0), 0.85);
  const positiveSlices = data.slices.map(slice => ({
    ...slice,
    value: Math.max(0, Number.isFinite(slice.value) ? slice.value : 0),
  }));
  const total = positiveSlices.reduce((sum, slice) => sum + slice.value, 0);
  const activeValue = active?.value ?? total;
  const activePercentage =
    total > 0
      ? new Intl.NumberFormat(undefined, {
          maximumFractionDigits: 1,
          style: "percent",
        }).format(activeValue / total)
      : "0%";
  let currentAngle = -90;
  const geometries =
    total > 0
      ? positiveSlices.map(slice => {
          const angle = (slice.value / total) * 360;
          const geometry = {
            id: slice.id,
            startAngle: currentAngle,
            endAngle: currentAngle + angle,
            value: slice.value,
          };

          currentAngle += angle;
          return geometry;
        })
      : [];
  const geometryById = new Map(
    geometries.map(geometry => [geometry.id, geometry])
  );
  const legendItems = data.slices.map((slice, index) => ({
    id: slice.id,
    label: slice.label,
    color: getChartColor(index, slice.color),
  }));
  const isEmpty = geometries.length === 0;

  const setActiveSlice = (sliceIndex: number) => {
    const slice = data.slices[sliceIndex];
    const geometry = geometryById.get(slice.id);

    if (!geometry) {
      return;
    }

    const color = getChartColor(sliceIndex, slice.color);
    const middleAngle = (geometry.startAngle + geometry.endAngle) / 2;
    const tooltipPoint = polarToCartesian(
      centerX,
      centerY,
      radius * 0.78,
      middleAngle
    );
    const nextActive: ChartActive<TMeta> = {
      kind: "pie-slice",
      label: slice.label,
      value: geometry.value,
      color,
      sliceId: slice.id,
      meta: slice.meta,
    };

    setActive(nextActive);
    setTooltipPosition(tooltipPoint);
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
        {data.slices.map((slice, index) => {
          const geometry = geometryById.get(slice.id);

          if (!geometry) {
            return null;
          }

          const color = getChartColor(index, slice.color);

          return (
            <path
              aria-label={`${slice.label}: ${valueFormatter(geometry.value)}`}
              d={describeArcPath(
                centerX,
                centerY,
                radius,
                geometry.startAngle,
                geometry.endAngle,
                innerRadius
              )}
              fill={color}
              fillRule="evenodd"
              key={slice.id}
              onBlur={clearActive}
              onFocus={() => setActiveSlice(index)}
              onMouseEnter={() => setActiveSlice(index)}
              opacity={active?.sliceId === slice.id ? 1 : 0.88}
              role="img"
              stroke="var(--background)"
              strokeWidth={2}
              tabIndex={0}
            />
          );
        })}
        {innerRadius > 0 && (
          <text fill="var(--muted-foreground)" textAnchor="middle" x={centerX}>
            <tspan
              className="fill-foreground"
              fontSize={14}
              fontWeight={600}
              x={centerX}
              y={centerY - 2}
            >
              {valueFormatter(activeValue)}
            </tspan>
            <tspan fontSize={11} x={centerX} y={centerY + 14}>
              {activePercentage}
            </tspan>
          </text>
        )}
      </g>
    </ChartFrame>
  );
}

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) {
  const angleInRadians = (angleInDegrees * Math.PI) / 180;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArcPath(
  centerX: number,
  centerY: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number,
  innerRadius = 0
) {
  if (endAngle - startAngle >= 359.999) {
    if (innerRadius <= 0) {
      return [
        `M ${centerX - outerRadius} ${centerY}`,
        `A ${outerRadius} ${outerRadius} 0 1 0 ${centerX + outerRadius} ${centerY}`,
        `A ${outerRadius} ${outerRadius} 0 1 0 ${centerX - outerRadius} ${centerY}`,
        "Z",
      ].join(" ");
    }

    return [
      `M ${centerX - outerRadius} ${centerY}`,
      `A ${outerRadius} ${outerRadius} 0 1 0 ${centerX + outerRadius} ${centerY}`,
      `A ${outerRadius} ${outerRadius} 0 1 0 ${centerX - outerRadius} ${centerY}`,
      `M ${centerX - innerRadius} ${centerY}`,
      `A ${innerRadius} ${innerRadius} 0 1 1 ${centerX + innerRadius} ${centerY}`,
      `A ${innerRadius} ${innerRadius} 0 1 1 ${centerX - innerRadius} ${centerY}`,
      "Z",
    ].join(" ");
  }

  const start = polarToCartesian(centerX, centerY, outerRadius, endAngle);
  const end = polarToCartesian(centerX, centerY, outerRadius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  if (innerRadius <= 0) {
    return [
      `M ${centerX} ${centerY}`,
      `L ${start.x} ${start.y}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
      "Z",
    ].join(" ");
  }

  const innerStart = polarToCartesian(
    centerX,
    centerY,
    innerRadius,
    startAngle
  );
  const innerEnd = polarToCartesian(centerX, centerY, innerRadius, endAngle);

  return [
    `M ${start.x} ${start.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
    `L ${innerStart.x} ${innerStart.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${innerEnd.x} ${innerEnd.y}`,
    "Z",
  ].join(" ");
}
