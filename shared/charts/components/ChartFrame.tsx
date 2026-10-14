import { useTranslation } from "@shared/i18n/useTranslation";
import type { CSSProperties, ReactNode } from "react";
import { Spinner } from "@/components/ui/spinner";
import {
  DEFAULT_VIEWBOX_HEIGHT,
  DEFAULT_VIEWBOX_WIDTH,
} from "../constants/size.constant";
import type { ChartActive, ChartTooltipContext } from "../types";

export interface ChartLegendItem {
  id: string;
  label: string;
  color: string;
}

export interface TooltipPosition {
  x: number;
  y: number;
}

interface ChartFrameProps<TMeta = unknown> {
  className?: string;
  style?: CSSProperties;
  height?: number | string;
  width?: number | string;
  ariaLabel?: string;
  loading?: boolean;
  emptyMessage?: string;
  showLegend?: boolean;
  tooltip?: (context: ChartTooltipContext<TMeta>) => ReactNode;
  isEmpty: boolean;
  legendItems?: ChartLegendItem[];
  active?: ChartActive<TMeta> | null;
  tooltipPosition?: TooltipPosition | null;
  children: ReactNode;
  formatValue?: (value: number) => string;
}

export function formatAxisValue(value: string) {
  return value;
}

export function formatNumber(value: number) {
  return Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatInteger(value: number) {
  return Intl.NumberFormat(undefined, {
    maximumFractionDigits: 0,
  }).format(value);
}

export function ChartFrame<TMeta = unknown>({
  className,
  style,
  height = 280,
  width = "100%",
  ariaLabel,
  loading = false,
  emptyMessage,
  showLegend = true,
  legendItems = [],
  active,
  tooltip,
  tooltipPosition,
  isEmpty,
  children,
  formatValue = formatNumber,
}: ChartFrameProps<TMeta>) {
  const { t } = useTranslation();
  const frameClassName = [
    "relative flex min-h-0 min-w-0 flex-col overflow-visible text-foreground",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  const shouldShowState = loading || isEmpty;
  const tooltipPositionClass =
    !tooltipPosition || tooltipPosition.x < DEFAULT_VIEWBOX_WIDTH * 0.25
      ? "-translate-y-full"
      : tooltipPosition.x > DEFAULT_VIEWBOX_WIDTH * 0.75
        ? "-translate-x-full -translate-y-full"
        : "-translate-x-1/2 -translate-y-full";

  return (
    <div
      className={frameClassName}
      style={{
        width,
        height,
        ...style,
      }}
    >
      <div className="relative min-h-0 min-w-0 flex-1 overflow-visible">
        <svg
          aria-label={ariaLabel ?? t("workspace.charts.charts")}
          className="block size-full overflow-visible"
          role="img"
          viewBox={`0 0 ${DEFAULT_VIEWBOX_WIDTH} ${DEFAULT_VIEWBOX_HEIGHT}`}
        >
          {!shouldShowState && children}
        </svg>
        {shouldShowState && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
            {loading ? (
              <Spinner />
            ) : (
              (emptyMessage ?? t("workspace.charts.noData"))
            )}
          </div>
        )}
        {!shouldShowState && active && tooltipPosition && (
          <div
            className={[
              "pointer-events-none absolute z-50 w-max max-w-64 rounded-md border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md",
              tooltipPositionClass,
            ].join(" ")}
            style={{
              left: `${(tooltipPosition.x / DEFAULT_VIEWBOX_WIDTH) * 100}%`,
              top: `${(tooltipPosition.y / DEFAULT_VIEWBOX_HEIGHT) * 100}%`,
            }}
          >
            {tooltip
              ? tooltip({ active } satisfies ChartTooltipContext<TMeta>)
              : defaultTooltip(active, formatValue)}
          </div>
        )}
      </div>
      {showLegend && legendItems.length > 0 && !shouldShowState && (
        <div className="mt-2 flex min-h-0 flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {legendItems.map(item => (
            <div key={item.id} className="flex min-w-0 items-center gap-1.5">
              <span
                aria-hidden="true"
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="truncate">{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function defaultTooltip<TMeta = unknown>(
  active: ChartActive<TMeta>,
  formatValue: (value: number) => string
) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="whitespace-normal break-words font-medium text-foreground">
        {active.seriesLabel
          ? `${active.seriesLabel} · ${active.label}`
          : active.label}
      </span>
      <span className="text-muted-foreground">{formatValue(active.value)}</span>
    </div>
  );
}
