import { Skeleton } from "@/components/ui/skeleton";

const CreateRoutineDialogSkeleton = () => (
  <div className="flex flex-col gap-4">
    <div className="flex flex-col gap-2">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-10 w-full rounded-sm" />
    </div>
    <div className="flex flex-col gap-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-24 w-full rounded-sm" />
    </div>
    <Skeleton className="h-16 w-full rounded-sm" />
    <div className="flex gap-4">
      <Skeleton className="h-10 flex-1 rounded-sm" />
      <Skeleton className="h-10 flex-1 rounded-sm" />
    </div>
    <div className="flex gap-4">
      <Skeleton className="h-10 w-56 rounded-sm" />
      <Skeleton className="h-10 w-24 rounded-sm" />
    </div>
  </div>
);

export default CreateRoutineDialogSkeleton;
