import { Skeleton } from "@/components/ui/skeleton";

const CreateRoutineTagDialogSkeleton = () => (
  <div className="flex flex-col gap-4">
    <div className="flex flex-col gap-2">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-10 w-full rounded-sm" />
    </div>
    <div className="flex items-end gap-3">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="size-10 rounded-sm" />
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-14" />
        <Skeleton className="size-10 rounded-sm" />
      </div>
    </div>
  </div>
);

export default CreateRoutineTagDialogSkeleton;
