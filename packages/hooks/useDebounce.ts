import { useCallback, useEffect, useRef, useState } from "react";

export const useDebounceValue = <T>(value: T, delay: number = 500) => {
  const [debounceValue, setDebounceValue] = useState<T>(value);
  const latestValue = useRef(value);

  useEffect(() => {
    latestValue.current = value;
    const timeout = setTimeout(() => {
      setDebounceValue(latestValue.current);
    }, delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);

  return debounceValue;
};

export const useDebounceCallback = <
  CallbackType extends (...args: any[]) => any,
>(
  callback: CallbackType,
  delay: number = 500,
  maxWaitCount: number = 10
) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countRef = useRef<number>(0);
  const callbackRef = useRef(callback);

  callbackRef.current = callback;

  const debouncedCallback = useCallback(
    (...args: Parameters<CallbackType>) => {
      countRef.current += 1;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (countRef.current >= maxWaitCount) {
        callbackRef.current(...args);
        countRef.current = 0;
      } else {
        timeoutRef.current = setTimeout(() => {
          callbackRef.current(...args);
          countRef.current = 0;
        }, delay);
      }
    },
    [delay, maxWaitCount]
  );

  return debouncedCallback;
};
