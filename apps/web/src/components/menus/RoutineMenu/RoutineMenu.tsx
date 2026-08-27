import type { RoutineNode } from "@shared/types/routineNode.type";
import type { StationNode } from "@shared/types/stationNode.type";
import { lazy, Suspense } from "react";
import RoutineMenuItemSkeleton from "@/components/menus/RoutineMenu/RoutineMenuItemSkeleton";
import { useStationRoutine } from "@/hooks";
import RoutineMenuItem from "./RoutineMenuItem";

interface RoutineMenuProps {
  routines: RoutineNode[];
  station?: StationNode;
}

const RoutineMenu = ({ routines, station }: RoutineMenuProps) => {
  const stationRoutineManager = useStationRoutine();

  return (
    <>
      <Suspense fallback={<RoutineMenuItemSkeleton />}>
        {routines.map(routine => {
          const currentStation =
            station ?? stationRoutineManager.getStationById(routine.stationId);
          if (!currentStation) return null;

          return (
            <Suspense fallback={<RoutineMenuItemSkeleton />} key={routine.id}>
              <RoutineMenuItem station={currentStation} routine={routine} />
            </Suspense>
          );
        })}
      </Suspense>
    </>
  );
};

export default RoutineMenu;
