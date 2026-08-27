import type { RoutineTaskNode } from "@shared/types/routineTaskNode.type";
import { lazy, Suspense } from "react";
import RoutineTaskMenuItemSkeleton from "./RoutineTaskMenuItemSkeleton";

const RoutineTaskMenuItem = lazy(() => import("./RoutineTaskMenuItem"));

interface RoutineTaskMenuProps {
  routineTasks: RoutineTaskNode[];
}

const RoutineTaskMenu = ({ routineTasks }: RoutineTaskMenuProps) => {
  return (
    <>
      <Suspense fallback={<RoutineTaskMenuItemSkeleton />}>
        {routineTasks.map(routineTask => (
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
