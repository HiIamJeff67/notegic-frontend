import { usePerformance } from "@/hooks";

const pointBudgets = {
  Bad: 72_000,
  Great: 256_000,
  Normal: 120_000,
  Severely: 40_000,
  Well: 184_000,
} as const;

export const InformationMenu = () => {
  const { capability, isCapabilityDetected } = usePerformance();
  const pointCount = isCapabilityDetected ? pointBudgets[capability] : 0;
  const bufferSize = pointCount
    ? `${((pointCount * 3 * Float32Array.BYTES_PER_ELEMENT) / 1_048_576).toFixed(1)} MB`
    : "—";

  return (
    <section>
      <div className="mb-3 capitalize text-sm font-bold tracking-[0.22em] text-foreground">
        Information
      </div>
      <div className="space-y-4 font-mono text-xs tracking-wider">
        <div className="flex items-center justify-between gap-4">
          <span className="text-foreground">PTS</span>
          <span className="text-right font-bold tabular-nums">
            {pointCount ? pointCount.toLocaleString() : "—"}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-foreground">Buffer</span>
          <span className="text-right font-bold tabular-nums">
            {bufferSize}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-foreground">Mode</span>
          <span className="text-right font-bold">{capability}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-foreground">Algorithm</span>
          <span className="text-right font-bold">
            {capability === "Severely" || capability === "Bad"
              ? "Sparse"
              : "Dense"}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-foreground">Frame</span>
          <span className="text-right font-bold">Demand</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-foreground">Status</span>
          <span className="text-right font-bold">Ready</span>
        </div>
      </div>
    </section>
  );
};
