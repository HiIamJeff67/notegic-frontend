import React, { Suspense } from "react";
import StrictLoadingCover from "@/components/covers/LoadingCover/StrictLoadingCover";

const RoutinesLayout = ({ children }: { children: React.ReactNode }) => {
  return <Suspense fallback={<StrictLoadingCover />}>{children}</Suspense>;
};

export default RoutinesLayout;
