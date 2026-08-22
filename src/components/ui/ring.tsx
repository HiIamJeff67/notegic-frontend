import { cn } from "@shared/util/utils";
import * as React from "react";

export interface RingProps extends React.ComponentProps<"div"> {
  value?: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  radius?: number;
  viewBoxSize?: number;
  trackClassName?: string;
  indicatorClassName?: string;
}

const Ring = React.forwardRef<HTMLDivElement, RingProps>(
  (
    {
      className,
      value = 0,
      max = 100,
      size = 56,
      strokeWidth = 5,
      radius = 22,
      viewBoxSize = 56,
      trackClassName,
      indicatorClassName,
      children,
      style,
      ...props
    },
    ref
  ) => {
    const percentage =
      max <= 0 ? 0 : Math.min(100, Math.max(0, (value / max) * 100));
    const center = viewBoxSize / 2;

    return (
      <div
        ref={ref}
        data-slot="ring"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        className={cn("relative shrink-0", className)}
        style={{ width: size, height: size, ...style }}
        {...props}
      >
        <svg
          className="size-full -rotate-90"
          viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
          aria-hidden="true"
        >
          <circle
            className={cn("fill-none stroke-border/70", trackClassName)}
            cx={center}
            cy={center}
            r={radius}
            pathLength="100"
            strokeWidth={strokeWidth}
          />
          <circle
            className={cn(
              "fill-none stroke-primary transition-[stroke-dashoffset]",
              indicatorClassName
            )}
            cx={center}
            cy={center}
            r={radius}
            pathLength="100"
            strokeDasharray="100"
            strokeDashoffset={100 - percentage}
            strokeLinecap="round"
            strokeWidth={strokeWidth}
          />
        </svg>
        {children}
      </div>
    );
  }
);
Ring.displayName = "Ring";

export { Ring };
