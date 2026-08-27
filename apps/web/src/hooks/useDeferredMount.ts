import { useEffect, useState, useTransition } from "react";

export const useDeferredMount = (
  trigger: boolean,
  fallbackDelayMs: number = 100
): { isLoading: boolean } => {
  const [isPending, startTransition] = useTransition();
  const [shouldMount, setShouldMount] = useState(false);

  useEffect(() => {
    if (trigger) {
      setShouldMount(false);

      const timer = setTimeout(() => {
        startTransition(() => {
          setShouldMount(true);
        });
      }, fallbackDelayMs);

      return () => clearTimeout(timer);
    } else {
      setShouldMount(false);
    }
  }, [trigger, fallbackDelayMs]);

  const isLoading = trigger && (!shouldMount || isPending);

  return { isLoading };
};
