import React, { Suspense } from "react";
import StrictLoadingCover from "@/components/covers/LoadingCover/StrictLoadingCover";
import RoutineOverviewerContent from "./RoutineOverviewerContent";

const RoutineOverviewer = () => {
  return (
    <Suspense fallback={<StrictLoadingCover />}>
      <RoutineOverviewerContent />
    </Suspense>
  );
};

export default RoutineOverviewer;
