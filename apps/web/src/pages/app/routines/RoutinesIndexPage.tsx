import React, { Suspense, useEffect } from "react";
import RoutineOverviewer from "@/components/core/RoutineOverviewer/RoutineOverviewer";
import StrictLoadingCover from "@/components/covers/LoadingCover/StrictLoadingCover";
import { useStationRoutine, useUser } from "@/hooks";

const RoutinesIndexPage = () => {
  const { initializeStationRoutineData } = useStationRoutine();
  const { userData } = useUser();

  useEffect(() => {
    if (!userData) return;

    void initializeStationRoutineData().catch(error =>
      console.error("failed to initialize routines data", error)
    );
  }, [initializeStationRoutineData, userData?.publicId]);

  return (
    <Suspense fallback={<StrictLoadingCover />}>
      <RoutineOverviewer />
    </Suspense>
  );
};

export default RoutinesIndexPage;
