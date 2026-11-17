// src/components/commons/DeferredSuspense/DeferredSuspense.tsx

import { useDeferredMount } from "@shared/hooks/useDeferredMount";
import { ReactNode, Suspense } from "react";

interface DeferredSuspenseProps {
  trigger: boolean;
  fallback: ReactNode;
  fallbackDelayMs?: number;
  children: ReactNode;
}

export const DeferredSuspense = ({
  trigger,
  fallback,
  fallbackDelayMs = 100,
  children,
}: DeferredSuspenseProps) => {
  const { isLoading } = useDeferredMount(trigger, fallbackDelayMs);

  if (!trigger) return null;

  return (
    <>
      {isLoading ? (
        fallback
      ) : (
        <Suspense fallback={fallback}>{children}</Suspense>
      )}
    </>
  );
};
