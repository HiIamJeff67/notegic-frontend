import { Skeleton } from "@/components/ui/skeleton";

const TimeRailsSkeleton = () => (
  <section className="flex w-full min-w-0 shrink-0 flex-col overflow-hidden rounded-md border border-border/60 bg-card">
    <div className="flex min-h-11 items-center justify-between gap-3 border-b border-border/80 bg-secondary px-3 py-2">
      <div className="flex items-center gap-2">
        <Skeleton className="size-4 rounded-sm" />
        <Skeleton className="h-4 w-20 rounded-sm" />
        <Skeleton className="h-3 w-40 rounded-sm" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-28 rounded-sm" />
        <Skeleton className="h-8 w-16 rounded-sm" />
      </div>
    </div>
    <div className="flex min-w-0">
      <div className="w-40 shrink-0 border-r border-border/60 bg-card">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            className="flex h-20 items-center gap-2 border-b border-border/40 px-3"
            key={index}
          >
            <Skeleton className="size-7 rounded-sm" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-3 w-24 rounded-sm" />
              <Skeleton className="h-2 w-14 rounded-sm" />
            </div>
          </div>
        ))}
      </div>
      <div className="min-w-0 flex-1 overflow-hidden bg-inset">
        <div className="grid h-10 grid-cols-7 border-b border-border/60 bg-secondary">
          {Array.from({ length: 7 }).map((_, index) => (
            <div className="border-r border-border/40 px-3 py-3" key={index}>
              <Skeleton className="h-3 w-12 rounded-sm" />
            </div>
          ))}
        </div>
        <div className="space-y-0">
          {Array.from({ length: 4 }).map((_, rowIndex) => (
            <div
              className="relative h-20 border-b border-border/40"
              key={rowIndex}
            >
              {Array.from({ length: 3 }).map((_, itemIndex) => (
                <Skeleton
                  className="absolute h-7 rounded-sm"
                  key={itemIndex}
                  style={{
                    left: `${8 + itemIndex * 27}%`,
                    top: `${12 + (itemIndex % 2) * 32}px`,
                    width: `${16 + itemIndex * 4}%`,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default TimeRailsSkeleton;
