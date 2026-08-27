import GridBackground from "@/components/backgrounds/GridBackground/GridBackground";
import { Skeleton } from "@/components/ui/skeleton";
import RoutineChartsSkeleton from "./RoutineCharts/RoutineChartsSkeleton";
import RoutineScopeBarSkeleton from "./RoutineScopeBar/RoutineScopeBarSkeleton";
import RoutineTableSkeleton from "./RoutineTable/RoutineTableSkeleton";
import RoutineTaskRecordTableSkeleton from "./RoutineTaskRecordTable/RoutineTaskRecordTableSkeleton";
import RoutineTaskTableSkeleton from "./RoutineTaskTable/RoutineTaskTableSkeleton";
import TimeRailsSkeleton from "./TimeRails/TimeRailsSkeleton";

const RoutineOverviewerContentSkeleton = ({
  headerLeft = 0,
}: {
  headerLeft?: number | string;
}) => (
  <div className="flex h-full min-h-0 w-full flex-col items-start overflow-hidden bg-inset bg-cover bg-center bg-no-repeat">
    <header
      className="fixed top-0 right-0 z-20 h-10 border-inset/10 bg-inset/75 backdrop-blur-md"
      style={{ left: headerLeft }}
    >
      <RoutineScopeBarSkeleton />
    </header>
    <div className="custom-scrollbar flex h-full min-h-0 w-full flex-col overflow-x-hidden overflow-y-auto pt-10">
      <div className="relative z-10 h-60 w-full shrink-0">
        <GridBackground className="relative z-10 h-full w-full shrink-0">
          <div className="absolute right-0 bottom-0 m-2">
            <Skeleton className="size-8 rounded-full" />
          </div>
        </GridBackground>
      </div>
      <div className="flex w-full flex-col gap-4 overflow-x-hidden p-4">
        <TimeRailsSkeleton />
        <RoutineChartsSkeleton />
        <RoutineTableSkeleton />
        <RoutineTaskTableSkeleton />
        <RoutineTaskRecordTableSkeleton />
      </div>
    </div>
  </div>
);

export default RoutineOverviewerContentSkeleton;
