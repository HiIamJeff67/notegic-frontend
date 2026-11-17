import { useCallback, useState } from "react";

const MaxTriggerValue = 1e6;

export const useStateTrigger = () => {
  const [, setUpdateTrigger] = useState(0);
  const forceUpdate = useCallback(() => {
    setUpdateTrigger(previous => (previous + 1) % MaxTriggerValue);
  }, []);
  return forceUpdate;
};
