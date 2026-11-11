import type { UUID } from "crypto";
import { useEffect } from "react";
import RoutineViewer from "@/components/core/RoutineOverviewer/RoutineViewer/RoutineViewer";
import { useStationRoutine, useUser } from "@/hooks";
import { usePageTitle } from "@/hooks/usePageTitle";
import { pageTitle } from "@/seo/pageTitle";

interface RoutinesPageProps {
  stationId: UUID;
}

const RoutinesPage = ({ stationId }: RoutinesPageProps) => {
  const { initializeStationRoutineData, stations } = useStationRoutine();
  const stationName = stations.find(station => station.id === stationId)?.name;

  usePageTitle(pageTitle(stationName || "Routines"));

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
