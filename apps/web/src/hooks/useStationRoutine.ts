import { useContext } from "react";
import { StationRoutineContext } from "@/providers/StationRoutineProvider/StationRoutineProvider";

export const useStationRoutine = () => {
  const context = useContext(StationRoutineContext);
  if (!context) {
    throw new Error(
      "useStationRoutine must be used within StationRoutineProvider"
    );
  }
  return context;
};
