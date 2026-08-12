const rulerTicks = Array.from({ length: 21 }, (_, index) => index);

export const RulerDecoration = () => (
  <aside
    aria-hidden="true"
    className="pointer-events-none fixed left-3 top-1/2 z-[60] hidden -translate-y-1/2 md:left-12 md:block"
  >
    <div className="isolate flex h-80 w-24 flex-col justify-between border-l-2 border-foreground text-foreground">
      {rulerTicks.map(tick => (
        <div
          className="flex h-2 shrink-0 -translate-x-px items-center gap-2"
          key={tick}
        >
          <span
            className={`h-0.5 bg-foreground ${tick % 4 === 0 ? "w-6" : "w-3"}`}
          />
          {tick % 4 === 0 && (
            <span className="font-mono text-xs font-bold tabular-nums">
              {tick * 5}
            </span>
          )}
        </div>
      ))}
    </div>
  </aside>
);
