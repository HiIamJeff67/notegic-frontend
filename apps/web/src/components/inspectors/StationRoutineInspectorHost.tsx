import { useStationRoutine } from "@/hooks";
import RoutineInspector from "./RoutineInspector";
import RoutineTagInspector from "./RoutineTagInspector";
import RoutineTaskInspector from "./RoutineTaskInspector";
import StationInspector from "./StationInspector";

const StationRoutineInspectorHost = () => {
  const stationRoutineManager = useStationRoutine();
  const inspectorTarget = stationRoutineManager.inspectorTarget;

  if (inspectorTarget === null) return null;

  if (inspectorTarget.type === "station") {
    return (
      <StationInspector
        stationId={inspectorTarget.id}
        isOpen
        onClose={stationRoutineManager.closeInspector}
      />
    );
  }

  if (inspectorTarget.type === "routine") {
    return (
      <RoutineInspector
        routineId={inspectorTarget.id}
        isOpen
        onClose={stationRoutineManager.closeInspector}
      />
    );
  }

  if (inspectorTarget.type === "routineTag") {
    return (
      <RoutineTagInspector
        routineTagId={inspectorTarget.id}
        isOpen
        onClose={stationRoutineManager.closeInspector}
      />
    );
  }

  return (
    <RoutineTaskInspector
      routineTaskId={inspectorTarget.id}
      isOpen
      onClose={stationRoutineManager.closeInspector}
    />
  );
};

export default StationRoutineInspectorHost;
