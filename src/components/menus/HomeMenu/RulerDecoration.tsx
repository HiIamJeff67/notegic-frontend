const rulerTicks = Array.from({ length: 21 }, (_, index) => index);

export const RulerDecoration = () => (
  <aside
    aria-hidden="true"
    className="pointer-events-none fixed bottom-4 left-3 z-[60] hidden md:bottom-8 md:left-12 md:block"
  >
    <div className="isolate flex h-8 w-28 flex-row justify-between border-b border-foreground text-foreground">
      {rulerTicks.map(tick => (
        <div className="relative h-full min-w-0 flex-1" key={tick}>
          <span
            className={`absolute bottom-0 left-1/2 w-px -translate-x-1/2 bg-foreground ${tick % 4 === 0 ? "h-3" : "h-1.5"}`}
          />
          {tick % 4 === 0 && (
            <span className="absolute bottom-3 left-1/2 -translate-x-1/2 font-mono text-[8px] font-bold tabular-nums">
              {tick * 5}
            </span>
          )}
        </div>
      ))}
    </div>
  </aside>
);
