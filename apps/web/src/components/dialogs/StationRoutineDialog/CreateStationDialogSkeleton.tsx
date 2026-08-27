import { Skeleton } from "@/components/ui/skeleton";

const CreateStationDialogSkeleton = () => (
  <div className="flex flex-col gap-4">
    <div className="flex flex-col gap-2">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-10 w-full rounded-sm" />
    </div>
    <div className="flex flex-col gap-2">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-24 w-full rounded-sm" />
    </div>
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="size-10 rounded-sm" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-10 w-full rounded-sm" />
      </div>
    </div>
  </div>
);

export default CreateStationDialogSkeleton;
