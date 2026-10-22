import { Skeleton } from "@/components/ui/skeleton";

const RoutineTableSkeleton = () => (
  <section className="w-full min-w-0 rounded-md border border-border/60 bg-card">
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 bg-secondary px-4 py-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-4 w-24 rounded-sm" />
        <Skeleton className="h-5 w-16 rounded-sm" />
      </div>
      <div className="flex min-w-0 items-center gap-2">
        <Skeleton className="h-8 w-40 min-w-0 rounded-sm" />
        <Skeleton className="size-8 shrink-0 rounded-sm" />
        <Skeleton className="size-8 shrink-0 rounded-sm" />
      </div>
    </header>
    <div className="overflow-x-auto p-3">
      <div className="grid min-w-[56rem] grid-cols-[1.6fr_1.4fr_1.2fr_1.85fr_1.2fr_0.7fr_0.7fr_48px] gap-3 border-b border-border/60 pb-2">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton className="h-3 rounded-sm" key={index} />
        ))}
      </div>
      <div className="divide-y divide-border/40">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            className="grid min-w-[56rem] grid-cols-[1.6fr_1.4fr_1.2fr_1.85fr_1.2fr_0.7fr_0.7fr_48px] items-center gap-3 py-3"
            key={index}
          >
            {Array.from({ length: 7 }).map((__, cellIndex) => (
              <Skeleton className="h-4 rounded-sm" key={cellIndex} />
            ))}
            <Skeleton className="size-8 rounded-sm" />
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default RoutineTableSkeleton;
