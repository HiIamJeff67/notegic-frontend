import { Skeleton } from "@/components/ui/skeleton";

const CreateRoutineTaskDialogSkeleton = () => (
  <div className="flex max-h-[calc(90vh-112px)] flex-col gap-4 overflow-y-auto px-1 pb-4">
    <div className="flex flex-col gap-2">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-10 w-full rounded-sm" />
    </div>
    <div className="flex flex-col gap-3 sm:flex-row">
      <Skeleton className="h-10 flex-[1.35] rounded-sm" />
      <Skeleton className="h-10 flex-1 rounded-sm" />
    </div>
    <div className="flex flex-col gap-2">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-10 w-full rounded-sm" />
      <Skeleton className="h-4 w-3/4" />
    </div>
    <div className="flex flex-col gap-2">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-40 w-full rounded-sm" />
      <Skeleton className="h-16 w-full rounded-sm" />
    </div>
    <div className="flex gap-4">
      <Skeleton className="h-10 w-40 rounded-sm" />
      <Skeleton className="h-10 w-40 rounded-sm" />
    </div>
  </div>
);

export default CreateRoutineTaskDialogSkeleton;
