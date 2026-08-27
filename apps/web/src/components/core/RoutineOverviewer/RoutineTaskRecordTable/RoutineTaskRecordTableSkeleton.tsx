import { Skeleton } from "@/components/ui/skeleton";

const RoutineTaskRecordTableSkeleton = () => (
  <section className="w-full rounded-md border border-border/60 bg-card">
    <header className="flex items-center justify-between gap-3 border-b border-border/80 bg-secondary px-4 py-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-4 w-40 rounded-sm" />
        <Skeleton className="h-5 w-16 rounded-sm" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-28 rounded-sm" />
        <Skeleton className="h-8 w-28 rounded-sm" />
        <Skeleton className="h-8 w-28 rounded-sm" />
      </div>
    </header>
    <div className="p-3">
      <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr_1fr_1fr] gap-2 border-b border-border/60 pb-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton className="h-3 rounded-sm" key={index} />
        ))}
      </div>
      <div className="divide-y divide-border/40">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            className="grid grid-cols-[1.2fr_1fr_1fr_1fr_1fr_1fr] gap-2 py-3"
            key={index}
          >
            {Array.from({ length: 6 }).map((__, cellIndex) => (
              <Skeleton className="h-4 rounded-sm" key={cellIndex} />
            ))}
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default RoutineTaskRecordTableSkeleton;
