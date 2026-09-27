import React, { Suspense, useEffect } from "react";
import RoutineOverviewer from "@/components/core/RoutineOverviewer/RoutineOverviewer";
import LoadingCover from "@/components/covers/LoadingCover/LoadingCover";
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
    <Suspense fallback={<LoadingCover />}>
      <RoutineOverviewer />
    </Suspense>
  );
};

export default RoutinesIndexPage;
