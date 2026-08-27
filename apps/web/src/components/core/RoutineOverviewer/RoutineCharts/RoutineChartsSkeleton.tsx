import { Skeleton } from "@/components/ui/skeleton";

const RoutineChartsSkeleton = () => (
  <section className="flex w-full min-w-0 shrink-0 flex-col overflow-hidden rounded-md border border-border/60 bg-card">
    <header className="flex items-center justify-between gap-3 border-b border-border/60 bg-secondary px-4 py-3">
      <Skeleton className="h-4 w-16 rounded-sm" />
      <Skeleton className="h-3 w-6 rounded-sm" />
    </header>
    <div className="grid min-w-0 grid-cols-1 gap-4 p-4 xl:grid-cols-2">
      {Array.from({ length: 2 }).map((_, index) => (
        <div
          className="rounded-md border border-border/60 bg-secondary p-4"
          key={index}
        >
          <div className="mb-4 flex items-center justify-between">
            <Skeleton className="h-4 w-28 rounded-sm" />
            <Skeleton className="h-8 w-24 rounded-sm" />
          </div>
          <Skeleton className="h-44 w-full rounded-sm" />
        </div>
      ))}
    </div>
  </section>
);

export default RoutineChartsSkeleton;
