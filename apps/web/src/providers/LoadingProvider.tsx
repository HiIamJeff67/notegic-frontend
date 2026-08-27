import React, { createContext, useRef, useState } from "react";

interface LoadingContextType {
  isStrictLoading: boolean;
  isLaxLoading: boolean;
  setIsLaxLoading: (state: boolean) => void;
  startSyncTransactionLoading: <T>(fn: () => T) => T;
  startAsyncTransactionLoading: <T>(
    fn: () => Promise<T>,
    loadingTimeout?: number,
    errorTimeout?: number
  ) => Promise<T>;
  registerLoadingDependencies: (...getters: Array<() => boolean>) => () => void;
}

export const LoadingContext = createContext<LoadingContextType | undefined>(
  undefined
);

export const LoadingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [_isLaxLoading, _setIsLaxLoading] = useState<boolean>(false);

  const laxLoadingCounterRef = useRef<number>(0);
  const loadingDependenciesRef = useRef<Set<() => boolean>>(new Set());

  const setIsLaxLoading = (state: boolean) => {
    if (state) {
      _setIsLaxLoading(true);
      laxLoadingCounterRef.current++;
    } else {
      laxLoadingCounterRef.current--;
      if (laxLoadingCounterRef.current === 0) {
        _setIsLaxLoading(false);
      }
    }
  };

  const startSyncTransactionLoading = <T,>(fn: () => T) => {
    _setIsLaxLoading(true);
    laxLoadingCounterRef.current++;
    try {
      return fn();
    } finally {
      laxLoadingCounterRef.current = Math.max(
        0,
        laxLoadingCounterRef.current - 1
      );
      if (laxLoadingCounterRef.current === 0) {
        _setIsLaxLoading(false);
      }
    }
  };

  const startAsyncTransactionLoading = async <T,>(
    fn: () => Promise<T>,
    loadingTimeout: number = Infinity,
    errorTimeout: number = Infinity
  ) => {
    _setIsLaxLoading(true);
    laxLoadingCounterRef.current++;

    let isLoadingActive: boolean = true;
    let loadingTimer: NodeJS.Timeout | null = null;
    let errorTimer: NodeJS.Timeout | null = null;

    const stopLoading = () => {
      if (isLoadingActive) {
        isLoadingActive = false;
        laxLoadingCounterRef.current = Math.max(
          0,
          laxLoadingCounterRef.current - 1
        );
        if (laxLoadingCounterRef.current === 0) {
          _setIsLaxLoading(false);
        }
        if (loadingTimer) clearTimeout(loadingTimer);
        if (errorTimer) clearTimeout(errorTimer);
      }
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
                new Error(`Transaction hard timed out after ${errorTimeout}ms`)
              );
            }, errorTimeout);
          }),
        ]);
      }

      const result = await promise;

      // resolve the loading states first before heavy response or result
      // from the async function being returned
      stopLoading();

      return result;
    } catch (error) {
      throw error;
    } finally {
      stopLoading();
    }
  };

  const registerLoadingDependencies = (...getters: Array<() => boolean>) => {
    getters.forEach(getter => loadingDependenciesRef.current.add(getter));
    return () => {
      // return a clean up function
      getters.forEach(getter => loadingDependenciesRef.current.delete(getter));
    };
  };

  const contextValue: LoadingContextType = {
    isStrictLoading: _isLaxLoading,
    isLaxLoading: _isLaxLoading,
    setIsLaxLoading: setIsLaxLoading,
    startSyncTransactionLoading: startSyncTransactionLoading,
    startAsyncTransactionLoading: startAsyncTransactionLoading,
    registerLoadingDependencies: registerLoadingDependencies,
  };

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
    </LoadingContext.Provider>
  );
};
