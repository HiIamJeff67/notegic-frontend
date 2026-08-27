import { Skeleton } from "@/components/ui/skeleton";

const RoutineScopeBarSkeleton = () => (
  <div className="flex h-10 w-full items-center justify-between gap-3 px-3">
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <Skeleton className="h-7 w-44 rounded-sm" />
      <Skeleton className="h-7 w-20 rounded-sm" />
      <Skeleton className="h-7 w-20 rounded-sm" />
      <Skeleton className="h-7 w-20 rounded-sm" />
    </div>
    <div className="flex shrink-0 items-center gap-2">
      <Skeleton className="h-7 w-20 rounded-sm" />
      <Skeleton className="h-7 w-24 rounded-sm" />
      <Skeleton className="h-7 w-24 rounded-sm" />
    </div>
  </div>
);

export default RoutineScopeBarSkeleton;
