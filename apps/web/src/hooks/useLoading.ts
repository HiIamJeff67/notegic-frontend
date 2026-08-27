import { useContext, useEffect } from "react";
import { LoadingContext } from "@/providers/LoadingProvider";

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};

export const useRegisterLoadingDependencies = (
  ...getters: Array<() => boolean>
) => {
  const { registerLoadingDependencies } = useLoading();

  useEffect(() => {
    const unregister = registerLoadingDependencies(...getters);
    return unregister;
  }, getters);
};
