// src/components/commons/DeferredSuspense/DeferredSuspense.tsx

import { ReactNode, Suspense } from "react";
import { useDeferredMount } from "@/hooks/useDeferredMount";

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
