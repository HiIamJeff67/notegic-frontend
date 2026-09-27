import React, { Suspense } from "react";
import LoadingCover from "@/components/covers/LoadingCover/LoadingCover";
import RoutineOverviewerContent from "./RoutineOverviewerContent";

const RoutineOverviewer = () => {
  return (
    <Suspense fallback={<LoadingCover />}>
      <RoutineOverviewerContent />
    </Suspense>
  );
};

export default RoutineOverviewer;
