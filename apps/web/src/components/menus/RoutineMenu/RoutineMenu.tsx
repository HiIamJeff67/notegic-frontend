import { compareEntityNames } from "@shared/lib/comparisons/compareEntityNames";
import { lazy, Suspense } from "react";
import RoutineMenuItemSkeleton from "@/components/menus/RoutineMenu/RoutineMenuItemSkeleton";
import { useStationRoutine } from "@/hooks";
import type { RoutineNode } from "@/providers/StationRoutineProvider/routineNode.type";
import type { StationNode } from "@/providers/StationRoutineProvider/stationNode.type";
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
        {[...routines].sort(compareEntityNames).map(routine => {
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
