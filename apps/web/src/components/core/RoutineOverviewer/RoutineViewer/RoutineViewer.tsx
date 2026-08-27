import type { UUID } from "crypto";
import { Suspense, useEffect } from "react";
import StrictLoadingCover from "@/components/covers/LoadingCover/StrictLoadingCover";
import { useStationRoutine } from "@/hooks";
import RoutineOverviewerContent from "../RoutineOverviewerContent";

interface RoutineViewerProps {
  stationId: UUID;
}

const RoutineViewer = ({ stationId }: RoutineViewerProps) => {
  const stationRoutineManager = useStationRoutine();

  useEffect(() => {
    stationRoutineManager.setViewMode("station");
    stationRoutineManager.setActiveStationId(stationId);

    return () => {
      stationRoutineManager.setViewMode("overview");
      stationRoutineManager.setActiveStationId(null);
    };
  }, [stationId]);

  return (
    <Suspense fallback={<StrictLoadingCover />}>
      <RoutineOverviewerContent showStationScope={false} />
    </Suspense>
  );
};

export default RoutineViewer;
