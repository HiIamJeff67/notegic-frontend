import type { UUID } from "crypto";
import { useEffect } from "react";
import RoutineViewer from "@/components/core/RoutineOverviewer/RoutineViewer/RoutineViewer";
import { useStationRoutine, useUser } from "@/hooks";

interface RoutinesPageProps {
  stationId: UUID;
}

const RoutinesPage = ({ stationId }: RoutinesPageProps) => {
  const { initializeStationRoutineData } = useStationRoutine();
  const { userData } = useUser();

  useEffect(() => {
    if (!userData) return;

    void initializeStationRoutineData().catch(error =>
      console.error("failed to initialize routines data", error)
    );
  }, [initializeStationRoutineData, userData?.publicId]);

  return <RoutineViewer stationId={stationId} />;
};

export default RoutinesPage;
