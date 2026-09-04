import { RoutineTaskRecordStatus } from "@shared/api/interfaces/enums";
import { cn } from "@shared/util/utils";

interface RoutineTaskStatusDotProps {
  className?: string;
  status?: RoutineTaskRecordStatus | null;
}

const RoutineTaskStatusDot = ({
  className,
  status = RoutineTaskRecordStatus.Waiting,
}: RoutineTaskStatusDotProps) => {
  const statusClassName =
    status === RoutineTaskRecordStatus.Waiting
      ? "bg-slate-400"
      : status === RoutineTaskRecordStatus.Ready
        ? "bg-blue-500"
        : status === RoutineTaskRecordStatus.Running
          ? "animate-pulse bg-sky-500"
          : status === RoutineTaskRecordStatus.Success
            ? "bg-emerald-500"
            : status === RoutineTaskRecordStatus.Failed
              ? "bg-red-500"
              : status === RoutineTaskRecordStatus.Blocked
                ? "bg-amber-500"
                : status === RoutineTaskRecordStatus.Cancel
                  ? "bg-zinc-500"
                  : "bg-muted-foreground";

  return (
    <span
      aria-hidden="true"
      className={cn("size-2 shrink-0 rounded-full", statusClassName, className)}
    />
  );
};

export default RoutineTaskStatusDot;
