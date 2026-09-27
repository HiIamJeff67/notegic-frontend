import { useRouterState } from "@tanstack/react-router";
import React, {
  createContext,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import AppLoadingCover from "@/components/covers/LoadingCover/AppLoadingCover";

type LoadingLevel = "strict" | "lax";

interface LoadingContextType {
  isStrictLoading: boolean;
  isLaxLoading: boolean;
  setIsLaxLoading: (state: boolean) => void;
  startSyncTransactionLoading: <T>(fn: () => T) => T;
  startAsyncTransactionLoading: <T>(
    fn: () => Promise<T>,
    level?: LoadingLevel,
    loadingTimeout?: number,
    errorTimeout?: number
  ) => Promise<T>;
  registerLoadingDependency: (id: symbol, isLoading: boolean) => void;
  unregisterLoadingDependency: (id: symbol) => void;
}

export const LoadingContext = createContext<LoadingContextType | undefined>(
  undefined
);

export const LoadingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const isRoutePending = useRouterState({
    select: state => state.status === "pending",
  });
  const [isStrictTransactionLoading, setIsStrictTransactionLoading] =
    useState(false);
  const [isLaxTransactionLoading, setIsLaxTransactionLoading] = useState(false);
  const [hasLoadingDependencies, setHasLoadingDependencies] = useState(false);

  const strictLoadingCounterRef = useRef<number>(0);
  const laxLoadingCounterRef = useRef<number>(0);
  const loadingDependenciesRef = useRef<Map<symbol, boolean>>(new Map());

  const isStrictLoading = isRoutePending || isStrictTransactionLoading;
  const isLaxLoading =
    isStrictLoading || isLaxTransactionLoading || hasLoadingDependencies;

  const setIsLaxLoading = useCallback((state: boolean) => {
    if (state) {
      laxLoadingCounterRef.current++;
    } else {
      laxLoadingCounterRef.current = Math.max(
        0,
        laxLoadingCounterRef.current - 1
      );
    }

    setIsLaxTransactionLoading(laxLoadingCounterRef.current > 0);
  }, []);

  const startSyncTransactionLoading = useCallback(<T,>(fn: () => T) => {
    strictLoadingCounterRef.current++;
    setIsStrictTransactionLoading(true);

    try {
      return fn();
    } finally {
      strictLoadingCounterRef.current = Math.max(
        0,
        strictLoadingCounterRef.current - 1
      );
      setIsStrictTransactionLoading(strictLoadingCounterRef.current > 0);
    }
  }, []);

  const runAsyncTransactionLoading = useCallback(
    async <T,>(
      fn: () => Promise<T>,
      loadingLevel: LoadingLevel,
      loadingTimeout: number,
      errorTimeout: number
    ) => {
      const loadingCounterRef =
        loadingLevel === "strict"
          ? strictLoadingCounterRef
          : laxLoadingCounterRef;
      const setIsTransactionLoading =
        loadingLevel === "strict"
          ? setIsStrictTransactionLoading
          : setIsLaxTransactionLoading;

      loadingCounterRef.current++;
      setIsTransactionLoading(true);

      let isLoadingActive = true;
      let loadingTimer: NodeJS.Timeout | null = null;
      let errorTimer: NodeJS.Timeout | null = null;

      const stopLoading = () => {
        if (!isLoadingActive) return;

        isLoadingActive = false;
        loadingCounterRef.current = Math.max(0, loadingCounterRef.current - 1);
        setIsTransactionLoading(loadingCounterRef.current > 0);

        if (loadingTimer) clearTimeout(loadingTimer);
        if (errorTimer) clearTimeout(errorTimer);
      };

      if (loadingTimeout !== Infinity) {
        loadingTimer = setTimeout(() => {
          if (isLoadingActive) {
            console.warn(
              `[LoadingProvider] Loading UI timed out after ${loadingTimeout} ms`
            );
            stopLoading();
          }
        }, loadingTimeout);
      }

      try {
        let promise = fn();

        if (errorTimeout !== Infinity) {
          promise = Promise.race([
            promise,
            new Promise<T>((_, reject) => {
              errorTimer = setTimeout(() => {
                reject(
                  new Error(
                    `Transaction hard timed out after ${errorTimeout}ms`
                  )
                );
              }, errorTimeout);
            }),
          ]);
        }

        return await promise;
      } finally {
        stopLoading();
      }
    },
    []
  );

  const startAsyncTransactionLoading = useCallback(
    <T,>(
      fn: () => Promise<T>,
      level: LoadingLevel = "strict",
      loadingTimeout: number = Infinity,
      errorTimeout: number = Infinity
    ) => runAsyncTransactionLoading(fn, level, loadingTimeout, errorTimeout),
    [runAsyncTransactionLoading]
  );

  const registerLoadingDependency = useCallback(
    (id: symbol, isLoading: boolean) => {
      loadingDependenciesRef.current.set(id, isLoading);
      setHasLoadingDependencies(
        Array.from(loadingDependenciesRef.current.values()).some(Boolean)
      );
    },
    []
  );

  const unregisterLoadingDependency = useCallback((id: symbol) => {
    loadingDependenciesRef.current.delete(id);
    setHasLoadingDependencies(
      Array.from(loadingDependenciesRef.current.values()).some(Boolean)
    );
  }, []);

  const contextValue = useMemo<LoadingContextType>(
    () => ({
      isStrictLoading,
      isLaxLoading,
      setIsLaxLoading,
      startSyncTransactionLoading,
      startAsyncTransactionLoading,
      registerLoadingDependency,
      unregisterLoadingDependency,
    }),
    [
      isStrictLoading,
      isLaxLoading,
      setIsLaxLoading,
      startSyncTransactionLoading,
      startAsyncTransactionLoading,
      registerLoadingDependency,
      unregisterLoadingDependency,
    ]
  );

  return (
    <LoadingContext.Provider value={contextValue}>
      <AppLoadingCover isLoading={isStrictLoading} />
      {children}
    </LoadingContext.Provider>
  );
};
