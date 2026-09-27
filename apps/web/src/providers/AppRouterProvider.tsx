import {
  useLocation,
  useNavigate,
  useParams,
  useRouter,
} from "@tanstack/react-router";
import { createContext, useCallback, useEffect, useMemo, useRef } from "react";
import { useLoading } from "@/hooks/useLoading";

export interface AppRouterStateContextType {
  params: Record<string, string>;
}

export interface AppRouterActionsContextType {
  isSamePath: (a: string, b: string) => boolean;
  getCurrentPath: () => string;
  getPrevPaths: () => string[];
  push: (path: string) => void;
  forceNavigate: (path: string) => void;
  replace: (path: string) => void;
  back: (steps?: number) => void;
  forward: (steps?: number) => void;
  refresh: () => void;
}

interface AppRouterContextType
  extends AppRouterStateContextType,
    AppRouterActionsContextType {}

export const AppRouterContext = createContext<AppRouterContextType | undefined>(
  undefined
);
export const AppRouterStateContext = createContext<
  AppRouterStateContextType | undefined
>(undefined);
export const AppRouterActionsContext = createContext<
  AppRouterActionsContextType | undefined
>(undefined);

export const AppRouterProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const router = useRouter();
  const { startAsyncTransactionLoading } = useLoading();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams({ strict: false });

  const prevPathsRef = useRef<string[]>([]);

  const isSamePath = useCallback((a: string, b: string): boolean => {
    if (a[0] === "/") {
      return b[0] === "/" ? a === b : a === "/" + b;
    }
    return b[0] === "/" ? "/" + a === b : a === b;
  }, []);

  const getCurrentPath = useCallback((): string => {
    const searchParamsString = Object.keys(location.search).length
      ? "?" + new URLSearchParams(location.search).toString()
      : "";
    return location.pathname + searchParamsString;
  }, [location.pathname, location.search]);

  const getPrevPaths = useCallback((): string[] => {
    return [...prevPathsRef.current];
  }, []);

  useEffect(() => {
    const currentPath = getCurrentPath();
    const prevPath = prevPathsRef.current[prevPathsRef.current.length - 1];

    if (currentPath !== prevPath) {
      prevPathsRef.current.push(currentPath);
    }
  }, [getCurrentPath]);

  const push = useCallback(
    (path: string) => {
      if (!isSamePath(getCurrentPath(), path)) {
        void navigate({ to: path.startsWith("/") ? path : `/${path}` });
      }
    },
    [getCurrentPath, isSamePath, navigate]
  );

  const forceNavigate = useCallback(
    (path: string) => {
      if (!isSamePath(getCurrentPath(), path)) {
        window.location.href = path;
      }
    },
    [getCurrentPath, isSamePath]
  );

  const replace = useCallback(
    (path: string) => {
      if (!isSamePath(getCurrentPath(), path)) {
        void navigate({
          to: path.startsWith("/") ? path : `/${path}`,
          replace: true,
        });
      }
    },
    [getCurrentPath, isSamePath, navigate]
  );

  const back = useCallback((steps: number = 1): void => {
    while (steps-- > 0) window.history.back();
  }, []);

  const forward = useCallback((steps: number = 1): void => {
    while (steps-- > 0) window.history.forward();
  }, []);

  const refresh = useCallback((): void => {
    void startAsyncTransactionLoading(() => router.invalidate({ sync: true }));
  }, [router, startAsyncTransactionLoading]);

  const stateValue = useMemo<AppRouterStateContextType>(
    () => ({
      params: params as Record<string, string>,
    }),
    [params]
  );

  const actionsValue = useMemo<AppRouterActionsContextType>(
    () => ({
      isSamePath: isSamePath,
      getCurrentPath: getCurrentPath,
      getPrevPaths: getPrevPaths,
      push: push,
      forceNavigate: forceNavigate,
      replace: replace,
      back: back,
      forward: forward,
      refresh: refresh,
    }),
    [
      back,
      forceNavigate,
      forward,
      getCurrentPath,
      getPrevPaths,
      isSamePath,
      push,
      refresh,
      replace,
    ]
  );

  const contextValue = useMemo<AppRouterContextType>(
    () => ({ ...stateValue, ...actionsValue }),
    [stateValue, actionsValue]
  );

  return (
    <AppRouterStateContext.Provider value={stateValue}>
      <AppRouterActionsContext.Provider value={actionsValue}>
        <AppRouterContext.Provider value={contextValue}>
          {children}
        </AppRouterContext.Provider>
      </AppRouterActionsContext.Provider>
    </AppRouterStateContext.Provider>
  );
};
