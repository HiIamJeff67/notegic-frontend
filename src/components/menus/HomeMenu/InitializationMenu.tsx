export const InitializationMenu = ({
  maxValue,
  value,
}: {
  value: number;
  maxValue: number;
}) => {
  const safeMaxValue = Math.max(0, maxValue, value);
  const progress =
    safeMaxValue === 0 ? 0 : Math.min(1, Math.max(0, value / safeMaxValue));

  return (
    <div
      aria-label="Initialization progress"
      aria-valuemax={safeMaxValue}
      aria-valuemin={0}
      aria-valuenow={Math.min(value, safeMaxValue)}
      className="h-20 w-full overflow-hidden bg-foreground/10"
      role="progressbar"
    >
      <div
        className="h-full transition-[width] duration-150 ease-linear"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, var(--foreground) 0 6px, var(--background) 6px 12px)",
          width: `${progress * 100}%`,
        }}
      />
    </div>
  );
};
