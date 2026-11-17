import { Dispatch, SetStateAction, useCallback, useMemo } from "react";

export const useAnyTypeState = <T>(
  useRawState: [any, Dispatch<SetStateAction<any>>],
  defaultState: T
): [T, (newRaw: SetStateAction<T>) => void] => {
  const state = useMemo(() => {
    return {
      ...defaultState,
      ...useRawState[0],
    } as T;
  }, [defaultState, useRawState[0]]);

  const setState = useCallback(
    (newState: SetStateAction<T>) => {
      if (typeof newState === "function") {
        const fn = newState as (prevState: T) => T;
        useRawState[1](fn(state));
      } else {
        useRawState[1](newState);
      }
    },
    [state, useRawState[1]]
  );

  return [state, setState];
};
