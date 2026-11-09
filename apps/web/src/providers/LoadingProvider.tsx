import { WebURLPathDictionary } from "@shared/lib/url/web";
import { useRouterState } from "@tanstack/react-router";
import React, {
  createContext,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import AppLoadingCover from "@/components/covers/LoadingCover/AppLoadingCover";
import { useTranslation } from "@/hooks/useTranslation";

type LoadingLevel = "strict" | "lax";
type LoadingOperation<T> = (setLabel: (label: string) => void) => Promise<T>;

interface LoadingContextType {
  isStrictLoading: boolean;
  isLaxLoading: boolean;
  setIsLaxLoading: (state: boolean) => void;
  startSyncTransactionLoading: <T>(fn: () => T) => T;
  startAsyncTransactionLoading: <T>(
    fn: LoadingOperation<T>,
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
  const { t } = useTranslation();
  const isRoutePending = useRouterState({
    select: state => state.status === "pending",
  });
  const callbackLabel = useRouterState({
    select: state => {
      const path = state.location.pathname.replace(/\/$/, "");
      const { google, github, x, apple } = WebURLPathDictionary.auth.redirect;
      switch (path) {
        case `/${google}`:
          return "workspace.pages.validatingGoogle";
        case `/${github}`:
          return "workspace.pages.validatingGithub";
        case `/${x}`:
          return "workspace.pages.validatingX";
        case `/${apple}`:
          return "workspace.pages.appleRedirectUnavailable";
      }
    },
  });
  const [isStrictTransactionLoading, setIsStrictTransactionLoading] =
    useState(false);
  const [isLaxTransactionLoading, setIsLaxTransactionLoading] = useState(false);
  const [hasLoadingDependencies, setHasLoadingDependencies] = useState(false);
  const [strictLoadingLabel, setStrictLoadingLabel] = useState<string>();

  const strictLoadingCounterRef = useRef<number>(0);
  const laxLoadingCounterRef = useRef<number>(0);
  const loadingDependenciesRef = useRef<Map<symbol, boolean>>(new Map());
  const strictLoadingLabelsRef = useRef(new Map<symbol, string>());

  const isStrictLoading =
    isRoutePending || callbackLabel !== undefined || isStrictTransactionLoading;
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
      fn: LoadingOperation<T>,
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

      const transaction = Symbol();
      const labels = strictLoadingLabelsRef.current;
      let isLoadingActive = true;
      let loadingTimer: NodeJS.Timeout | null = null;
      let errorTimer: NodeJS.Timeout | null = null;

      const stopLoading = () => {
        if (!isLoadingActive) return;

        isLoadingActive = false;
        loadingCounterRef.current = Math.max(0, loadingCounterRef.current - 1);
        setIsTransactionLoading(loadingCounterRef.current > 0);

        if (labels.delete(transaction)) {
          setStrictLoadingLabel(Array.from(labels.values()).at(-1));
        }
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
        let promise = fn(label => {
          if (loadingLevel !== "strict" || !isLoadingActive) return;
          labels.set(transaction, label);
          setStrictLoadingLabel(Array.from(labels.values()).at(-1));
        });

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
      fn: LoadingOperation<T>,
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
      <AppLoadingCover
        isLoading={isStrictLoading}
        label={strictLoadingLabel ?? (callbackLabel && t(callbackLabel))}
      />
      {children}
    </LoadingContext.Provider>
  );
};
