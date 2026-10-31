import { compareEntityNames } from "@shared/lib/comparisons/compareEntityNames";
import { lazy, Suspense } from "react";
import type { RoutineTaskNode } from "@/providers/StationRoutineProvider/routineTaskNode.type";
import RoutineTaskMenuItemSkeleton from "./RoutineTaskMenuItemSkeleton";

const RoutineTaskMenuItem = lazy(() => import("./RoutineTaskMenuItem"));

interface RoutineTaskMenuProps {
  routineTasks: RoutineTaskNode[];
}

const RoutineTaskMenu = ({ routineTasks }: RoutineTaskMenuProps) => {
  return (
    <>
      <Suspense fallback={<RoutineTaskMenuItemSkeleton />}>
        {[...routineTasks].sort(compareEntityNames).map(routineTask => (
          <Suspense
            fallback={<RoutineTaskMenuItemSkeleton />}
            key={routineTask.id}
          >
            <RoutineTaskMenuItem routineTask={routineTask} />
          </Suspense>
        ))}
      </Suspense>
    </>
  );
};

export default RoutineTaskMenu;
