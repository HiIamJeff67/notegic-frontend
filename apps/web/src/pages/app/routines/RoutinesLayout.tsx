import React, { Suspense } from "react";
import LoadingCover from "@/components/covers/LoadingCover/LoadingCover";

const RoutinesLayout = ({ children }: { children: React.ReactNode }) => {
  return <Suspense fallback={<LoadingCover />}>{children}</Suspense>;
};

export default RoutinesLayout;
