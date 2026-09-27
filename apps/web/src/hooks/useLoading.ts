import { useContext, useEffect, useRef } from "react";
import { LoadingContext } from "@/providers/LoadingProvider";

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};

export const useRegisterLoadingDependencies = (...loadingStates: boolean[]) => {
  const { registerLoadingDependency, unregisterLoadingDependency } =
    useLoading();
  const dependencyIdRef = useRef<symbol | null>(null);

  if (dependencyIdRef.current === null) {
    dependencyIdRef.current = Symbol("loading-dependency");
  }

  const dependencyId = dependencyIdRef.current;
  const isLoading = loadingStates.some(Boolean);

  useEffect(() => {
    registerLoadingDependency(dependencyId, isLoading);
  }, [dependencyId, isLoading, registerLoadingDependency]);

  useEffect(
    () => () => unregisterLoadingDependency(dependencyId),
    [dependencyId, unregisterLoadingDependency]
  );
};
